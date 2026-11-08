# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Cliente mínimo de ElevenLabs para cualquier proyecto: voz con tiempos por palabra, efectos y música.

  uv run elevenlabs.py voz <voice_id> "<texto>" <salida.wav> [--estabilidad 0.55] [--modelo eleven_v4]
  uv run elevenlabs.py efecto "<prompt en inglés>" <segundos> <salida.mp3> [--influencia 0.6] [--toma 0]
  uv run elevenlabs.py musica <plan.json> <salida.mp3> [--toma 0]
  uv run elevenlabs.py plan                                     plan y créditos libres

La clave solo se lee de la variable de entorno ELEVENLABS_API_KEY (en Windows también del registro
de usuario, por si la terminal se abrió antes del `setx`). Nunca se escribe ni se imprime.
Cada petición pagada se guarda en una caché por hash de sus parámetros (--cache, por defecto
./.cache-elevenlabs): repetir la misma petición no vuelve a cobrar. Para otra toma del mismo
efecto o música, cambia --toma.

`voz` deja junto al wav un .json con las palabras y sus tiempos en segundos:
  {"words": [{"word": "Nos", "start": 0.12, "end": 0.31}, ...]}
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path

API = 'https://api.elevenlabs.io'


def clave() -> str:
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k and os.name == 'nt':
        import winreg

        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Environment') as h:
                k = winreg.QueryValueEx(h, 'ELEVENLABS_API_KEY')[0]
        except OSError:
            k = None
    if not k:
        raise SystemExit('Falta ELEVENLABS_API_KEY. En Windows: setx ELEVENLABS_API_KEY "tu-clave" y abre otra terminal. En macOS o Linux: export ELEVENLABS_API_KEY="tu-clave".')
    return k


def pedir(metodo: str, ruta: str, cuerpo=None, query=None) -> bytes:
    url = API + ruta + ('?' + urllib.parse.urlencode(query) if query else '')
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    for intento in range(5):
        req = urllib.request.Request(url, data=datos, method=metodo, headers={'xi-api-key': clave(), 'Content-Type': 'application/json', 'Accept': '*/*'})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and intento < 4:
                time.sleep(2 ** intento + 0.5)
                continue
            raise SystemExit(f'ElevenLabs {e.code}: {e.read()[:400].decode(errors="replace")}')
    raise SystemExit('ElevenLabs no responde')


def cache(carpeta: Path, tipo: str, params: dict, ext: str) -> Path:
    h = hashlib.sha256(json.dumps(params, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]
    carpeta.mkdir(parents=True, exist_ok=True)
    return carpeta / f'{tipo}-{h}.{ext}'


def palabras(al: dict) -> list[dict]:
    """Junta los caracteres de la alineación en palabras con su inicio y su fin."""
    out, cur, ini, fin = [], '', None, None
    for ch, s, e in zip(al.get('characters', []), al.get('character_start_times_seconds', []), al.get('character_end_times_seconds', [])):
        if ch.isspace():
            if cur:
                out.append({'word': cur, 'start': ini, 'end': fin})
            cur, ini = '', None
            continue
        if ini is None:
            ini = s
        cur += ch
        fin = e
    if cur:
        out.append({'word': cur, 'start': ini, 'end': fin})
    return out


def voz(a, cdir: Path):
    cuerpo = {'text': a.texto, 'model_id': a.modelo, 'voice_settings': {'stability': a.estabilidad}}
    if a.modelo != 'eleven_multilingual_v2':
        cuerpo['language_code'] = 'es'
    fmt = 'pcm_24000'
    wav = cache(cdir, 'voz', {'voice': a.voice_id, 'fmt': fmt, 'toma': a.toma, **cuerpo}, 'wav')
    meta = wav.with_suffix('.json')
    if not (wav.exists() and meta.exists()):
        r = json.loads(pedir('POST', f'/v1/text-to-speech/{a.voice_id}/with-timestamps', cuerpo, {'output_format': fmt}))
        with wave.open(str(wav), 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(24000)
            w.writeframes(base64.b64decode(r['audio_base64']))
        meta.write_text(json.dumps({'words': palabras(r.get('alignment') or {})}, ensure_ascii=False, indent=2), encoding='utf-8')
    shutil.copy(wav, a.salida)
    shutil.copy(meta, Path(a.salida).with_suffix('.json'))
    print(a.salida, len(json.loads(meta.read_text(encoding='utf-8'))['words']), 'palabras')


def efecto(a, cdir: Path):
    cuerpo = {'text': a.prompt, 'duration_seconds': round(max(0.5, min(a.segundos, 30)), 2), 'prompt_influence': a.influencia, 'model_id': 'eleven_text_to_sound_v3'}
    f = cache(cdir, 'efecto', {**cuerpo, 'toma': a.toma}, 'mp3')
    if not f.exists():
        f.write_bytes(pedir('POST', '/v1/sound-generation', cuerpo, {'output_format': 'mp3_44100_128'}))
    shutil.copy(f, a.salida)
    print(a.salida)


def musica(a, cdir: Path):
    plan = json.loads(Path(a.plan).read_text(encoding='utf-8'))
    cuerpo = {'composition_plan': plan, 'model_id': 'music_v2_5'}
    f = cache(cdir, 'musica', {**cuerpo, 'toma': a.toma}, 'mp3')
    if not f.exists():
        f.write_bytes(pedir('POST', '/v1/music', cuerpo, {'output_format': 'mp3_44100_128'}))
    shutil.copy(f, a.salida)
    print(a.salida)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--cache', default='.cache-elevenlabs')
    sub = ap.add_subparsers(dest='cmd', required=True)
    v = sub.add_parser('voz')
    v.add_argument('voice_id')
    v.add_argument('texto')
    v.add_argument('salida')
    v.add_argument('--estabilidad', type=float, default=0.55)
    v.add_argument('--modelo', default='eleven_v4')
    v.add_argument('--toma', type=int, default=0)
    e = sub.add_parser('efecto')
    e.add_argument('prompt')
    e.add_argument('segundos', type=float)
    e.add_argument('salida')
    e.add_argument('--influencia', type=float, default=0.6)
    e.add_argument('--toma', type=int, default=0)
    m = sub.add_parser('musica')
    m.add_argument('plan')
    m.add_argument('salida')
    m.add_argument('--toma', type=int, default=0)
    sub.add_parser('plan')
    a = ap.parse_args()
    cdir = Path(a.cache)
    if a.cmd == 'plan':
        s = json.loads(pedir('GET', '/v1/user/subscription'))
        print(f"Plan {s.get('tier')} ({s.get('status')}), {s.get('character_limit', 0) - s.get('character_count', 0)} créditos libres")
        if s.get('tier') == 'free':
            print('Aviso: el plan gratuito no permite uso comercial.')
        return
    {'voz': voz, 'efecto': efecto, 'musica': musica}[a.cmd](a, cdir)


if __name__ == '__main__':
    sys.exit(main())

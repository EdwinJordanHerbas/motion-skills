# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""Genera con tu cuenta de ElevenLabs el paquete de efectos de la plantilla, a partir de su receta.

  uv run paquete_efectos.py <receta.json> <carpeta_salida> [--solo pop,slice] [--largo 40] [--cache .cache-elevenlabs] [--informe ruta.json]

Por cada efecto pide 3 tomas (con la influencia de la receta, 0,15 menos y 0,15 más), las filtra
según su familia y las criba por medida: duración activa, energía bajo 150 Hz (retumba) y sobre
6 kHz (chirría). Entre las que pasan, en los clics y los golpes gana el ataque más rápido y corto.
La elegida se recorta, lleva fundidos y se normaliza a 0,89 de pico. El tecleo se corta en teclas
sueltas (tecla0.wav…) con cortar_teclas.py. Los fondos con `"bucle": true` (familia bed) se piden a ElevenLabs
como bucle sin costuras y se alargan a `--largo` segundos (por defecto 40) con fundidos cruzados de 0,25 s, para tener
un solo archivo para todo el vídeo. Al final deja informe.json con las medidas de cada toma en la carpeta de la caché
(o en --informe), no junto a los WAV: lleva rutas del ordenador y la salida suele ser public/, que va al repositorio.

Cada petición se guarda en la caché, así que repetir no vuelve a cobrar. Las 3 tomas de los 33
efectos suman unos 115 s de audio generado (60 s los 20 de interfaz y 55 s los 13 de objetos y ambiente):
antes, mira tus créditos con `elevenlabs.py plan`, o genera solo los que vayas a usar con --solo.
Usa ffmpeg para leer y filtrar.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import elevenlabs as el  # noqa: E402

SR = 48000
REGLAS = {
    'tick': {'max_activa': 0.35, 'max_graves': 0.30, 'max_agudos': 0.45, 'seco': True},
    'hit': {'max_activa': 0.9, 'max_graves': 0.40, 'max_agudos': 0.50, 'seco': True},
    'air': {'max_activa': 1.8, 'max_graves': 0.35, 'max_agudos': 0.50, 'seco': False},
    'swell': {'max_activa': 1.3, 'max_graves': 0.30, 'max_agudos': 0.50, 'seco': False},
    'bed': {'max_activa': 1e9, 'max_graves': 0.60, 'max_agudos': 0.40, 'seco': False},  # fondo continuo: sin límite de duración
}
# Los móviles no dan nada por debajo de 150-200 Hz, y el aire por encima de 11 kHz en un barrido solo suma siseo.
FILTROS = {
    'tick': 'highpass=f=200,lowpass=f=12000',
    'hit': 'highpass=f=120,lowpass=f=14000,highshelf=f=9000:g=-3',
    'air': 'highpass=f=170,lowpass=f=11000',
    'swell': 'highpass=f=200,lowpass=f=12000',
    'bed': 'highpass=f=90,lowpass=f=9000',
}


def leer(ruta) -> np.ndarray:
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ruta), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).reshape(-1, 2).copy()


def filtrar(x: np.ndarray, cadena: str) -> np.ndarray:
    b = subprocess.run(
        ['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', cadena, '-f', 'f32le', '-'],
        input=x.astype(np.float32).tobytes(),
        capture_output=True,
        check=True,
    ).stdout
    y = np.frombuffer(b, np.float32).reshape(-1, 2).copy()
    return np.pad(y, ((0, max(0, len(x) - len(y))), (0, 0)))[: len(x)]


def medidas(y: np.ndarray) -> dict:
    m = y.mean(axis=1)
    env = np.sqrt(np.convolve(m ** 2, np.ones(480) / 480, 'same'))
    pk = env.max() + 1e-12
    act = np.where(env > pk * 0.05)[0]
    ataque = int(np.argmax(env > pk * 0.1))
    pico = int(np.argmax(env))
    F = np.abs(np.fft.rfft(m)) ** 2
    f = np.fft.rfftfreq(len(m), 1 / SR)
    tot = F.sum() + 1e-12
    return {
        'activa_s': round((act[-1] - act[0]) / SR, 3) if len(act) else 0.0,
        'subida_ms': round((pico - ataque) / SR * 1000, 1),
        'ataque': ataque,
        'graves': round(float(F[f < 150].sum() / tot), 3),
        'agudos': round(float(F[f > 6000].sum() / tot), 3),
    }


def veredicto(md: dict, ef: dict) -> tuple[list[str], float]:
    r = {**REGLAS[ef['familia']], **{k: v for k, v in ef.items() if k.startswith('max_')}}
    por_que = []
    if md['activa_s'] > r['max_activa']:
        por_que.append(f"largo ({md['activa_s']} s)")
    if md['graves'] > r['max_graves']:
        por_que.append(f"retumba ({md['graves'] * 100:.0f} % bajo 150 Hz)")
    if md['agudos'] > r['max_agudos']:
        por_que.append(f"chirría ({md['agudos'] * 100:.0f} % sobre 6 kHz)")
    # Clics y golpes: ataque rápido y corto. Barridos: una subida de unos 250 ms y pocos graves.
    coste = md['subida_ms'] / 10 + md['activa_s'] if r['seco'] else abs(md['subida_ms'] - 250) / 150 + md['graves'] * 2
    return por_que, coste


def fundidos(x: np.ndarray, entrada_ms: float, salida_ms: float) -> np.ndarray:
    y = x.copy()
    a = min(int(entrada_ms / 1000 * SR), len(y))
    b = min(int(salida_ms / 1000 * SR), len(y))
    if a:
        y[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        y[-b:] *= np.linspace(1, 0, b)[:, None]
    return y


def alargar(y: np.ndarray, segundos: float, cruce: float = 0.25) -> np.ndarray:
    """Repite un bucle con fundido cruzado hasta cubrir `segundos`."""
    n, x = int(segundos * SR), int(cruce * SR)
    w = np.linspace(0, 1, x)[:, None]
    salida = y.copy()
    while len(salida) < n:
        salida = np.concatenate([salida[:-x], salida[-x:] * (1 - w) + y[:x] * w, y[x:]])
    return salida[:n]


def toma(ef: dict, influencia: float, k: int, cache: Path, modelo: str) -> Path:
    cuerpo = {'text': ef['prompt'], 'duration_seconds': round(max(0.5, min(ef['segundos'], 30)), 2), 'prompt_influence': influencia, 'model_id': modelo}
    if ef.get('bucle'):
        cuerpo['loop'] = True
    f = el.cache(cache, 'efecto', {**cuerpo, 'toma': k}, 'mp3')  # la misma caché que `elevenlabs.py efecto`
    if not f.exists():
        f.write_bytes(el.pedir('POST', '/v1/sound-generation', cuerpo, {'output_format': 'mp3_44100_128'}))
    return f


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('receta')
    ap.add_argument('salida')
    ap.add_argument('--solo', default='', help='nombres separados por comas')
    ap.add_argument('--largo', type=float, default=40.0, help='segundos a los que se alargan los fondos en bucle')
    ap.add_argument('--cache', default='.cache-elevenlabs')
    ap.add_argument('--informe', default='', help='dónde dejar informe.json (por defecto, en la carpeta de la caché)')
    a = ap.parse_args()
    receta = json.loads(Path(a.receta).read_text(encoding='utf-8'))
    modelo = receta.get('modelo', 'eleven_text_to_sound_v3')
    solo = {s.strip() for s in a.solo.split(',') if s.strip()}
    dst = Path(a.salida)
    dst.mkdir(parents=True, exist_ok=True)
    cache = Path(a.cache)
    informe = {}
    for nombre, ef in receta['efectos'].items():
        if solo and nombre not in solo:
            continue
        base = ef['influencia']
        cands = []
        for k, infl in enumerate((base, max(0.3, base - 0.15), min(0.8, base + 0.15))):
            ruta = toma(ef, round(infl, 2), k, cache, modelo)
            md = medidas(filtrar(leer(ruta), FILTROS[ef['familia']]))
            por_que, coste = veredicto(md, ef)
            cands.append({'toma': k, 'influencia': round(infl, 2), 'archivo': str(ruta), 'medidas': md, 'rechazo': por_que, 'coste': round(coste, 3)})
        validas = [c for c in cands if not c['rechazo']]
        mejor = min(validas or cands, key=lambda c: c['coste'])
        y = filtrar(leer(mejor['archivo']), FILTROS[ef['familia']])
        seco = REGLAS[ef['familia']]['seco']
        if seco:
            y = y[max(0, mejor['medidas']['ataque'] - int(0.004 * SR)):]
        if ef.get('bucle'):
            y = alargar(y, a.largo)
        y = fundidos(y, 2 if seco else 15, 40)
        y *= 0.89 / (np.abs(y).max() + 1e-9)
        if ef.get('cortar'):
            with tempfile.TemporaryDirectory() as t:
                tmp = Path(t) / f'{nombre}.wav'
                sf.write(str(tmp), y, SR, subtype='PCM_16')
                subprocess.run([sys.executable, str(AQUI / 'cortar_teclas.py'), str(tmp), str(dst), str(ef['cortar'])], check=True)
            hecho = f"tecla0-tecla{ef['cortar'] - 1}"
        else:
            sf.write(str(dst / f'{nombre}.wav'), y, SR, subtype='PCM_16')
            hecho = f'{nombre}.wav'
        aviso = '' if validas else '  <- ninguna toma pasa la criba: escúchala o genera otra (--toma en elevenlabs.py)'
        print(f"{hecho:22} toma {mejor['toma']}, {mejor['medidas']['activa_s']} s{aviso}")
        informe[nombre] = {'elegida': mejor['toma'], 'tomas': cands}
    ruta_informe = Path(a.informe) if a.informe else cache / 'informe.json'
    ruta_informe.parent.mkdir(parents=True, exist_ok=True)
    ruta_informe.write_text(json.dumps(informe, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()

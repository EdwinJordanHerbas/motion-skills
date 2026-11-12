# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["numpy", "soundfile", "praat-parselmouth"]
# ///
"""¿Dice «Estudio» o «Studio»? Mira si hay una vocal «e» justo antes de la primera /s/ de la frase.

    uv run scripts/vocal_e.py voz/marca.wav voz/cierre.wav            (WAV de voz sola, sin música)

Whisper no sirve para esto: con marcas que conoce, normaliza lo que oye y escribe «Studio» aunque la voz diga
«Estudio». Aquí se busca la /s/ (primer tramo de 10 ms con más del 60 % de la energía entre 4 y 9 kHz) y se
mide el segundo formante (F2) hacia atrás desde ella:

- **Hay «e»:** un tramo sonoro y estable con F2 por encima de 1.800 Hz de 90 ms o más pegado a la /s/.
- **No la hay:** el F2 cae hacia la vocal o la consonante anterior (~800-1.300 Hz tras una o/r) a 25-55 ms de la /s/,
  o el tramo es sordo.

Calibrado con una marca de dos palabras, «<Nombre> Estudio», dicha por dos voces de ElevenLabs: las 6 tomas que dicen
«Estudio» dan 95-135 ms de F2 a 1.900-2.300 Hz; 7 de las 8 que decían «Studio», 25-55 ms (una da 95 ms, «dudoso»).
Ante un «dudoso», escucha. Vale para cualquier palabra española que empiece por «es» delante de una marca o un
anglicismo. `--desde` cambia dónde empieza a buscar la /s/ (por defecto 0,25 s, para saltarse una /s/ inicial).
"""
import os
import sys

import numpy as np
import parselmouth
import soundfile as sf

args = [a for a in sys.argv[1:] if not a.startswith('--')]
desde = float(sys.argv[sys.argv.index('--desde') + 1]) if '--desde' in sys.argv else 0.25
if '--desde' in sys.argv:
    args.remove(sys.argv[sys.argv.index('--desde') + 1])

for ruta in args:
    x, sr = sf.read(ruta)
    x = x if x.ndim == 1 else x.mean(axis=1)
    n = int(0.01 * sr)
    f = np.fft.rfftfreq(n, 1 / sr)
    s_on = None
    for i in range(int(desde * sr), min(len(x), int((desde + 1.4) * sr)) - n, n):
        seg = x[i:i + n]
        F = np.abs(np.fft.rfft(seg)) ** 2
        if F.sum() > 1e-6 and F[(f > 4000) & (f < 9000)].sum() / F.sum() > 0.6 and np.sqrt(np.mean(seg ** 2)) > 0.01:
            s_on = i / sr
            break
    nombre = os.path.basename(ruta)
    if s_on is None:
        print(f'{nombre}: no encuentro la /s/ entre {desde:.2f} y {desde + 1.4:.2f} s')
        continue
    snd = parselmouth.Sound(x, sr)
    fm = snd.to_formant_burg(max_number_of_formants=5, maximum_formant=5500)
    tono = snd.to_pitch()
    # cada 10 ms de −100 a −20 ms: una «e» es una vocal estable, con F2 alto en todo el tramo; sin ella, F2 salta
    # (el seguidor de formantes se pierde entre la o/r y la /s/) o el tramo es sordo
    puntos, altos = [], 0
    for ms in range(100, 10, -10):
        t = s_on - ms / 1000
        f2 = fm.get_value_at_time(2, t)
        v = tono.get_value_at_time(t)
        sonora = v == v and v > 0
        altos += bool(sonora and f2 == f2 and f2 > 1800)
        puntos.append(f"{f2:4.0f}{'' if sonora else 's'}")
    # cuánto dura, hacia atrás desde la /s/, el tramo sonoro con F2 > 1.800 Hz sin cortes: eso es la «e»
    e_ms = 0
    for ms in range(15, 260, 5):
        t = s_on - ms / 1000
        f2 = fm.get_value_at_time(2, t)
        v = tono.get_value_at_time(t)
        if not (v == v and v > 0 and f2 == f2 and f2 > 1800):
            break
        e_ms = ms
    veredicto = '«e» presente' if e_ms >= 90 and altos == len(puntos) else ('dudoso: escúchalo' if e_ms >= 50 else 'sin «e»')
    print(f'{nombre}: /s/ en {s_on:.2f} s → {veredicto}: F2 alto durante {e_ms} ms '
          f"({altos}/{len(puntos)} puntos) | F2 de −100 a −20 ms: {' '.join(puntos)} (s = sorda)")

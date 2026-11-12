# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""El desfase de cada efecto: en qué fotograma cae su pico de energía, desde el inicio del archivo.

    uv run scripts/desfases.py public/proyecto/sfx

Un barrido no suena «en» su fotograma: su pico llega de 4 a 13 fotogramas después. Para que el pico caiga en la acción,
el efecto empieza antes: `desfase = −pico`. Excepción: un giro suena mejor con el pico en su mitad, cuando va más
rápido, así que su desfase es −pico + mitad del giro. Las teclas se saltan (son golpes secos, desfase 0).
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

FPS = 30
for p in sorted(Path(sys.argv[1]).glob('*.wav')):
    if p.stem.startswith('tecla'):
        continue
    x, sr = sf.read(p)
    x = np.abs(x.mean(axis=1) if x.ndim > 1 else x)
    env = np.convolve(x, np.ones(int(0.01 * sr)) / int(0.01 * sr), 'same')
    pico = env.argmax() / sr * FPS
    print(f'{p.stem:12} pico en f{pico:5.1f}  dura {len(x) / sr:.2f} s  →  desfase {-round(pico):+d}')

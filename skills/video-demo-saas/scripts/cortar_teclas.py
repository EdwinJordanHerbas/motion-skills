# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""Corta una toma de tecleo (un efecto largo de ElevenLabs) en pulsaciones sueltas.

  uv run cortar_teclas.py <tecleo.wav|mp3> <carpeta_salida> [n=8]

Detecta cada ataque, se queda con las n pulsaciones más limpias (las que no pisan a la siguiente),
las recorta de 4 ms antes del ataque a 120 ms después, con fundidos, y las nivela al mismo pico.
Salen tecla0.wav ... tecla<n-1>.wav. En el vídeo se alternan con una semilla y un volumen que
oscila un poco, para que no suene a la misma tecla repetida.
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
n = int(sys.argv[3]) if len(sys.argv) > 3 else 8
y, sr = sf.read(str(src), always_2d=True)
m = y.mean(axis=1)
hop = int(0.002 * sr)
env = np.sqrt(np.convolve(m ** 2, np.ones(hop * 2) / (hop * 2), 'same'))
d = np.maximum(np.diff(env), 0)
thr = d.max() * 0.18
picos = []
for i in np.nonzero(d > thr)[0]:
    if not picos or i - picos[-1] > int(0.06 * sr):  # una pulsación cada 60 ms como mucho
        picos.append(i)
pre, post = int(0.004 * sr), int(0.12 * sr)
cands = []
for k, i in enumerate(picos):
    sig = picos[k + 1] if k + 1 < len(picos) else len(m)
    if sig - i < int(0.08 * sr):  # la siguiente pisa la cola
        continue
    a, b = max(0, i - pre), min(len(m), i + post, sig - pre)
    seg = y[a:b].copy()
    limpio = float(np.abs(seg[-int(0.02 * sr):]).max() / (np.abs(seg).max() + 1e-9))  # cola que se apaga
    cands.append((limpio, a, seg))
cands.sort(key=lambda c: c[0])
elegidas = sorted(cands[:n], key=lambda c: c[1])
dst.mkdir(parents=True, exist_ok=True)
for j, (_, _, seg) in enumerate(elegidas):
    f_in, f_out = int(0.002 * sr), int(0.04 * sr)
    seg[:f_in] *= np.linspace(0, 1, f_in)[:, None]
    seg[-f_out:] *= np.linspace(1, 0, f_out)[:, None]
    seg *= 0.89 / (np.abs(seg).max() + 1e-9)
    sf.write(str(dst / f'tecla{j}.wav'), seg.astype(np.float32), sr)
print(f'{len(picos)} ataques, {len(cands)} limpios, {len(elegidas)} teclas en {dst}')

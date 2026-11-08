# /// script
# dependencies = ["av", "numpy"]
# ///
"""Horizontal extent of the dark object (the laptop) per frame, in 1080-wide pixels.
Uso: caja.py <mp4> <desde> <hasta> [umbral]"""
import sys

import av
import numpy as np

mp4, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
umbral = float(sys.argv[4]) if len(sys.argv) > 4 else 150
c = av.open(mp4)
v = c.streams.video[0]
for i, fr in enumerate(c.decode(v)):
    if i < a:
        continue
    if i > b:
        break
    x = fr.to_ndarray(format='gray').astype(np.float32)
    h, w = x.shape
    k = 1080 / w
    oscuro = x < umbral
    cols = np.where(oscuro.sum(axis=0) >= max(2, round(3 / k)))[0]
    filas = np.where(oscuro.sum(axis=1) >= max(2, round(3 / k)))[0]
    if len(cols) == 0:
        print(f'f{i}: nada')
        continue
    l, r = cols[0] * k, (cols[-1] + 1) * k
    t, d = filas[0] * k, (filas[-1] + 1) * k
    aviso = '  <- toca el borde' if l <= 2 or r >= 1078 else ('  <- fuera de 65-1015' if l < 65 or r > 1015 else '')
    print(f'f{i}: x {l:5.0f}-{r:5.0f} (ancho {r - l:4.0f}, centro {(l + r) / 2:4.0f})  y {t:5.0f}-{d:5.0f}{aviso}')
c.close()

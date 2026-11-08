# /// script
# dependencies = ["av", "numpy"]
# ///
"""Finds broken frames: a white background (the page's layers not painted) or a sudden drop in
dark pixels against both neighbours (a 3D object missing for a frame).
Uso: huecos.py <mp4>"""
import sys

import av
import numpy as np

c = av.open(sys.argv[1])
v = c.streams.video[0]
esquina, oscuro = [], []
for fr in c.decode(v):
    g = fr.to_ndarray(format='gray').astype(np.float32)
    h, w = g.shape
    esquina.append(float(g[int(h * 0.05):int(h * 0.1), int(w * 0.05):int(w * 0.1)].mean()))
    oscuro.append(int((g[int(h * 0.15):int(h * 0.85)] < 140).sum()))
c.close()
malos = []
for i in range(len(oscuro)):
    if esquina[i] > 252:
        malos.append((i, f'fondo blanco ({esquina[i]:.0f})'))
    if 0 < i < len(oscuro) - 1:
        vecinos = min(oscuro[i - 1], oscuro[i + 1])
        if vecinos > 2000 and oscuro[i] < 0.6 * vecinos:
            malos.append((i, f'caída de píxeles oscuros: {oscuro[i]} frente a {vecinos}'))
print(f'{len(oscuro)} fotogramas; fondo típico {np.median(esquina):.0f}')
for i, m in malos:
    print(f'  f{i}: {m}')
print('sin fotogramas rotos' if not malos else f'{len(malos)} avisos')

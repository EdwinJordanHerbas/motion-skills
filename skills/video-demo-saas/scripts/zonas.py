# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "pillow"]
# ///
"""Hoja de fotogramas con la zona segura de anuncios verticales dibujada encima.

Uso: uv run zonas.py <mp4> <hoja.jpg> <fotogramas,separados,por,comas>

Zona segura para 1080 x 1920 (la más estricta de las oficiales consultadas):
  - Meta, anuncios de Reels: 14 % arriba (269 px), 35 % abajo (672 px), 6 % a cada lado (65 px).
  - YouTube, anuncios verticales: 288 arriba, 672 abajo, 48 a la izquierda, 192 a la derecha.
  - Juntas: x 65-888, y 288-1248. El texto, la llamada a la acción y la marca van dentro.
Lo de fuera se tiñe de rojo. La línea discontinua marca el centro de la zona segura.
"""
import sys

import av
from PIL import Image, ImageDraw

ZONA = (65, 888, 288, 1248)  # x0, x1, y0, y1 a 1080 x 1920

mp4, hoja = sys.argv[1], sys.argv[2]
frames = [int(x) for x in sys.argv[3].split(',')]

c = av.open(mp4)
v = c.streams.video[0]
want, got = set(frames), {}
for i, fr in enumerate(c.decode(v)):
    if i in want:
        got[i] = fr.to_image().convert('RGBA')
    if i > max(frames):
        break
c.close()

def marca(img):
    w, h = img.size
    k = w / 1080  # admite renders de prueba a menor escala
    X0, X1, Y0, Y1 = (round(v * k) for v in ZONA)
    capa = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    rojo = (220, 30, 30, 70)
    d.rectangle([0, 0, w, Y0], fill=rojo)
    d.rectangle([0, Y1, w, h], fill=rojo)
    d.rectangle([0, Y0, X0, Y1], fill=rojo)
    d.rectangle([X1, Y0, w, Y1], fill=rojo)
    d.rectangle([X0, Y0, X1, Y1], outline=(0, 170, 80, 255), width=max(2, round(6 * k)))
    cy = (Y0 + Y1) // 2
    cx = (X0 + X1) // 2
    for x in range(X0, X1, max(8, round(40 * k))):
        d.line([x, cy, x + round(20 * k), cy], fill=(0, 170, 80, 200), width=max(1, round(4 * k)))
    for y in range(Y0, Y1, max(8, round(40 * k))):
        d.line([cx, y, cx, y + round(20 * k)], fill=(0, 170, 80, 200), width=max(1, round(4 * k)))
    return Image.alpha_composite(img, capa).convert('RGB')

W, H, cols = 270, 480, 8
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * (H + 24)), (17, 16, 14))
d = ImageDraw.Draw(sheet)
for k, f in enumerate(frames):
    if f in got:
        sheet.paste(marca(got[f]).resize((W, H)), ((k % cols) * W, (k // cols) * (H + 24) + 24))
    d.text(((k % cols) * W + 6, (k // cols) * (H + 24) + 6), f'f{f}  {f / 30:.1f}s', fill=(255, 79, 0))
sheet.save(hoja, quality=88)
print('hoja', hoja)

# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "pillow"]
# ///
"""Fotogramas sueltos de un vídeo, grandes, en una hoja de dos columnas (para ver tipografía y detalle).

    uv run scripts/fotogramas.py referencia.mp4 detalle.jpg 40,110,170
    uv run scripts/fotogramas.py referencia.mp4 detalle.jpg 40,110 --ancho 900
"""
import argparse

import av
from PIL import Image, ImageDraw


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('salida', help='la hoja, en .jpg')
    ap.add_argument('fotogramas', help='números de fotograma separados por comas')
    ap.add_argument('--ancho', type=int, default=640, help='ancho de cada fotograma en la hoja (640 por defecto)')
    a = ap.parse_args()

    want = [int(x) for x in a.fotogramas.split(',')]
    W = a.ancho
    c = av.open(a.video)
    got = {}
    for i, fr in enumerate(c.decode(video=0)):
        if i in want:
            got[i] = fr.to_image()
        if i > max(want):
            break
    c.close()
    falta = [i for i in want if i not in got]
    if falta:
        raise SystemExit(f'el vídeo no llega a los fotogramas {falta}')
    ims = [got[i] for i in want]
    h = int(W * ims[0].height / ims[0].width)
    cols, rows = 2, (len(ims) + 1) // 2
    sh = Image.new('RGB', (cols * W, rows * (h + 16)), (17, 17, 17))
    d = ImageDraw.Draw(sh)
    for k, (i, im) in enumerate(zip(want, ims)):
        x, y = (k % cols) * W, (k // cols) * (h + 16)
        sh.paste(im.resize((W, h)), (x, y + 16))
        d.text((x + 4, y + 2), f'f{i}', fill=(255, 120, 60))
    sh.save(a.salida, quality=90)


if __name__ == '__main__':
    main()

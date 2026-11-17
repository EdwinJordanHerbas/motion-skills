# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools", "brotli"]
# ///
"""Ancho en px de cada texto con la fuente real, para comprobar que cabe en la zona segura (823 px).

    uv run scripts/anchos.py public/fonts/Geist-variable.woff2 700 250 -0.05 "ideas"
    uv run scripts/anchos.py public/fonts/InstrumentSerif-Italic.ttf - 170 -0.01 "en imágenes."

Con una fuente variable, el peso fija el eje wght; con una estática, pon «-».
"""
import argparse

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('fuente', help='archivo .woff2, .ttf u .otf')
    ap.add_argument('peso', help='peso del eje wght, o «-» si la fuente no es variable')
    ap.add_argument('px', type=float, help='tamaño del texto en px')
    ap.add_argument('tracking', type=float, help='espaciado entre letras en em (p. ej. -0.045)')
    ap.add_argument('textos', nargs='+')
    a = ap.parse_args()

    g = TTFont(a.fuente)
    if a.peso != '-':
        g = instancer.instantiateVariableFont(g, {'wght': float(a.peso)})
    cmap, hm, upm = g.getBestCmap(), g['hmtx'], g['head'].unitsPerEm
    for t in a.textos:
        w = sum(hm[cmap[ord(c)]][0] for c in t) / upm
        print(f'{t!r:28} {(w + a.tracking * len(t)) * a.px:6.0f}px  ({a.px:.0f}px, w{a.peso})')


if __name__ == '__main__':
    main()

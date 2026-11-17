# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "numpy"]
# ///
"""Fotogramas que parpadean: distintos de sus dos vecinos mientras los vecinos se parecen entre sí.

    uv run scripts/parpadeo.py final.mp4

Encuentra las capas que desaparecen un solo fotograma (una tarjeta de cristal, la pantalla de un móvil, un rótulo)
cuando Chrome va cargado en el render completo. `huecos.py` no lo ve porque el fondo sigue ahí. Qué hacer con cada
uno: `references/revision.md`.
"""
import argparse

import av
import numpy as np


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    a = ap.parse_args()

    c = av.open(a.video)
    fs = [np.asarray(fr.to_ndarray(format='gray', width=135, height=240), dtype=np.float32) for fr in c.decode(video=0)]
    c.close()
    malos = []
    for n in range(1, len(fs) - 1):
        antes = np.abs(fs[n] - fs[n - 1]).mean()
        despues = np.abs(fs[n + 1] - fs[n]).mean()
        vecinos = np.abs(fs[n + 1] - fs[n - 1]).mean()
        if min(antes, despues) > 2.5 and min(antes, despues) > 2.2 * vecinos:
            malos.append((n, round(float(antes), 1), round(float(despues), 1), round(float(vecinos), 1)))
    print(len(fs), 'fotogramas;', len(malos), 'parpadeos')
    for m in malos:
        print('  f%d  antes %.1f  después %.1f  vecinos %.1f' % m)


if __name__ == '__main__':
    main()

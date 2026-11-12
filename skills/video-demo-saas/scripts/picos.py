# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "numpy", "scipy"]
# ///
"""Dónde se apilan los picos: pico real (sobremuestreo ×4) por fotograma y los N fotogramas más altos.

    uv run scripts/picos.py final.mp4                 los 8 fotogramas con más pico
    uv run scripts/picos.py mezcla.wav 12             los 12 más altos (vale un WAV o un MP4)
    uv run scripts/picos.py solo-efectos.wav 8 --bloques   y el volumen momentáneo medio por bloques de 2 s

`medir.py` da el pico del vídeo entero; esto dice en qué fotograma está, para buscar qué se suma ahí (un golpe de la
música, el aire con la cámara a toda velocidad, un efecto encima de una sílaba). Con `--bloques` sirve para comparar
una pista de solo efectos contra la música: en un vídeo de referencia sin voz, los efectos iban 13 dB por debajo y no se oían.
"""
import sys

import av
import numpy as np
from scipy.signal import resample_poly

FPS = 30


def leer(ruta: str) -> tuple[np.ndarray, int]:
    c = av.open(ruta)
    a = c.streams.audio[0]
    trozos = []
    for fr in c.decode(a):
        x = fr.to_ndarray()
        if x.ndim == 1:
            x = x[None, :]
        trozos.append(x.T if fr.format.is_planar else x.reshape(-1, a.channels))
    sr = a.rate
    c.close()
    y = np.concatenate(trozos).astype(np.float64)
    if np.issubdtype(trozos[0].dtype, np.integer):
        y /= float(np.iinfo(trozos[0].dtype).max)
    return y, sr


args = [a for a in sys.argv[1:] if not a.startswith('--')]
ruta, n = args[0], int(args[1]) if len(args) > 1 else 8
y, sr = leer(ruta)
up = np.abs(resample_poly(y, 4, 1, axis=0)).max(axis=1)
paso = sr * 4 / FPS
total = int(len(up) / paso)
pico = np.array([up[int(i * paso):int((i + 1) * paso)].max() for i in range(total)])
db = 20 * np.log10(np.maximum(pico, 1e-9))
print(f'{ruta}: {total} fotogramas, pico real {db.max():.2f} dBTP en f{int(db.argmax())}')
for i in np.argsort(db)[::-1][:n]:
    aviso = '  ← pasa de −1 dBTP' if db[i] > -1 else ''
    print(f'  f{i:<5} {db[i]:6.2f} dBTP{aviso}')

if '--bloques' in sys.argv:
    # momentáneo (ventana de 400 ms, sin ponderación K: sirve para comparar pistas entre sí, no como LUFS)
    w, h = int(0.4 * sr), int(sr / FPS)
    mono = (y ** 2).mean(axis=1)
    mom = np.array([-0.691 + 10 * np.log10(mono[i:i + w].mean() + 1e-12) for i in range(0, len(mono) - w, h)])
    print('momentáneo por bloques de 60 fotogramas (dB, sin ponderar):')
    for a in range(0, len(mom), 60):
        b = mom[a:a + 60]
        print(f'  f{a:4}-{a + 59:4}  medio {b.mean():6.1f}  mínimo {b.min():6.1f}')

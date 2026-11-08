# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "numpy", "scipy", "pyloudnorm", "pillow"]
# ///
"""Find dead air in a rendered video: momentary loudness (400 ms windows, 100 ms hop) and every
stretch longer than 0.3 s below a threshold.

usage: silencios.py <mp4> [threshold_lufs=-38]
"""
import sys

import av
import numpy as np
import pyloudnorm as pyln

path = sys.argv[1]
thr = float(sys.argv[2]) if len(sys.argv) > 2 else -38.0
c = av.open(path)
chunks = []
sr = None
for fr in c.decode(audio=0):
    a = fr.to_ndarray()
    sr = fr.sample_rate
    if a.ndim == 2 and a.shape[0] <= 8:
        a = a.T if fr.format.is_planar else a.reshape(-1, len(fr.layout.channels))
    chunks.append(a.astype(np.float64))
y = np.concatenate(chunks)
meter = pyln.Meter(sr, block_size=0.4)
hop, win = int(0.1 * sr), int(0.4 * sr)
vals = []
for i in range(0, len(y) - win, hop):
    seg = y[i : i + win]
    rms = np.sqrt(np.mean(seg**2))
    vals.append(-70.0 if rms < 1e-6 else meter.integrated_loudness(np.vstack([seg, seg])))
vals = np.array(vals)
low = vals < thr
runs, start = [], None
for i, v in enumerate(low):
    if v and start is None:
        start = i
    if (not v or i == len(low) - 1) and start is not None:
        end = i if not v else i + 1
        if (end - start) * 0.1 >= 0.3:
            runs.append((start * 0.1, end * 0.1, float(vals[start:end].min())))
        start = None
print(f'umbral {thr} LUFS momentáneo; tramos por debajo, >= 0,3 s:')
for a, b, m in runs:
    print(f'  {a:5.1f}-{b:5.1f} s (f{int(a * 30)}-{int(b * 30)})  mínimo {m:.1f}')
if not runs:
    print('  ninguno')
print('mediana', round(float(np.median(vals)), 1), 'p10', round(float(np.percentile(vals, 10)), 1))

# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "numpy", "scipy", "pyloudnorm", "pillow"]
# ///
"""Mide el MP4: duración, LUFS integrados, pico real aproximado y hoja de fotogramas clave."""
import sys

import av
import numpy as np
import pyloudnorm as pyln
from PIL import Image, ImageDraw
from scipy.signal import resample_poly

mp4, hoja = sys.argv[1], sys.argv[2]
frames = [int(x) for x in sys.argv[3].split(',')]

c = av.open(mp4)
a = c.streams.audio[0]
sr = a.rate
chunks = []
for fr in c.decode(a):
    x = fr.to_ndarray()
    if x.ndim == 1:
        x = x[None, :]
    if fr.format.is_planar:
        chunks.append(x.T)
    else:
        chunks.append(x.reshape(-1, a.channels))
y = np.concatenate(chunks).astype(np.float64)
c.close()
lufs = pyln.Meter(sr).integrated_loudness(y)
tp = 20 * np.log10(np.abs(resample_poly(y, 4, 1, axis=0)).max() + 1e-12)
print(f'audio {sr} Hz {y.shape[1]} canales {len(y) / sr:.2f} s  {lufs:.1f} LUFS  pico real {tp:.1f} dBTP')

c = av.open(mp4)
v = c.streams.video[0]
print('video', v.codec_context.width, 'x', v.codec_context.height, float(v.average_rate), 'fps', v.frames, 'fotogramas')
want, got = set(frames), {}
for i, fr in enumerate(c.decode(v)):
    if i in want:
        got[i] = fr.to_image()
    if i > max(frames):
        break
c.close()
W, H, cols = 270, 480, 6
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * (H + 24)), (17, 16, 14))
d = ImageDraw.Draw(sheet)
for k, f in enumerate(frames):
    if f in got:
        sheet.paste(got[f].resize((W, H)), ((k % cols) * W, (k // cols) * (H + 24) + 24))
    d.text(((k % cols) * W + 6, (k // cols) * (H + 24) + 6), f'f{f}  {f / 30:.1f}s', fill=(255, 79, 0))
sheet.save(hoja, quality=88)
print('hoja', hoja)

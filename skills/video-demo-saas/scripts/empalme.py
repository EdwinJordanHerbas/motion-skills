# /// script
# dependencies = ["librosa", "numpy", "soundfile"]
# ///
"""Insert one 2 s bar (4 beats at 120 BPM) into a music track by jumping back 2 s at a beat.
Uso: empalme.py <in.wav> <out.wav> [frame_de_empalme]  (sin frame: mide los candidatos)"""
import sys

import librosa
import numpy as np
import soundfile as sf

FPS = 30
a, sr = sf.read(sys.argv[1], always_2d=True)
info = sf.info(sys.argv[1])
mono = a.mean(axis=1)
BAR = int(round(2.0 * sr))
beat0 = float(__import__("os").environ.get("BEAT0", "0"))  # a measured beat, in frames (librosa beat_track); the grid is every 15 frames at 120 BPM


def win(s, d=0.5):
    i = int(s * sr / FPS)
    return mono[i - int(d * sr):i]


def feat(x):
    m = librosa.feature.melspectrogram(y=x, sr=sr, n_mels=64)
    return np.log1p(m).mean(axis=1)


cands = [beat0 + 15 * k for k in range(4, 10)]
if len(sys.argv) < 4:
    for s in cands:
        before = np.linalg.norm(feat(win(s)) - feat(win(s - 60)))
        after_i = int(s * sr / FPS)
        x1 = mono[after_i:after_i + sr // 2]
        x0 = mono[after_i - BAR:after_i - BAR + sr // 2]
        after = np.linalg.norm(feat(x1) - feat(x0))
        rms = np.sqrt((win(s) ** 2).mean())
        print(f'empalme en f{s:.1f}: repite f{s - 60:.1f}-f{s:.1f}  dif. antes {before:.2f}  dif. después {after:.2f}  rms {rms:.3f}')
    sys.exit()

s = float(sys.argv[3])
cut = int(round(s * sr / FPS)) - int(0.006 * sr)  # just before the beat's transient
xf = int(0.012 * sr)
head = a[:cut + xf].copy()
tail = a[cut - BAR:].copy()
ramp = np.linspace(0, 1, xf)[:, None]
fade_out = np.cos(ramp * np.pi / 2)
fade_in = np.sin(ramp * np.pi / 2)
mixz = head[-xf:] * fade_out + tail[:xf] * fade_in
out = np.concatenate([head[:-xf], mixz, tail[xf:]])
sf.write(sys.argv[2], out, sr, subtype=info.subtype)
print(f'{sys.argv[2]}: {len(out) / sr:.3f} s ({len(out) / sr * FPS:.1f} f), +{(len(out) - len(a)) / sr * FPS:.1f} f, empalme en f{cut / sr * FPS:.2f}, {info.subtype}')

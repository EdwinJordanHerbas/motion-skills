# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile", "pyloudnorm"]
# ///
"""Nivela una toma de música para que nunca caiga a algo que suene a silencio.

  uv run nivelar_musica.py <entrada.wav> <salida.wav> [--fps 30]
      [--curva "0:-28,114:-28,130:-22,726:-22,917:-21"] [--fin 917]

La curva son pares fotograma:LUFS (volumen a corto plazo, ventana de 3 s) unidos en línea recta.
Por defecto, la del vídeo de referencia con voz: suave bajo el tecleo del gancho, colchón estable desde la marca
(fotograma 114) y una subida leve hasta el golpe final (917). Desde --fin se congela la ganancia
para que la cola del golpe final se apague sola. Ganancia limitada a [-14, +8] dB, suavizada en
1,5 s, y pico final a 0,89 (-1 dBFS).

Después, en Remotion, la música va a volumen 1 sin voz y a 0,42 bajo la voz (ver references/sonido.md).
"""
import argparse

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('dst')
ap.add_argument('--fps', type=float, default=30)
ap.add_argument('--curva', default='0:-28,114:-28,130:-22,726:-22,917:-21')
ap.add_argument('--fin', type=float, default=917)
a = ap.parse_args()

pts = sorted((float(f), float(l)) for f, l in (x.split(':') for x in a.curva.split(',')))
fx, lx = np.array([p[0] for p in pts]), np.array([p[1] for p in pts])

y, sr = sf.read(a.src, always_2d=True)
meter = pyln.Meter(sr)
hop, win = int(0.1 * sr), int(3.0 * sr)
ts, gains = [], []
for c in range(0, len(y), hop):
    seg = y[max(0, c - win // 2) : min(len(y), c + win // 2)]
    L = meter.integrated_loudness(seg) if len(seg) >= sr * 0.5 and np.abs(seg).max() > 1e-5 else -70.0
    t = c / sr
    objetivo = float(np.interp(t * a.fps, fx, lx))
    gains.append(np.clip(objetivo - L, -14, 8) if L > -60 else 0.0)
    ts.append(t)
ts, gains = np.array(ts), np.array(gains)
hold = ts >= a.fin / a.fps - 0.2
if hold.any() and np.argmax(hold) > 0:
    gains[hold] = gains[np.argmax(hold) - 1]
k = 15
gains = np.convolve(np.pad(gains, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), 'valid')
g = np.interp(np.arange(len(y)) / sr, ts, gains)
out = y * (10 ** (g / 20))[:, None]
pk = np.abs(out).max()
if pk > 0.89:
    out *= 0.89 / pk
sf.write(a.dst, out.astype(np.float32), sr)
for t in range(0, int(len(y) / sr), 2):
    s = out[t * sr : t * sr + 3 * sr]
    if len(s) > sr:
        print(f'{t:3d} s  {meter.integrated_loudness(s):6.1f} LUFS')
print('pico', round(20 * np.log10(np.abs(out).max()), 1), 'dBFS')

# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["numpy", "faster-whisper", "pyloudnorm"]
# ///
"""Casting de voz: qué toma se entiende mejor bajo la música del vídeo, por la confianza media de
Whisper por palabra, limpia y con la música 8 y 3 dB por debajo de la voz. También da el porcentaje
de energía entre 4,5 y 8 kHz (las eses: por encima de ~3 % la voz suena afilada y cansa).

  uv run claridad.py <música> <toma1.wav> [toma2.wav ...] [--desde 17] [--idioma es]

Usa 14 s de música desde --desde: elige un tramo con cuerpo, no la intro. Graba las mismas frases
con cada voz candidata. La primera vez descarga el modelo «small» de Whisper.
"""
import argparse
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
from faster_whisper import WhisperModel

SR = 16000


def cargar(p, desde=None, dur=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(desde)] if desde else []) + ['-i', str(p)] + (['-t', str(dur)] if dur else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('musica')
    ap.add_argument('tomas', nargs='+')
    ap.add_argument('--desde', type=float, default=17.0)
    ap.add_argument('--idioma', default='es')
    a = ap.parse_args()
    medidor = pyln.Meter(SR)
    musica = cargar(a.musica, a.desde, 14.0)
    modelo = WhisperModel('small', device='cpu', compute_type='int8')
    print(f"{'toma':24} {'eses %':>6} {'limpia':>7} {'-8 dB':>7} {'-3 dB':>7}")
    for t in a.tomas:
        v = cargar(t)
        v = v * 10 ** ((-16 - medidor.integrated_loudness(v)) / 20)
        esp = np.abs(np.fft.rfft(v)) ** 2
        fr = np.fft.rfftfreq(len(v), 1 / SR)
        eses = esp[(fr > 4500) & (fr < 8000)].sum() / esp[(fr > 80) & (fr < 8000)].sum() * 100
        res = []
        for snr in (None, 8, 3):
            x = v.copy()
            if snr is not None:
                m = np.resize(musica, len(v))
                x = x + m * 10 ** ((-16 - snr - medidor.integrated_loudness(m)) / 20)
            segs, _ = modelo.transcribe(x, language=a.idioma, beam_size=5, word_timestamps=True)
            ws = [w for s in segs for w in s.words]
            res.append(np.mean([w.probability for w in ws]) if ws else 0)
        print(f'{Path(t).stem[:24]:24} {eses:6.2f} {res[0]:7.3f} {res[1]:7.3f} {res[2]:7.3f}')


if __name__ == '__main__':
    main()

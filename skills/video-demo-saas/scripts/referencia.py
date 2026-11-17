# /// script
# requires-python = ">=3.10"
# dependencies = ["av", "numpy", "pillow", "librosa", "soundfile"]
# ///
"""Desglose de un vídeo de referencia sin cargarlo entero en memoria.

    uv run scripts/referencia.py referencia.mp4 desglose/ 12

Escribe en la carpeta hojas de contacto (hoja_00.jpg…, un fotograma cada N), y datos.json con los cortes (cambio
medio entre fotogramas > 25), el tempo de la música y sus golpes. Imprime el nivel cada 30 fotogramas.
Qué mirar después: `references/estilo-premium.md`, «Analizar una referencia nueva».
"""
import argparse
import json
from pathlib import Path

import av
import numpy as np
from PIL import Image, ImageDraw


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('carpeta', help='carpeta de salida (se crea si no existe)')
    ap.add_argument('cada', type=int, help='un fotograma en la hoja cada N')
    a = ap.parse_args()

    out = Path(a.carpeta)
    out.mkdir(parents=True, exist_ok=True)
    W, cols, rows_per = 320, 6, 6
    c = av.open(a.video)
    fps = float(c.streams.video[0].average_rate or 30)
    keep, prev, diff = {}, None, []
    for i, fr in enumerate(c.decode(video=0)):
        im = fr.to_image()
        s = np.asarray(im.resize((96, 54)), dtype=np.float32)
        diff.append(0.0 if prev is None else float(np.abs(s - prev).mean()))
        prev = s
        if i % a.cada == 0:
            keep[i] = im.resize((W, int(W * im.height / im.width)))
    c.close()
    n = len(diff)
    h = next(iter(keep.values())).height
    idx = sorted(keep)
    per = cols * rows_per
    for s in range(0, len(idx), per):
        part = idx[s:s + per]
        rows = (len(part) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rows * (h + 18)), (17, 17, 17))
        d = ImageDraw.Draw(sheet)
        for k, i in enumerate(part):
            x, y = (k % cols) * W, (k // cols) * (h + 18)
            sheet.paste(keep[i], (x, y + 18))
            d.text((x + 4, y + 3), f'f{i} {i / fps:.1f}s d{diff[i]:.0f}', fill=(255, 120, 60))
        sheet.save(out / f'hoja_{s // per:02d}.jpg', quality=86)

    cuts = [i for i in range(n) if diff[i] > 25]
    datos = {'n': n, 'fps': fps, 'diff': diff, 'cuts': cuts}
    # se guarda ya, por si falla el análisis del audio
    (out / 'datos.json').write_text(json.dumps(datos), encoding='utf-8')
    print('fotogramas', n, 'a', round(fps, 3), 'fps')
    print('cortes (diff>25):', cuts)

    c = av.open(a.video)
    if not c.streams.audio:
        c.close()
        print('sin audio: no hay tempo ni nivel')
    else:
        import librosa

        canales = c.streams.audio[0].channels
        sr = c.streams.audio[0].rate
        ch = []
        for fr in c.decode(audio=0):
            x = fr.to_ndarray()
            ch.append(x.T if fr.format.is_planar else x.reshape(-1, canales))
        c.close()
        y = np.concatenate(ch).astype(np.float32).mean(1)
        hop = int(sr / fps)
        rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop)
        datos['tempo'] = float(np.atleast_1d(tempo)[0])
        datos['beats'] = [int(b) for b in beats]
        print('tempo', round(datos['tempo'], 1))
        print('rms dB cada 30 f:', [round(float(20 * np.log10(rms[i:i + 30].mean() + 1e-9)), 1) for i in range(0, len(rms), 30)])
    (out / 'datos.json').write_text(json.dumps(datos), encoding='utf-8')


if __name__ == '__main__':
    main()

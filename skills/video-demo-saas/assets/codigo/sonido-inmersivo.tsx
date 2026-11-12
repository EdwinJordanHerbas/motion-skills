// Sonido inmersivo para un mundo 3D en un solo plano: extracto de la intro 3D de NeumorStudio (33,6 s, 12 nov 2026),
// hecha con esta skill. No compila suelto: las constantes del guion (GOLPE, ATERRIZA, TOQUES, N_FIN, FRAMES…),
// `camara`, `p`, `E` y `timeline` vienen de tu composición. Léelo y adapta (references/sonido.md, «Sonido inmersivo»):
//   - Voz: tramos desde el primer sonido de cada frase (`from`), `enVoz` con rampas, apartar a medias una frase final.
//   - Efectos: SFX con desfase = pico medido (scripts/desfases.py), CUES colgados de las constantes del guion, tono
//     por escala, momentos grandes en capas.
//   - Mezcla: ganancia común de efectos (FX_GANA): sin ella, los efectos iban 13 dB por debajo de la música.
//   - VEL_CAM + Aire (aire que sigue a la cámara), Ambiente cortado en seco por el golpe, Musica que se aparta.
//   - Guarda: si el golpe final deja de caer en el de la música, el render falla en vez de salir desincronizado.
// Orden de montaje en la composición: <Ambiente /><Aire /><Efectos /><Musica /><Voz />.
// Los efectos salen de assets/sonidos/receta.json con scripts/paquete_efectos.py (en public/proyecto/sfx).

import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

/* ---------- voz ---------- */

// Cada frase la coloca el script de voz (references/voz.md): `from` es su primer sonido y `words` sus palabras.
type Linea = {id: string; text: string; from: number; to: number; file?: string; words?: {w: string; f: number; e: number}[]};
// Con CON_VOZ = false, el vídeo vuelve a los tiempos sin voz (apúntalos los dos en el README).
const CON_VOZ = true;
const VOZ = CON_VOZ ? (timeline.vo as Linea[]).filter((l) => l.file) : [];
// La frase final cae sobre la cola del golpe de la música: apartarla entera dejaba un silencio y no apartarla pasaba
// de −1 dBTP. Se aparta a medias y esa frase va 1,4 dB más baja.
const VOZ_APARTA: Record<string, number> = {cierre: 0.5};
const VOZ_GANA: Record<string, number> = {cierre: 0.85};
/** Tramos con voz, del primer sonido (`from`) a su última palabra. La alineación de palabras puede llegar tarde: en la
 *  intro, una palabra sonaba en f728 y su alineación decía f735; la música aún no se había apartado (+0,1 dBTP). */
const TRAMOS: [number, number, number][] = VOZ.map((l) => [
  l.from,
  l.words?.length ? l.words[l.words.length - 1].e : l.to,
  VOZ_APARTA[l.id] ?? 1,
]);
/** 0-1: cuánto hay voz en el fotograma, con rampas de 6 fotogramas antes y 10 después. */
const enVoz = (fr: number) => TRAMOS.reduce((m, [a, b, k]) => Math.max(m, k * Math.min(p(fr, a - 6, 6, E.lin), 1 - p(fr, b, 10, E.lin))), 0);
const Voz: React.FC = () => (
  <>
    {VOZ.map((l) => (
      <Sequence key={l.id} from={l.from} layout="none" name={`voz ${l.id}`}>
        <Html5Audio src={staticFile(l.file!)} volume={VOZ_GANA[l.id] ?? 1} />
      </Sequence>
    ))}
  </>
);

/* ---------- mezcla ---------- */

const MEZCLA = 1.16; // ganancia común de efectos y música: la mezcla queda hacia −15 LUFS
const FX_GANA = 1.8; // los efectos, ~5 dB arriba: con solo la música a −14 LUFS, los efectos daban −27 y no se oían
const GANA = 1.1; // todo 0,8 dB más, con los golpes grandes aligerados para no pasar de −1 dBTP
const MUSICA_VOL = 0.62; // la música, 1,6 dB más baja para que cada acción se oiga encima

/* ---------- efectos ---------- */

// Volumen y desfase de cada efecto. El desfase es el pico medido con scripts/desfases.py, no uno a ojo: con desfases a
// ojo, los barridos caían de 4 a 13 fotogramas tarde.
const SFX: Record<string, {vol: number; desfase: number}> = {
  'ui-click': {vol: 0.24, desfase: -3},
  'card-in': {vol: 0.18, desfase: -8},
  pop: {vol: 0.22, desfase: 0},
  transicion: {vol: 0.2, desfase: -9},
  success: {vol: 0.24, desfase: 0},
  'logo-hit': {vol: 0.34, desfase: 0},
  magia: {vol: 0.13, desfase: -4},
  vibra: {vol: 0.26, desfase: -3},
  slice: {vol: 0.16, desfase: -4},
  // el giro llega a su velocidad máxima a la mitad: el pico del barrido (f9) cae ahí, así que va sin desfase
  giro: {vol: 0.24, desfase: 0},
  riser: {vol: 0.2, desfase: -43},
  golpe: {vol: 0.4, desfase: 0},
  porcelana: {vol: 0.2, desfase: 0},
  toque: {vol: 0.16, desfase: 0},
  rodar: {vol: 0.22, desfase: -2},
  bisagra: {vol: 0.26, desfase: -4},
  contador: {vol: 0.15, desfase: 0},
  tinta: {vol: 0.24, desfase: -8},
  deslizar: {vol: 0.1, desfase: -6},
  succion: {vol: 0.22, desfase: -23},
  boton: {vol: 0.3, desfase: 0},
};
type Cue = {f: number; k: string; v?: number; tono?: number};
const ESCALA = [1, 1.122, 1.26, 1.498]; // do-re-mi-sol: los pops de una serie suben
const CUES: Cue[] = [
  // el objeto conductor (una bola de porcelana) suena a su material: más fuerte cuanto más se aplasta al aterrizar,
  // y a cristal cuando toca una pantalla
  ...ATERRIZA.map(([f, aplasta]): Cue => ({f, k: 'porcelana', v: 0.06 + 0.24 * aplasta})),
  ...TOQUES.map((f): Cue => ({f, k: 'toque'})),
  // el golpe que cambia la escena, en capas: la subida durante la caída, el golpe, el corte y lo que barre la mesa
  {f: GOLPE, k: 'riser'},
  {f: GOLPE, k: 'golpe', v: 0.24},
  {f: GOLPE, k: 'slice', v: 0.16},
  {f: GOLPE + 4, k: 'deslizar'},
  // cada objeto con su sonido
  {f: RUEDA, k: 'rodar'},
  {f: CHOCA, k: 'porcelana', v: 0.24, tono: 0.85}, // un choque, más grave
  {f: ABRE, k: 'bisagra'},
  {f: CUENTA, k: 'contador'},
  // una serie que sube por la escala
  ...ETIQUETAS.flatMap((a, i): Cue[] => [
    {f: a, k: 'slice', v: 0.12},
    {f: a + 14, k: 'pop', v: 0.12, tono: ESCALA[i]},
  ]),
  {f: PULSA, k: 'boton'},
  {f: BARRIDO, k: 'tinta'},
  // la marca final: todo se recoge (succión) hasta su golpe
  {f: N_FIN, k: 'succion'},
  {f: N_FIN, k: 'logo-hit', v: 0.34},
  {f: N_FIN, k: 'golpe', v: 0.24},
  // con voz, quita el centelleo que caiga encima de una palabra
  ...(CON_VOZ ? [] : [{f: N_FIN + 4, k: 'magia', v: 0.1}]),
];
const Efectos: React.FC = () => (
  <>
    {CUES.map((c, i) => {
      const fx = SFX[c.k];
      if (!fx) return null;
      return (
        <Sequence key={i} from={Math.max(0, c.f + fx.desfase)} layout="none">
          {/* bajo la voz, los efectos un 45 % más bajos (con FX_GANA, un 30 % taparía la voz) */}
          <Html5Audio
            src={staticFile(`proyecto/sfx/${c.k}.wav`)}
            volume={(c.v ?? fx.vol) * MEZCLA * GANA * FX_GANA * (1 - 0.45 * enVoz(c.f))}
            toneFrequency={c.tono ?? 1}
          />
        </Sequence>
      );
    })}
  </>
);

/* ---------- aire, ambiente y música ---------- */

/** 0-1: lo rápido que se mueve la cámara en cada fotograma (normalizado al percentil 95 del vídeo).
 *  `camara(f)` devuelve la cámara 3D: objetivo (tx, ty, tz), distancia d, elevación el y acimut az. */
const VEL_CAM: number[] = (() => {
  const raw = Array.from({length: FRAMES + 1}, (_, f) => {
    const a = camara(Math.max(0, f - 1));
    const b = camara(f + 1);
    return Math.hypot((b.tx - a.tx) / 40, (b.ty - a.ty) / 40, (b.tz - a.tz) / 40, (b.d - a.d) / 60, (b.el - a.el) / 1.2, (b.az - a.az) / 1.2);
  });
  const ref = [...raw].sort((x, y) => x - y)[Math.floor(raw.length * 0.95)] || 1;
  return raw.map((v) => Math.min(1, v / ref));
})();
// Un solo plano suena a un solo movimiento, no a un barrido por corte. Techo 0,14: con 0,2, el tramo más rápido de la
// cámara sumado a un golpe de la música pasaba de −1 dBTP.
const Aire: React.FC = () => (
  <Sequence from={0} layout="none" name="aire">
    <Html5Audio
      src={staticFile('proyecto/sfx/aire.wav')}
      volume={(fr: number) => MEZCLA * GANA * FX_GANA * (0.02 + 0.14 * VEL_CAM[Math.min(fr, FRAMES)] ** 0.8) * (1 - p(fr, FRAMES - 6, 5))}
    />
  </Sequence>
);
// El «antes» (todo a mano) tiene ambiente, y el golpe lo corta en seco: el silencio repentino es parte del golpe.
const Ambiente: React.FC = () => (
  <Sequence from={0} durationInFrames={GOLPE + 2} layout="none" name="ambiente">
    <Html5Audio
      src={staticFile('proyecto/sfx/ambiente.wav')}
      volume={(fr: number) => MEZCLA * GANA * FX_GANA * 0.16 * p(fr, 0, 3) * (1 - p(fr, GOLPE - 1, 2, E.lin))}
    />
  </Sequence>
);
// La música baja unos 8 dB (0,4) bajo cada frase de la voz.
const Musica: React.FC = () => (
  <Sequence from={0} layout="none" name="música">
    <Html5Audio
      src={staticFile('proyecto/musica.wav')}
      volume={(fr: number) => MUSICA_VOL * MEZCLA * GANA * (1 - 0.6 * enVoz(fr)) * p(fr, 0, 3) * (1 - p(fr, FRAMES - 6, 5))}
    />
  </Sequence>
);

// El golpe final de la música cae en el fotograma 948: cualquier cambio de tiempos tiene que dejar ahí la marca.
if (N_FIN !== 948) throw new Error(`N_FIN es ${N_FIN}, pero el golpe de la música cae en 948`);

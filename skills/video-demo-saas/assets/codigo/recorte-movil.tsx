import React from 'react';
import * as THREE from 'three';
import {aPantalla, matriz, MOVIL, type Pose} from './mundo3d';

/*
 * Un móvil 3D delante de una pantalla DOM encendida (la del portátil, por ejemplo). El DOM se pinta encima del lienzo
 * 3D, así que la pantalla taparía el cuerpo del móvil: se vería sin marco por un lado. Aquí se le recorta a la
 * pantalla la silueta del móvil. Nació en la intro 3D de NeumorStudio (references/imagen-3d.md).
 *
 *   <RecorteMovil m={poseDelMovil}>
 *     <Mapped quad={quadPantalla(lap)} …>…</Mapped>
 *   </RecorteMovil>
 *
 * Va dentro de la misma `Camara` que la pantalla, porque trabaja en coordenadas del mundo. Con `m = null` no recorta nada. La silueta es la envolvente de la cara y de la trasera con las esquinas redondas:
 * con la cara sola no basta, porque al girar asoma el canto. Compruébalo en los fotogramas en que se cruzan.
 */

// Las medidas del cuerpo del móvil en mundo3d.ts: losa(MOVIL.w, MOVIL.h, 58, 26, 4).
const RADIO = 58;
const GROSOR = 26;

/** Envolvente convexa (cadena monótona) de puntos en el cuadro. */
const casco = (pts: [number, number][]) => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cruz = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const abajo: [number, number][] = [];
  for (const q of s) {
    while (abajo.length >= 2 && cruz(abajo[abajo.length - 2], abajo[abajo.length - 1], q) <= 0) abajo.pop();
    abajo.push(q);
  }
  const arriba: [number, number][] = [];
  for (const q of [...s].reverse()) {
    while (arriba.length >= 2 && cruz(arriba[arriba.length - 2], arriba[arriba.length - 1], q) <= 0) arriba.pop();
    arriba.push(q);
  }
  return [...abajo.slice(0, -1), ...arriba.slice(0, -1)];
};

/** La silueta del cuerpo del móvil en el cuadro (1080 × 1920). */
export const siluetaMovil = (m: Pose): [number, number][] => {
  const mat = matriz(m);
  const {w, h} = MOVIL;
  const r = RADIO;
  const pts: [number, number][] = [];
  for (const z of [GROSOR / 2, -GROSOR / 2])
    for (const [cx, cy, a0] of [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, 90],
      [-w / 2 + r, -h / 2 + r, 180],
      [w / 2 - r, -h / 2 + r, 270],
    ])
      for (let k = 0; k <= 6; k++) {
        const a = ((a0 + 15 * k) * Math.PI) / 180;
        pts.push(aPantalla(new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), z).applyMatrix4(mat)));
      }
  return casco(pts);
};

/** Recorta a sus hijos (una pantalla DOM) la silueta del móvil que pasa por delante. */
export const RecorteMovil: React.FC<{m: Pose | null; children: React.ReactNode}> = ({m, children}) => {
  if (!m) return <>{children}</>;
  const sil = siluetaMovil(m);
  const d = `M-10 -10H1090V1930H-10Z M${sil.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z`;
  return <div style={{position: 'absolute', inset: 0, clipPath: `path(evenodd, "${d}")`}}>{children}</div>;
};

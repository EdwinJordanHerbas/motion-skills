import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {roundedRect} from './geometry';
import {type Quad} from './projection';

/*
 * The 3D devices of the reference video: a generic aluminium laptop and three phones, modelled here (no
 * downloaded models, no logos) and lit by a studio environment so metal and glass reflect.
 * World units are composition pixels: the plane z = 0 maps 1:1 onto the 1080×1920 frame, so a
 * pose written in CSS terms (x, y down, rotateX/rotateY in degrees) places the same object in 3D.
 * Screens are not drawn here: the DOM interface is mapped onto each screen with a homography.
 */

export const W = 1080;
export const H = 1920;
const D = 2400;
const FOV = (2 * Math.atan(H / 2 / D) * 180) / Math.PI;
const PR = 1.2; // the 2D camera zooms up to ~1.0× (zoom × the safe-zone scale): a little sharper than the frame
/*
 * Safe zone: the 2D camera now shows the world smaller and higher in the frame, so the world's
 * 1080×1920 edge falls inside the picture. The canvases cover this margin around it, or whatever
 * leaves the world (the phone and the coins dropping out of frame) would be cut at its edge.
 */
// Only what is needed: things leave the world downwards (the phone and the coins dropping out).
// Three canvases this size fill Chrome's memory fast: bigger ones left frames blank in a render.
export const MARGEN = {l: 140, r: 140, t: 60, b: 760};
export const CW = W + MARGEN.l + MARGEN.r;
export const CH = H + MARGEN.t + MARGEN.b;

/** CSS-style pose: rx tilts the top away, ry turns the right side away, rz turns clockwise on screen. */
export type Pose = {x: number; y: number; z: number; rx: number; ry: number; rz?: number; s: number; o: number};

const rad = (d: number) => (d * Math.PI) / 180;
export const matriz = (p: Pose) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(p.x, -p.y, p.z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(-p.rx), rad(p.ry), rad(-(p.rz ?? 0)), 'XYZ')),
    new THREE.Vector3(p.s, p.s, p.s),
  );

const camara = (margen = false) => {
  const c = new THREE.PerspectiveCamera(FOV, W / H, 10, 20000);
  c.position.set(W / 2, -H / 2, D);
  c.lookAt(W / 2, -H / 2, 0);
  // Same projection, wider window: the canvas pixel (x + l, y + t) is the world pixel (x, y).
  if (margen) c.setViewOffset(W, H, -MARGEN.l, -MARGEN.t, CW, CH);
  c.updateMatrixWorld(true);
  return c;
};
const PROYECTOR = camara();
const aPantalla = (v: THREE.Vector3): [number, number] => {
  const n = v.clone().project(PROYECTOR);
  return [((n.x + 1) / 2) * W, ((1 - n.y) / 2) * H];
};
/** Screen corners (top-left, top-right, bottom-right, bottom-left) of a w×h rectangle on an object's local plane z. */
export const quadDe = (p: Pose, w: number, h: number, z: number): Quad => {
  const m = matriz(p);
  return (
    [
      [-w / 2, h / 2],
      [w / 2, h / 2],
      [w / 2, -h / 2],
      [-w / 2, -h / 2],
    ] as const
  ).map(([x, y]) => aPantalla(new THREE.Vector3(x, y, z).applyMatrix4(m))) as Quad;
};

/* ---------- sizes shared with the DOM ---------- */

export const LAPTOP = {w: 960, h: 620, pantalla: {w: 916, h: 576}, frente: 6.6};
/** The laptop's pose is its hinge; the lid sits 8 px behind the hinge axis so it closes over the keys. */
const ATRAS = 8;
export type Portatil = {pose: Pose; abre: number}; // abre: angle between lid and base, degrees
const tapaMatriz = (l: Portatil) =>
  matriz(l.pose)
    .multiply(new THREE.Matrix4().makeRotationX(rad(90 - l.abre)))
    .multiply(new THREE.Matrix4().makeTranslation(0, LAPTOP.h / 2, -ATRAS));
/** Screen corners of the laptop's display, wherever the lid is. */
export const quadPantalla = (l: Portatil): Quad => {
  const m = tapaMatriz(l);
  const {w, h} = LAPTOP.pantalla;
  return (
    [
      [-w / 2, h / 2],
      [w / 2, h / 2],
      [w / 2, -h / 2],
      [-w / 2, -h / 2],
    ] as const
  ).map(([x, y]) => aPantalla(new THREE.Vector3(x, y, LAPTOP.frente).applyMatrix4(m))) as Quad;
};
export const MOVIL = {w: 330, h: 700, pantalla: {w: 304, h: 674}, frente: 13.4};

/** Signed area of a screen quad: positive while its front faces the camera. */
export const area = (q: Quad) => q.reduce((s, [x, y], i) => s + x * q[(i + 1) % 4][1] - q[(i + 1) % 4][0] * y, 0) / 2;

/* ---------- helpers ---------- */

const losa = (w: number, h: number, r: number, grosor: number, bisel: number) => {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - 2 * bisel, h - 2 * bisel, Math.max(1, r - bisel)), {
    depth: grosor - 2 * bisel,
    bevelEnabled: true,
    bevelThickness: bisel,
    bevelSize: bisel,
    bevelSegments: 5,
    curveSegments: 24,
  });
  g.translate(0, 0, -(grosor - 2 * bisel) / 2);
  g.computeVertexNormals();
  return g;
};

const sombraTex = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(40,25,10,0.55)');
  r.addColorStop(0.45, 'rgba(40,25,10,0.28)');
  r.addColorStop(1, 'rgba(40,25,10,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

type Mats = THREE.Material[];
const fade = (mats: Mats, o: number, base: Map<THREE.Material, number>) => {
  mats.forEach((m) => {
    m.opacity = (base.get(m) ?? 1) * o;
  });
};

/* ---------- the world ---------- */

export class Mundo {
  r: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  cam = camara(true);
  portatil = new THREE.Group();
  tapa = new THREE.Group();
  private sombraTapa!: THREE.MeshBasicMaterial;
  moviles: THREE.Group[] = [];
  matsPortatil: Mats = [];
  matsMovil: Mats[] = [];
  base = new Map<THREE.Material, number>();

  constructor(canvas: HTMLCanvasElement) {
    this.r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
    this.r.setPixelRatio(1);
    this.r.setSize(CW * PR, CH * PR, false);
    this.r.setClearColor(0x000000, 0);
    this.r.toneMapping = THREE.NeutralToneMapping;
    this.r.toneMappingExposure = 1.02;
    this.r.outputColorSpace = THREE.SRGBColorSpace;

    const pm = new THREE.PMREMGenerator(this.r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.95;
    const key = new THREE.DirectionalLight('#fff4e6', 1.5);
    key.position.set(W / 2 - 1600, -H / 2 + 2200, 2600);
    key.target.position.set(W / 2, -H / 2, 0);
    const rim = new THREE.DirectionalLight('#ffd7b8', 1.1);
    rim.position.set(W / 2 + 2000, -H / 2 + 900, -1400);
    rim.target.position.set(W / 2, -H / 2, 0);
    this.scene.add(key, key.target, rim, rim.target);

    this.hacerPortatil();
    for (let j = 0; j < 3; j++) {
      this.hacerMovil(j);
    }
  }

  private mat<T extends THREE.Material>(m: T, lista: Mats): T {
    m.transparent = true;
    this.base.set(m, m.opacity);
    lista.push(m);
    return m;
  }

  private hacerPortatil() {
    const L = this.matsPortatil;
    const alu = this.mat(new THREE.MeshPhysicalMaterial({color: '#d3d0c9', metalness: 1, roughness: 0.34, clearcoat: 0.25, clearcoatRoughness: 0.4}), L);
    const aluOsc = this.mat(new THREE.MeshPhysicalMaterial({color: '#9d998f', metalness: 1, roughness: 0.42}), L);
    const vidrio = this.mat(new THREE.MeshPhysicalMaterial({color: '#060505', metalness: 0, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03}), L);
    const tecla = this.mat(new THREE.MeshStandardMaterial({color: '#22201e', metalness: 0.05, roughness: 0.62}), L);
    const pad = this.mat(new THREE.MeshPhysicalMaterial({color: '#c7c3bb', metalness: 0.85, roughness: 0.2, clearcoat: 0.6}), L);
    const sombra = this.mat(new THREE.MeshBasicMaterial({map: sombraTex(), depthWrite: false, toneMapped: false}), L);
    const lente = this.mat(new THREE.MeshPhysicalMaterial({color: '#1b1a19', metalness: 0.2, roughness: 0.15, clearcoat: 1}), L);

    // Lid: aluminium shell, black glass bezel on the front, camera. It turns on the hinge (render()).
    const caja = new THREE.Group();
    caja.position.set(0, LAPTOP.h / 2, -ATRAS);
    const losaTapa = new THREE.Mesh(losa(LAPTOP.w, LAPTOP.h, 34, 12, 2.5), alu);
    const bisel = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(LAPTOP.w - 12, LAPTOP.h - 12, 28), 24), vidrio);
    bisel.position.z = 6.2;
    const cam = new THREE.Mesh(new THREE.CircleGeometry(4, 20), lente);
    cam.position.set(0, LAPTOP.h / 2 - 15, 6.4);
    caja.add(losaTapa, bisel, cam);
    this.tapa.add(caja);
    this.portatil.add(this.tapa);

    // Hinge, then the base lying flat from the hinge towards the viewer.
    const bisagra = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, LAPTOP.w - 120, 24), aluOsc);
    bisagra.rotation.z = Math.PI / 2;
    bisagra.position.set(0, -2, -ATRAS);
    this.portatil.add(bisagra);

    const pie = new THREE.Group();
    pie.position.set(0, -4, -20);
    const FONDO = 680;
    const g = losa(LAPTOP.w + 40, FONDO, 30, 16, 4);
    g.rotateX(-Math.PI / 2);
    g.translate(0, -8, FONDO / 2);
    const losaPie = new THREE.Mesh(g, alu);
    pie.add(losaPie);

    // Keyboard: a real six-row layout, every row 15 units wide, centred in a recessed well.
    const U = 58;
    const G = 6;
    const FILAS: {d: number; w: number[]}[] = [
      {d: 30, w: Array(14).fill(15 / 14)},
      {d: 52, w: [...Array(13).fill(1), 2]},
      {d: 52, w: [1.5, ...Array(12).fill(1), 1.5]},
      {d: 52, w: [1.75, ...Array(11).fill(1), 2.25]},
      {d: 52, w: [2.25, ...Array(10).fill(1), 2.75]},
      {d: 52, w: [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1]},
    ];
    const ANCHO = 15 * U;
    const Z0 = 40;
    const hondo = FILAS.reduce((a, f) => a + f.d, 0) + (FILAS.length - 1) * G + 24;
    const pozo = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(ANCHO + 24, hondo, 14), 12), aluOsc);
    pozo.rotation.x = -Math.PI / 2;
    pozo.position.set(0, 0.25, Z0 + hondo / 2);
    pie.add(pozo);
    const tg = new RoundedBoxGeometry(1, 1, 1, 2, 0.2);
    const teclas = new THREE.InstancedMesh(tg, tecla, 100);
    const m = new THREE.Matrix4();
    let k = 0;
    let z = Z0 + 12;
    FILAS.forEach((fila) => {
      let x = -ANCHO / 2;
      fila.w.forEach((u) => {
        m.compose(new THREE.Vector3(x + (u * U) / 2, 2, z + fila.d / 2), new THREE.Quaternion(), new THREE.Vector3(u * U - G, 5, fila.d));
        teclas.setMatrixAt(k++, m);
        x += u * U;
      });
      z += fila.d + G;
    });
    teclas.count = k;
    teclas.instanceMatrix.needsUpdate = true;
    pie.add(teclas);

    // Trackpad: glass-smooth, with a thin darker edge.
    const zPad = Z0 + hondo + 18 + 120;
    const borde = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(488, 248, 20), 16), aluOsc);
    borde.rotation.x = -Math.PI / 2;
    borde.position.set(0, 0.25, zPad);
    const tp = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(480, 240, 18), 16), pad);
    tp.rotation.x = -Math.PI / 2;
    tp.position.set(0, 0.5, zPad);
    pie.add(borde, tp);

    const s = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1100), sombra);
    s.rotation.x = -Math.PI / 2;
    s.position.set(0, -20, FONDO / 2);
    s.renderOrder = -1;
    pie.add(s);
    // The lid's soft shadow on the wall behind it only exists while the lid stands up (render()).
    this.sombraTapa = this.mat(new THREE.MeshBasicMaterial({map: sombraTex(), depthWrite: false, toneMapped: false}), L);
    const sLid = new THREE.Mesh(new THREE.PlaneGeometry(1300, 900), this.sombraTapa);
    sLid.position.set(40, -120, -160);
    sLid.renderOrder = -1;
    caja.add(sLid);

    this.portatil.add(pie);
    this.portatil.matrixAutoUpdate = false;
    this.scene.add(this.portatil);
  }

  private hacerMovil(j: number) {
    const L: Mats = [];
    const tit = this.mat(new THREE.MeshPhysicalMaterial({color: '#8f8a82', metalness: 1, roughness: 0.27, clearcoat: 0.5, clearcoatRoughness: 0.2}), L);
    const vidrio = this.mat(new THREE.MeshPhysicalMaterial({color: '#040303', metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03}), L);
    const sombra = this.mat(new THREE.MeshBasicMaterial({map: sombraTex(), depthWrite: false, toneMapped: false, opacity: 0.8}), L);
    const g = new THREE.Group();
    const cuerpo = new THREE.Mesh(losa(MOVIL.w, MOVIL.h, 58, 26, 4), tit);
    const frente = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(MOVIL.w - 8, MOVIL.h - 8, 54), 24), vidrio);
    frente.position.z = 13.2;
    g.add(cuerpo, frente);
    const boton = (x: number, y: number, h: number) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(6, h, 12, 2, 2.5), tit);
      b.position.set(x, y, 0);
      g.add(b);
    };
    boton(MOVIL.w / 2 + 1.5, MOVIL.h / 2 - 205, 90);
    boton(-MOVIL.w / 2 - 1.5, MOVIL.h / 2 - 165, 50);
    boton(-MOVIL.w / 2 - 1.5, MOVIL.h / 2 - 230, 50);
    // The back is seen when the phone flips: a frosted glass panel and a camera plateau, no logos.
    const trasera = this.mat(new THREE.MeshPhysicalMaterial({color: '#cfcac1', metalness: 0.15, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.25}), L);
    const lenteM = this.mat(new THREE.MeshPhysicalMaterial({color: '#0d0c0b', metalness: 0.3, roughness: 0.1, clearcoat: 1}), L);
    const aro = this.mat(new THREE.MeshPhysicalMaterial({color: '#a19c93', metalness: 1, roughness: 0.25}), L);
    const vuelta = new THREE.Group();
    vuelta.rotation.y = Math.PI;
    vuelta.position.z = -13.2;
    vuelta.add(new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(MOVIL.w - 8, MOVIL.h - 8, 54), 24), trasera));
    // Seen from behind, the camera sits top-left.
    const cx = -(MOVIL.w / 2 - 95);
    const cy = MOVIL.h / 2 - 95;
    const meseta = new THREE.Mesh(new RoundedBoxGeometry(150, 150, 8, 3, 3), trasera);
    meseta.position.set(cx, cy, 4);
    vuelta.add(meseta);
    [
      [-32, 32],
      [-32, -32],
      [32, 0],
    ].forEach(([dx, dy]) => {
      const a = new THREE.Mesh(new THREE.CylinderGeometry(27, 27, 6, 32), aro);
      a.rotation.x = Math.PI / 2;
      a.position.set(cx + dx, cy + dy, 10);
      const l = new THREE.Mesh(new THREE.CircleGeometry(21, 32), lenteM);
      l.position.set(cx + dx, cy + dy, 13.2);
      vuelta.add(a, l);
    });
    g.add(vuelta);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(MOVIL.w * 1.9, MOVIL.h * 1.35), sombra);
    s.position.set(18, -60, -90);
    s.renderOrder = -1;
    g.add(s);
    g.matrixAutoUpdate = false;
    this.scene.add(g);
    this.moviles.push(g);
    this.matsMovil.push(L);
  }

  render(lap: Portatil | null, moviles: (Pose | null)[]) {
    const pon = (obj: THREE.Object3D, p: Pose | null, mats: Mats) => {
      obj.visible = !!p && p.o > 0.002;
      if (!p || !obj.visible) {
        return;
      }
      obj.matrix.copy(matriz(p));
      obj.matrixWorldNeedsUpdate = true;
      fade(mats, p.o, this.base);
    };
    pon(this.portatil, lap ? lap.pose : null, this.matsPortatil);
    if (lap) {
      this.tapa.rotation.x = rad(90 - lap.abre);
      const k = Math.min(1, Math.max(0, (lap.abre - 60) / 32));
      this.sombraTapa.opacity *= k * k;
      this.sombraTapa.visible = k > 0.01;
    }
    this.moviles.forEach((g, j) => pon(g, moviles[j], this.matsMovil[j]));
    this.r.render(this.scene, this.cam);
  }
}

/* ---------- the payout: gold coins and paper notes, drawn in front of the screens ---------- */

const texMoneda = (simbolo: string) => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const r = g.createRadialGradient(100, 90, 10, 128, 128, 140);
  r.addColorStop(0, '#fff1c4');
  r.addColorStop(0.55, '#f0c35a');
  r.addColorStop(1, '#c58b25');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  g.lineWidth = 9;
  g.strokeStyle = 'rgba(150,100,20,0.55)';
  g.beginPath();
  g.arc(128, 128, 104, 0, Math.PI * 2);
  g.stroke();
  g.font = '700 150px "Instrument Sans", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,248,220,0.85)';
  g.fillText(simbolo, 124, 136);
  g.fillStyle = 'rgba(160,105,20,0.9)';
  g.fillText(simbolo, 130, 140);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const texBillete = (simbolo: string) => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const l = g.createLinearGradient(0, 0, 512, 256);
  l.addColorStop(0, '#d9efe0');
  l.addColorStop(1, '#a9d8bb');
  g.fillStyle = l;
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = 'rgba(40,110,70,0.45)';
  g.lineWidth = 6;
  g.strokeRect(14, 14, 484, 228);
  g.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.arc(380, 128, 30 + i * 9, 0, Math.PI * 2);
    g.stroke();
  }
  g.font = '700 150px "Instrument Sans", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(30,95,60,0.8)';
  g.fillText(simbolo, 150, 136);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

export const MONEDAS = 12;
export const BILLETES = 1;

export class Dinero {
  r: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  cam = camara(true);
  monedas: THREE.InstancedMesh;
  billetes: THREE.InstancedMesh;

  /** `simbolo` goes on the coins' face and the note (€, $, £…). */
  constructor(canvas: HTMLCanvasElement, simbolo = '€') {
    this.r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
    this.r.setPixelRatio(1);
    this.r.setSize(CW * PR, CH * PR, false);
    this.r.setClearColor(0x000000, 0);
    this.r.toneMapping = THREE.NeutralToneMapping;
    this.r.toneMappingExposure = 1.2;
    this.r.outputColorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(this.r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight('#fff4e6', 1.6);
    key.position.set(W / 2 - 1600, -H / 2 + 2200, 2600);
    key.target.position.set(W / 2, -H / 2, 0);
    this.scene.add(key, key.target);

    const canto = new THREE.MeshPhysicalMaterial({color: '#e2ad45', metalness: 1, roughness: 0.28, clearcoat: 0.4});
    // The coins face the camera, where a full metal reflects the dark room behind it; less metal, more of the gold texture.
    const cara = new THREE.MeshPhysicalMaterial({color: '#ffffff', map: texMoneda(simbolo), metalness: 0.55, roughness: 0.34, clearcoat: 0.6});
    const gm = new THREE.CylinderGeometry(34, 34, 7, 48);
    gm.rotateX(Math.PI / 2);
    this.monedas = new THREE.InstancedMesh(gm, [canto, cara, cara], MONEDAS);
    this.monedas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const gb = new THREE.PlaneGeometry(200, 100, 16, 1);
    const pos = gb.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, 10 * Math.sin((pos.getX(i) / 200) * Math.PI));
    }
    gb.computeVertexNormals();
    const papel = new THREE.MeshStandardMaterial({map: texBillete(simbolo), side: THREE.DoubleSide, roughness: 0.7, metalness: 0});
    this.billetes = new THREE.InstancedMesh(gb, papel, BILLETES);
    this.billetes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.monedas, this.billetes);
  }

  render(monedas: (Pose | null)[], billetes: (Pose | null)[]) {
    const vacio = new THREE.Matrix4().makeScale(0, 0, 0);
    const pon = (mesh: THREE.InstancedMesh, ps: (Pose | null)[]) => {
      ps.forEach((p, i) => mesh.setMatrixAt(i, p && p.o > 0.01 ? matriz(p) : vacio));
      mesh.instanceMatrix.needsUpdate = true;
    };
    pon(this.monedas, monedas);
    pon(this.billetes, billetes);
    this.r.render(this.scene, this.cam);
  }
}

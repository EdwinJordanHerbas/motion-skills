import * as THREE from 'three';
import {smooth, V} from './motion';

/*
 * Geometry and textures that several spots reuse: a flexible tube that can run along any path
 * (the persistent actor of a film), banded textures, glows and rounded shapes.
 */

// A tube rebuilt every frame from a centre line. Radius and texture coordinate are per point,
// so it can taper, cap, thin out or carry stripes that keep their proportions.
export class Tube {
  mesh: THREE.Mesh;
  geo = new THREE.BufferGeometry();
  pos: Float32Array;
  nor: Float32Array;
  uv: Float32Array;

  constructor(
    public points: number,
    public radial: number,
    mat: THREE.Material,
  ) {
    const ring = radial + 1;
    const verts = points * ring;
    this.pos = new Float32Array(verts * 3);
    this.nor = new Float32Array(verts * 3);
    this.uv = new Float32Array(verts * 2);
    const index: number[] = [];
    for (let i = 0; i < points - 1; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * ring + j;
        const b = a + 1;
        const d = a + ring;
        const e = b + ring;
        index.push(a, b, d, b, e, d);
      }
    }
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3));
    this.geo.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2));
    this.geo.setIndex(index);
    this.mesh = new THREE.Mesh(this.geo, mat);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
  }

  update(centre: THREE.Vector3[], rad: (i: number) => number, stripe: (i: number) => number) {
    const P = this.points;
    const R = this.radial;
    const T = new THREE.Vector3();
    const N = V(0.31, 0.52, 0.8).normalize();
    const B = new THREE.Vector3();
    const out = new THREE.Vector3();
    for (let i = 0; i < P; i++) {
      T.copy(centre[Math.min(i + 1, P - 1)]).sub(centre[Math.max(i - 1, 0)]).normalize();
      // Parallel transport: the ring never flips, so the stripes never jump.
      N.addScaledVector(T, -N.dot(T)).normalize();
      B.crossVectors(T, N);
      const r = rad(i);
      const v = stripe(i);
      for (let j = 0; j <= R; j++) {
        const th = (j / R) * Math.PI * 2;
        out.copy(N).multiplyScalar(Math.cos(th)).addScaledVector(B, Math.sin(th));
        const k = i * (R + 1) + j;
        this.pos[k * 3] = centre[i].x + out.x * r;
        this.pos[k * 3 + 1] = centre[i].y + out.y * r;
        this.pos[k * 3 + 2] = centre[i].z + out.z * r;
        this.nor[k * 3] = out.x;
        this.nor[k * 3 + 1] = out.y;
        this.nor[k * 3 + 2] = out.z;
        this.uv[k * 2] = j / R;
        this.uv[k * 2 + 1] = v;
      }
    }
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.normal as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.uv as THREE.BufferAttribute).needsUpdate = true;
  }
}

// Diagonal bands in the given colours, tiling in both directions.
export const bandTexture = (colors: string[], maxAniso: number) => {
  const n = 512;
  const c = document.createElement('canvas');
  c.width = n;
  c.height = n;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const img = g.createImageData(n, n);
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const bands = colors.map(hex);
  const k = bands.length;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const t = (((x + y) / n) % 1) * k;
      const b = Math.floor(t) % k;
      const w = smooth(0.97, 1, t - Math.floor(t));
      const a = bands[b];
      const d = bands[(b + 1) % k];
      const p = (y * n + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        img.data[p + ch] = a[ch] + (d[ch] - a[ch]) * w;
      }
      img.data[p + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  return t;
};

// Soft radial falloff for additive light pools and wall glows.
export const glowTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.35, 'rgba(255,255,255,0.46)');
  r.addColorStop(0.7, 'rgba(255,255,255,0.1)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

export const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

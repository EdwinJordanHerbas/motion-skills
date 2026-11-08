import React from 'react';
import * as THREE from 'three';
import {applyPose, type Pose} from './motion';

/*
 * Crisp DOM interface mapped onto planes of the 3D world. The 3D math runs on a private camera
 * that mirrors the render camera, so any React component can ask where a world rectangle sits on
 * screen at a given frame and draw itself there with a homography.
 */

export type Quad = [number, number][];

export const makeProjector = (fov: number, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.05, 300);
  const toScreen = (v: THREE.Vector3): [number, number] | null => {
    const inCam = v.clone().applyMatrix4(cam.matrixWorldInverse);
    if (inCam.z > -0.05) {
      return null;
    }
    const n = v.clone().project(cam);
    return [((n.x + 1) / 2) * w, ((1 - n.y) / 2) * h];
  };
  return {
    camera: cam,
    pose: (p: Pose) => applyPose(cam, p),
    toScreen,
    // Corners in order: top-left, top-right, bottom-right, bottom-left.
    quadOf: (pts: THREE.Vector3[]): Quad | null => {
      const q = pts.map(toScreen);
      return q.some((p) => p === null) ? null : (q as Quad);
    },
  };
};

export const toMatrix3d = (q: Quad, w: number, h: number) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + hh * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + hh * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1].join(',')})`;
};

// Blur that matches how far a mapped layer travels within half a frame, like the 3D shutter.
export const travelBlur = (a: Quad | null, b: Quad | null) => {
  if (!a || !b) {
    return 0;
  }
  let m = 0;
  a.forEach((p, i) => {
    m = Math.max(m, Math.hypot(p[0] - b[i][0], p[1] - b[i][1]));
  });
  return Math.min(m / 3.5, 14);
};

export const Mapped: React.FC<{
  quad: Quad;
  w: number;
  h: number;
  blur?: number;
  opacity?: number;
  radius?: number;
  children: React.ReactNode;
}> = ({quad, w, h, blur = 0, opacity = 1, radius = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      opacity,
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: w,
        height: h,
        transformOrigin: '0 0',
        transform: toMatrix3d(quad, w, h),
        overflow: 'hidden',
        borderRadius: radius,
      }}
    >
      {children}
    </div>
  </div>
);

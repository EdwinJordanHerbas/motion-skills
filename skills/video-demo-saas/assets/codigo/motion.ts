import {Easing} from 'remotion';
import * as THREE from 'three';

/*
 * Timing and camera helpers shared by every spot. Every animated value is a pure function of the
 * (possibly fractional) frame, so motion-blur samples and re-renders give the same pixels.
 */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// The house curves. Entrances decelerate hard, exits accelerate, camera sweeps are asymmetric.
export const EASE = {
  io: Easing.bezier(0.65, 0, 0.2, 1),
  sweep: Easing.bezier(0.7, 0, 0.15, 1),
  out: Easing.bezier(0.2, 0, 0, 1),
  emph: Easing.bezier(0.2, 0, 0, 1),
  linear: Easing.linear,
};

export const ramp = (f: number, a: number, b: number, e: (x: number) => number = EASE.io) =>
  e(clamp01((f - a) / (b - a)));

export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// A camera pose: position, look-at point and up vector. Shots are poses; transitions mix them.
export type Pose = {p: THREE.Vector3; l: THREE.Vector3; up: THREE.Vector3};

export const mixPose = (a: Pose, b: Pose, w: number): Pose => ({
  p: a.p.clone().lerp(b.p, w),
  l: a.l.clone().lerp(b.l, w),
  up: a.up.clone().lerp(b.up, w).normalize(),
});

export const applyPose = (cam: THREE.PerspectiveCamera, pose: Pose) => {
  cam.position.copy(pose.p);
  cam.up.copy(pose.up);
  cam.lookAt(pose.l);
  cam.updateMatrixWorld(true);
};

// Distance at which a plane of the given height exactly fills the frame vertically.
export const fillDistance = (height: number, fov: number) =>
  height / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));

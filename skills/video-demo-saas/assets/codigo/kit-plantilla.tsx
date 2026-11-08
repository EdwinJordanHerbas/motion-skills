import {loadFont} from '@remotion/fonts';
import type React from 'react';
import {Easing, interpolate, staticFile} from 'remotion';
import {AJUSTES} from './ajustes';

/*
 * Shared pieces of the template: colours, type, easing and the frame helpers. Everything is a pure
 * function of the frame. Fonts come from ajustes.ts; without a file, the family is used if it is
 * installed and the system font otherwise.
 */

const {texto, mono} = AJUSTES.tipografia;
if (texto.archivo) {
  loadFont({family: texto.familia, url: staticFile(texto.archivo), weight: '100 900'});
}
if (mono.archivo) {
  loadFont({family: mono.familia, url: staticFile(mono.archivo), weight: '100 900'});
}

const SISTEMA = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const TEXTO = `'${texto.familia}', ${SISTEMA}`;
export const MONO: React.CSSProperties = {
  fontFamily: `'${mono.familia}', ui-monospace, 'Cascadia Mono', Consolas, 'SFMono-Regular', Menlo, monospace`,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

/** Neutral warm greys for the neumorphic set, and the accent from ajustes.ts. */
export const C = {
  acento: AJUSTES.acento,
  tinta: '#141311',
  papel: '#f4f2ee',
  papelLinea: '#ccc8bf',
  grisSala: '#bebab2',
  grisPapel: '#56534c',
  salaLinea: '#4b4842',
  error: '#b0261a',
  blanco: '#ffffff',
};

/** A hex colour (#rrggbb) with alpha, for glows and fills of the accent. */
export const alfa = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  out: Easing.bezier(0.2, 0.7, 0.2, 1),
  io: Easing.bezier(0.65, 0, 0.2, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  snap: Easing.bezier(0.3, 0, 0, 1),
};

/** 0 → 1 between frame a and a + d. */
export const p = (f: number, a: number, d = 14, e = E.out) => interpolate(f, [a, a + Math.max(1, d)], [0, 1], {...clamp, easing: e});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** `zonas`: draws in red what the feed apps may cover, for review renders only. */
export type Props = {zonas: boolean};
export const defaultProps: Props = {zonas: false};

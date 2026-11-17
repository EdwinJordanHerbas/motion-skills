import React from 'react';
import {Easing, spring} from 'remotion';
import {SANS, SERIF} from './estilo';

/*
 * Kit de elementos de interfaz para vídeo (13 nov 2026). Réplica en código de lo que repite el mercado: shadcn/ui,
 * Magic UI, Aceternity UI, Liquid Glass de Apple (iOS 26) y Material 3 Expressive. Catálogo y criterios en la skill
 * video-demo-saas, references/elementos-ui.md.
 *
 * Reglas: cada componente es función pura de sus props. El que llama calcula el progreso con muelles a partir del
 * fotograma (on, abre, t...) y el componente solo dibuja. Tamaños en px del mundo; el que llama coloca y escala.
 */

export {SANS, SERIF};

/* ---------- utilidades ---------- */

export const FPS = 30;
export const c01 = (x: number) => Math.min(1, Math.max(0, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const E = {
  io: Easing.bezier(0.45, 0, 0.2, 1),
  out: Easing.bezier(0.2, 0.7, 0.2, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  lin: (t: number) => t,
};
/** Progreso con curva entre a y a + dur. */
export const p = (f: number, a: number, dur: number, e: (t: number) => number = E.io) => e(c01((f - a) / dur));
/** Muelle que empieza en a. */
export const sp = (f: number, a: number, damping = 15, stiffness = 140, mass = 0.9) => (f < a ? 0 : spring({frame: f - a, fps: FPS, config: {damping, stiffness, mass}}));
/** Muelle con rebote marcado («¡pap!»). */
export const pap = (f: number, a: number) => (f < a ? 0 : spring({frame: f - a, fps: FPS, config: {damping: 9, stiffness: 210, mass: 0.6}}));
/** Pulso 0 → 1 → 0 en dur fotogramas (apretar y soltar). */
export const pulso = (f: number, a: number, dur: number) => Math.sin(Math.PI * c01((f - a) / dur));

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mezcla dos colores #rrggbb. */
export const mezcla = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * c01(t))).join(',')})`;
};
/** #rrggbb con alfa. */
export const alfa = (c: string, a: number) => `rgba(${hex(c).join(',')},${a})`;

/* ---------- color y tipografía ---------- */

/** Un color por negocio; el neutro (tinta y porcelana) es el de tu marca: cámbialo por el suyo. */
export const COLOR = {
  tinta: '#17181f',
  porcelana: '#e8e6e1',
  gris: '#8a8f9e',
  azul: '#2f5bff',
  casa: '#ff8a3d',
  musica: '#8b5cf6',
  restaurante: '#e5533d',
  lima: '#b8f53c',
  rosa: '#ff4f8b',
  cian: '#3cd6ff',
  tienda: '#2f5bff',
  exito: '#22c55e',
};

export const texto = (size: number, color: string, peso = 600, tracking = -0.03): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: peso,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  lineHeight: 1.12,
  color,
  whiteSpace: 'nowrap',
});

/* ---------- cristal ---------- */

export type Tono = 'claro' | 'oscuro';

/** Tarjeta de cristal (Liquid Glass tranquilo): clara sobre fotos con luz, oscura sobre fotos de noche. */
export const vidrio = (tono: Tono = 'claro', r = 48): React.CSSProperties =>
  tono === 'claro'
    ? {
        borderRadius: r,
        background: 'linear-gradient(155deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.42) 55%, rgba(255,255,255,0.55) 100%)',
        backdropFilter: 'blur(36px) saturate(180%)',
        WebkitBackdropFilter: 'blur(36px) saturate(180%)',
        border: '1.5px solid rgba(255,255,255,0.88)',
        boxShadow: '0 50px 110px rgba(8,20,60,0.3), 0 12px 30px rgba(8,20,60,0.14), inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -2px 10px rgba(255,255,255,0.3)',
        boxSizing: 'border-box',
      }
    : {
        borderRadius: r,
        background: 'linear-gradient(155deg, rgba(44,46,62,0.66) 0%, rgba(16,17,26,0.56) 60%, rgba(30,32,46,0.62) 100%)',
        backdropFilter: 'blur(36px) saturate(160%)',
        WebkitBackdropFilter: 'blur(36px) saturate(160%)',
        border: '1.5px solid rgba(255,255,255,0.2)',
        boxShadow: '0 50px 110px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.25), inset 0 1.5px 0 rgba(255,255,255,0.24)',
        boxSizing: 'border-box',
      };

/** Tinta del texto sobre cada cristal. */
export const tintaDe = (tono: Tono) => (tono === 'claro' ? COLOR.tinta : '#f4f4f7');
export const grisDe = (tono: Tono) => (tono === 'claro' ? '#6b7080' : 'rgba(235,236,245,0.62)');

/** Pomo en cristal líquido: lente transparente con borde de luz (lo que hace iOS 26 mientras se toca). */
const pomoCristal = (vidrioT: number): React.CSSProperties => ({
  background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,${mix(1, 0.75, vidrioT)}) 0%, rgba(255,255,255,${mix(1, 0.16, vidrioT)}) ${mix(100, 62, vidrioT)}%, rgba(255,255,255,${mix(1, 0.3, vidrioT)}) 100%)`,
  border: `${2 * vidrioT}px solid rgba(255,255,255,${0.95 * vidrioT})`,
  boxShadow: `0 ${mix(6, 14, vidrioT)}px ${mix(14, 30, vidrioT)}px rgba(0,0,0,${mix(0.22, 0.28, vidrioT)}), inset 0 ${3 * vidrioT}px ${6 * vidrioT}px rgba(255,255,255,${0.9 * vidrioT}), inset 0 -${4 * vidrioT}px ${10 * vidrioT}px rgba(255,255,255,${0.35 * vidrioT})`,
  backdropFilter: vidrioT > 0.02 ? `blur(${1.5 * vidrioT}px) saturate(${100 + 80 * vidrioT}%)` : undefined,
  boxSizing: 'border-box',
});

/* ---------- iconos de trazo (propios, sin logotipos ajenos) ---------- */

const RUTAS: Record<string, string> = {
  bombilla: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z',
  sol: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  nota: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  calendario: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8 3v4M16 3v4',
  check: 'M5 12.5l4.6 4.5L19 7.5',
  campana: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4',
  corazon: 'M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z',
  grafico: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  buscar: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.6-4.6',
  casa: 'M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5',
  plato: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM2.5 4v6M2.5 10v10M21.5 4c-1.5 1-2 3-2 5s1 2.5 2 2.5V20',
  reloj: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2',
  bolsa: 'M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8',
  pasos: 'M8 3.5c1.7 0 2.6 1.6 2.6 3.6 0 2.4-1 3.4-1 5.4H6.6c0-2-1.1-3-1.1-5.4C5.5 5.1 6.3 3.5 8 3.5zM6.6 14.5h3v1.6a1.5 1.5 0 0 1-3 0zM16 6.5c1.7 0 2.5 1.6 2.5 3.6 0 2.4-1 3.4-1 5.4h-3c0-2-1.1-3-1.1-5.4 0-2 .9-3.6 2.6-3.6zM14.5 17.5h3v1.6a1.5 1.5 0 0 1-3 0z',
  play: 'M8 5.5v13l10.5-6.5z',
  pausa: 'M8 5v14M16 5v14',
  sig: 'M5 6v12l8.5-6zM18 6v12',
  ant: 'M19 6v12l-8.5-6zM6 6v12',
  mas: 'M12 5v14M5 12h14',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  persona: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4.5 20c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5',
  ajustes: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4.5v5M8 14.5v5',
  mensaje: 'M4 4.5h16A1.5 1.5 0 0 1 21.5 6v10a1.5 1.5 0 0 1-1.5 1.5H10l-5.5 4v-4H4A1.5 1.5 0 0 1 2.5 16V6A1.5 1.5 0 0 1 4 4.5z',
  rayo: 'M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z',
};
export type NombreIcono = keyof typeof RUTAS;

export const Icono: React.FC<{n: NombreIcono; size: number; color: string; grosor?: number; relleno?: boolean; dibujo?: number}> = ({n, size, color, grosor = 2, relleno = false, dibujo}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', flexShrink: 0}}>
    <path
      d={RUTAS[n]}
      fill={relleno ? color : 'none'}
      stroke={color}
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(dibujo === undefined ? {} : {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - c01(dibujo)})}
    />
  </svg>
);

/** Icono en su cuadrado de color (como el icono de una app, sin ser ninguna). */
export const Insignia: React.FC<{n: NombreIcono; color: string; size?: number}> = ({n, color, size = 84}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.27,
      background: `linear-gradient(160deg, ${mezcla(color, '#ffffff', 0.22)}, ${color} 60%, ${mezcla(color, '#000000', 0.12)})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 20px ${alfa(color, 0.35)}, inset 0 1.5px 0 rgba(255,255,255,0.4)`,
      flexShrink: 0,
    }}
  >
    <Icono n={n} size={size * 0.52} color="#fff" grosor={2.2} />
  </div>
);

/** Sello «Ejemplo» para los datos de ejemplo. */
export const Sello: React.FC<{tono?: Tono; size?: number}> = ({tono = 'claro', size = 24}) => (
  <div
    style={{
      ...texto(size, tono === 'claro' ? '#5b6070' : 'rgba(240,240,248,0.8)', 600, 0),
      padding: `${size * 0.22}px ${size * 0.55}px`,
      borderRadius: 999,
      border: `1.5px dashed ${tono === 'claro' ? 'rgba(60,66,90,0.35)' : 'rgba(255,255,255,0.35)'}`,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: size * 0.78,
    }}
  >
    Ejemplo
  </div>
);

/* ---------- controles ---------- */

/**
 * Interruptor. on: 0 → 1 (con el rebote del muelle); presion: 0 → 1 mientras se aprieta (el pomo se ensancha y se
 * vuelve cristal, como en iOS 26).
 */
export const Interruptor: React.FC<{on: number; presion?: number; color: string; w?: number; tono?: Tono}> = ({on, presion = 0, color, w = 200, tono = 'claro'}) => {
  const h = w * 0.6;
  const pad = h * 0.09;
  const d = h - 2 * pad;
  const viaje = c01(on);
  const estira = 0.38 * Math.sin(Math.PI * viaje) + 0.22 * presion;
  const kw = d * (1 + estira);
  const x = pad + (w - 2 * pad - kw) * viaje + 6 * (on - viaje);
  const vid = c01(presion + 0.8 * Math.sin(Math.PI * viaje));
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: h / 2, background: mezcla(tono === 'claro' ? '#d9dbe3' : '#3a3c4c', color, viaje), boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.12)'}}>
      <div style={{position: 'absolute', left: x, top: pad - (d * 0.14 * vid) / 2, width: kw, height: d * (1 + 0.14 * vid), borderRadius: d, ...pomoCristal(vid)}} />
    </div>
  );
};

/** Deslizador fino (valor 0-1); activo: 0 → 1 mientras se arrastra (el pomo crece y se vuelve cristal). */
export const Deslizador: React.FC<{valor: number; activo?: number; color: string; w?: number; tono?: Tono}> = ({valor, activo = 0, color, w = 600, tono = 'claro'}) => {
  const th = 14;
  const kw = 70 * (1 + 0.4 * activo);
  const kh = 44 * (1 + 0.4 * activo);
  const x = c01(valor) * w;
  return (
    <div style={{position: 'relative', width: w, height: kh}}>
      <div style={{position: 'absolute', left: 0, top: kh / 2 - th / 2, width: w, height: th, borderRadius: th, background: tono === 'claro' ? 'rgba(30,35,60,0.14)' : 'rgba(255,255,255,0.18)'}} />
      <div style={{position: 'absolute', left: 0, top: kh / 2 - th / 2, width: x, height: th, borderRadius: th, background: color}} />
      <div style={{position: 'absolute', left: x - kw / 2, top: 0, width: kw, height: kh, borderRadius: kh, ...pomoCristal(activo)}} />
    </div>
  );
};

/** Deslizador grueso del Centro de control: una losa que se llena, con icono y porcentaje. */
export const DeslizadorGrueso: React.FC<{valor: number; activo?: number; color: string; w?: number; h?: number; icono?: NombreIcono; tono?: Tono}> = ({
  valor,
  activo = 0,
  color,
  w = 700,
  h = 112,
  icono = 'sol',
  tono = 'oscuro',
}) => {
  const fill = mix(h, w, c01(valor));
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: h / 2, background: tono === 'claro' ? 'rgba(30,35,60,0.1)' : 'rgba(255,255,255,0.12)', overflow: 'hidden', transform: `scale(${1 + 0.025 * activo})`}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: fill,
          height: h,
          borderRadius: h / 2,
          background: `linear-gradient(90deg, ${mezcla(color, '#ffffff', 0.15)}, ${color})`,
          boxShadow: `0 0 ${40 * activo}px ${alfa(color, 0.6)}`,
        }}
      />
      {/* el borde derecho del relleno es el pomo: se aclara al arrastrar */}
      <div style={{position: 'absolute', left: fill - h * 0.5 - 12, top: h * 0.2, width: 8, height: h * 0.6, borderRadius: 4, background: `rgba(255,255,255,${0.55 + 0.45 * activo})`}} />
      <div style={{position: 'absolute', left: h * 0.32, top: h * 0.27}}>
        <Icono n={icono} size={h * 0.46} color="#fff" grosor={2.2} />
      </div>
      <div style={{position: 'absolute', right: h * 0.36, top: 0, height: h, display: 'flex', alignItems: 'center', ...texto(h * 0.38, tono === 'claro' ? COLOR.tinta : '#fff', 600, -0.02), fontVariantNumeric: 'tabular-nums'}}>
        {Math.round(c01(valor) * 100)} %
      </div>
    </div>
  );
};

/** Control segmentado con indicador «líquido». pos: índice en coma flotante (1,5 = a medio camino). */
export const Segmentado: React.FC<{opciones: string[]; pos: number; w?: number; h?: number; tono?: Tono; color?: string}> = ({opciones, pos, w = 640, h = 88, tono = 'claro', color}) => {
  const pad = 7;
  const n = opciones.length;
  const sw = (w - 2 * pad) / n;
  const fr = pos - Math.floor(pos);
  const estira = 0.32 * Math.sin(Math.PI * fr);
  const iw = sw * (1 + estira);
  const ix = pad + pos * sw - (iw - sw) / 2;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: h / 2, background: tono === 'claro' ? 'rgba(30,35,60,0.09)' : 'rgba(255,255,255,0.1)'}}>
      <div
        style={{
          position: 'absolute',
          left: ix,
          top: pad - 3 * estira,
          width: iw,
          height: h - 2 * pad + 6 * estira,
          borderRadius: h,
          background: color ?? (tono === 'claro' ? '#ffffff' : 'rgba(255,255,255,0.22)'),
          boxShadow: '0 6px 16px rgba(10,20,60,0.16), inset 0 1.5px 0 rgba(255,255,255,0.9)',
        }}
      />
      {opciones.map((o, i) => {
        const cubre = c01(1 - Math.abs(pos - i));
        const activo = color ? '#ffffff' : tintaDe(tono);
        return (
          <div key={o} style={{position: 'absolute', left: pad + i * sw, top: 0, width: sw, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', ...texto(h * 0.36, cubre > 0.5 ? activo : grisDe(tono), 600, -0.01)}}>
            {o}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Botón con estados: reposo → cargando → hecho. morf: 0 → 1 se cierra en círculo; giro: ángulo del arco de carga;
 * exito: 0 → 1 color de éxito y la marca se dibuja; vuelve: 0 → 1 se abre otra vez con el texto nuevo.
 */
export const BotonEstado: React.FC<{texto: string; hecho: string; color: string; w?: number; h?: number; presion?: number; morf?: number; giro?: number; exito?: number; vuelve?: number}> = ({
  texto: t,
  hecho,
  color,
  w = 640,
  h = 120,
  presion = 0,
  morf = 0,
  giro = 0,
  exito = 0,
  vuelve = 0,
}) => {
  const cierra = c01(morf) * (1 - c01(vuelve));
  const ancho = mix(w, h, cierra);
  const fondo = mezcla(color, COLOR.exito, exito);
  const enCarga = morf > 0.6 && exito < 0.5;
  return (
    <div style={{width: w, height: h, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          position: 'relative',
          width: ancho,
          height: h,
          borderRadius: h / 2,
          background: `linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0) 60%), ${fondo}`,
          boxShadow: `0 18px 40px ${exito > 0.5 ? alfa(COLOR.exito, 0.45) : alfa(color, 0.45)}, inset 0 2px 0 rgba(255,255,255,0.35)`,
          transform: `scale(${1 - 0.04 * presion})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* el texto se encoge hacia el centro al cerrarse (no se desvanece) */}
        {vuelve < 0.05 ? (
          <div style={{...texto(h * 0.36, '#fff', 600, -0.02), transform: `scale(${1 - c01(morf * 1.6)})`}}>{t}</div>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: h * 0.14, transform: `scale(${c01(vuelve * 1.3)})`}}>
            <Icono n="check" size={h * 0.4} color="#fff" grosor={3} />
            <div style={texto(h * 0.36, '#fff', 600, -0.02)}>{hecho}</div>
          </div>
        )}
        {enCarga ? (
          <svg width={h * 0.5} height={h * 0.5} viewBox="0 0 24 24" style={{position: 'absolute', left: ancho / 2 - h * 0.25, top: h * 0.25, transform: `rotate(${giro}deg)`}}>
            <circle cx={12} cy={12} r={9} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2.6} />
            <circle cx={12} cy={12} r={9} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray="0.28 1" />
          </svg>
        ) : null}
        {exito > 0 && vuelve < 0.05 ? (
          <div style={{position: 'absolute', left: ancho / 2 - h * 0.25, top: h * 0.25}}>
            <Icono n="check" size={h * 0.5} color="#fff" grosor={3} dibujo={exito} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Chips de elección (horas, tallas...). sel: índice elegido; t: 0 → 1 su relleno. */
export const Franjas: React.FC<{opciones: string[]; sel: number; t: number; color: string; tono?: Tono; size?: number; gap?: number}> = ({opciones, sel, t, color, tono = 'claro', size = 40, gap = 16}) => (
  <div style={{display: 'flex', gap}}>
    {opciones.map((o, i) => {
      const s = i === sel ? t : 0;
      return (
        <div
          key={o}
          style={{
            position: 'relative',
            padding: `${size * 0.48}px ${size * 0.62}px`,
            borderRadius: size * 0.7,
            border: `2px solid ${tono === 'claro' ? 'rgba(30,35,60,0.14)' : 'rgba(255,255,255,0.2)'}`,
            background: tono === 'claro' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
            transform: `scale(${1 + 0.06 * Math.sin(Math.PI * c01(s))})`,
          }}
        >
          <div style={{position: 'absolute', left: '50%', top: '50%', width: '130%', aspectRatio: '1', borderRadius: '50%', background: color, transform: `translate(-50%, -50%) scale(${c01(s)})`}} />
          <div style={{position: 'relative', ...texto(size, s > 0.45 ? '#fff' : tintaDe(tono), 600, -0.01), fontVariantNumeric: 'tabular-nums'}}>{o}</div>
        </div>
      );
    })}
  </div>
);

/** Casilla con la marca que se dibuja. */
export const Casilla: React.FC<{t: number; color: string; size?: number}> = ({t, color, size = 56}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      border: `${size * 0.06}px solid ${t > 0.05 ? color : 'rgba(30,35,60,0.25)'}`,
      background: t > 0.05 ? color : 'transparent',
      transform: `scale(${1 + 0.12 * Math.sin(Math.PI * c01(t))})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    }}
  >
    <Icono n="check" size={size * 0.72} color="#fff" grosor={3.2} dibujo={t} />
  </div>
);

/* ---------- entrada ---------- */

/** Paleta de comandos (⌘K): la búsqueda se escribe, los resultados se filtran y la fila activa se ilumina. */
export const Paleta: React.FC<{escrito: string; resultados: {icono: NombreIcono; texto: string; color: string}[]; visibles: number; activa: number; w?: number; tono?: Tono; cursor?: boolean}> = ({
  escrito,
  resultados,
  visibles,
  activa,
  w = 760,
  tono = 'claro',
  cursor = true,
}) => (
  <div style={{width: w, ...vidrio(tono, 40), padding: 18}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 14px 22px', borderBottom: `1.5px solid ${tono === 'claro' ? 'rgba(30,35,60,0.1)' : 'rgba(255,255,255,0.12)'}`}}>
      <Icono n="buscar" size={44} color={grisDe(tono)} grosor={2.2} />
      <div style={{...texto(42, tintaDe(tono), 500, -0.02), flex: 1}}>
        {escrito}
        {cursor ? <span style={{display: 'inline-block', width: 3, height: 44, marginLeft: 3, verticalAlign: -6, background: COLOR.azul}} /> : null}
      </div>
      <div style={{...texto(26, grisDe(tono), 600, 0), padding: '6px 12px', borderRadius: 10, border: `1.5px solid ${tono === 'claro' ? 'rgba(30,35,60,0.15)' : 'rgba(255,255,255,0.2)'}`}}>⌘K</div>
    </div>
    <div style={{paddingTop: 12}}>
      {resultados.map((r, i) => {
        const v = c01(visibles - i);
        if (v <= 0) return null;
        const on = c01(1 - Math.abs(activa - i));
        return (
          <div
            key={r.texto}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 16px',
              borderRadius: 22,
              background: `rgba(47,91,255,${0.12 * on})`,
              transform: `translateY(${(1 - v) * 18}px) scale(${0.96 + 0.04 * v})`,
              transformOrigin: '50% 0',
            }}
          >
            <Insignia n={r.icono} color={r.color} size={60} />
            <div style={texto(36, tintaDe(tono), 600, -0.02)}>{r.texto}</div>
            <div style={{flex: 1}} />
            <div style={{transform: `translateX(${(1 - on) * -10}px) scale(${on})`}}>
              <Icono n="flecha" size={36} color={COLOR.azul} grosor={2.4} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/** Código de un solo uso: n cajas; llenas: cuántas tienen ya su dígito (en coma flotante para la caída). */
export const Codigo: React.FC<{digitos: string; llenas: number; color: string; tono?: Tono; size?: number}> = ({digitos, llenas, color, tono = 'claro', size = 104}) => (
  <div style={{display: 'flex', gap: size * 0.16}}>
    {digitos.split('').map((d, i) => {
      const c = c01(llenas - i);
      const activa = Math.floor(llenas) === i;
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size * 1.2,
            borderRadius: size * 0.26,
            background: tono === 'claro' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.08)',
            border: `3px solid ${activa ? color : tono === 'claro' ? 'rgba(30,35,60,0.12)' : 'rgba(255,255,255,0.18)'}`,
            boxShadow: activa ? `0 0 0 6px ${alfa(color, 0.18)}` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{...texto(size * 0.56, tintaDe(tono), 600, 0), transform: `translateY(${(1 - c) * -size * 0.7}px)`}}>{c > 0 ? d : ''}</div>
        </div>
      );
    })}
  </div>
);

/* ---------- superposiciones ---------- */

export type Aviso = {icono: NombreIcono; color: string; app: string; hora: string; titulo: string; texto: string};

/** Notificación del sistema (genérica). */
export const Notificacion: React.FC<{a: Aviso; w?: number; tono?: Tono}> = ({a, w = 820, tono = 'claro'}) => (
  <div style={{width: w, ...vidrio(tono, 46), padding: '24px 28px', display: 'flex', gap: 24, alignItems: 'center'}}>
    <Insignia n={a.icono} color={a.color} size={88} />
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', ...texto(26, grisDe(tono), 600, 0.02), textTransform: 'uppercase'}}>
        <span>{a.app}</span>
        <span style={{textTransform: 'none', letterSpacing: 0}}>{a.hora}</span>
      </div>
      <div style={{...texto(36, tintaDe(tono), 650, -0.02), marginTop: 6}}>{a.titulo}</div>
      <div style={{...texto(32, grisDe(tono), 500, -0.01), marginTop: 4}}>{a.texto}</div>
    </div>
  </div>
);

/**
 * Pila de notificaciones (como Sonner o la lista animada): llegan[i] es el muelle de llegada de la i (0 → 1); la
 * más nueva queda delante y las anteriores se apilan detrás, más pequeñas.
 */
export const Pila: React.FC<{avisos: Aviso[]; llegan: number[]; w?: number; tono?: Tono}> = ({avisos, llegan, w = 820, tono = 'claro'}) => (
  <div style={{position: 'relative', width: w, height: 200}}>
    {avisos.map((a, i) => {
      const l = llegan[i] ?? 0;
      if (l <= 0) return null;
      const detras = llegan.slice(i + 1).reduce((s, v) => s + c01(v), 0);
      const vis = Math.min(detras, 2.4);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translateY(${(1 - l) * -260 - vis * 30}px) scale(${(0.9 + 0.1 * c01(l)) * (1 - 0.06 * vis)})`,
            transformOrigin: '50% 0',
            filter: vis > 0.05 ? `brightness(${1 - 0.08 * vis})` : undefined,
            zIndex: i,
          }}
        >
          <Notificacion a={a} w={w} tono={tono} />
        </div>
      );
    })}
  </div>
);

/**
 * Isla dinámica con la música: abre 0 = pastilla compacta, 1 = tarjeta abierta. El ancho va por delante del alto y el
 * radio sigue siendo concéntrico. f mueve las barras del sonido; beat: fotogramas de cada golpe para que salten a tiempo.
 */
export const Isla: React.FC<{abre: number; f: number; color: string; titulo: string; sub: string; progreso: number; beat?: (f: number) => number; escala?: number}> = ({
  abre,
  f,
  color,
  titulo,
  sub,
  progreso,
  beat = () => 0,
  escala = 1,
}) => {
  const aw = c01(abre * 1.18);
  const ah = c01((abre - 0.06) / 0.94);
  const W = mix(260, 860, aw) * escala;
  const H = mix(76, 380, ah) * escala;
  const R = mix(38, 96, ah) * escala;
  const k = escala;
  const barras = (n: number, alto: number, ancho: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: ancho * 0.7, height: alto}}>
      {Array.from({length: n}).map((_, i) => {
        const v = 0.35 + 0.3 * Math.abs(Math.sin(f / (3.1 + i * 0.7) + i * 1.7)) + 0.35 * beat(f - i);
        return <div key={i} style={{width: ancho, height: alto * c01(v), borderRadius: ancho, background: `linear-gradient(180deg, ${mezcla(color, '#ffffff', 0.35)}, ${color})`}} />;
      })}
    </div>
  );
  const portada = (s: number) => (
    <div style={{width: s, height: s, borderRadius: s * 0.22, background: `radial-gradient(circle at 70% 25%, #ffb36b 0%, rgba(255,179,107,0) 45%), linear-gradient(140deg, ${color} 0%, #ff4f8b 100%)`, position: 'relative', flexShrink: 0, boxShadow: `0 10px 30px ${alfa(color, 0.5)}`}}>
      <div style={{position: 'absolute', left: s * 0.18, top: s * 0.18, width: s * 0.64, height: s * 0.64, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.0) 18%, rgba(20,10,40,0.55) 19%, rgba(20,10,40,0.35) 60%, rgba(255,255,255,0.12) 61%, rgba(20,10,40,0.3) 100%)', transform: `rotate(${f * 6}deg)`}} />
    </div>
  );
  return (
    <div style={{position: 'relative', width: W, height: H, borderRadius: R, background: '#050507', boxShadow: `0 ${30 * ah}px ${80 * ah}px rgba(0,0,0,${0.55 * ah}), inset 0 1px 0 rgba(255,255,255,0.08)`, overflow: 'hidden'}}>
      {/* compacta: portada pequeña a la izquierda y barras a la derecha */}
      {ah < 0.5 ? (
        <div style={{position: 'absolute', inset: 0, padding: `0 ${22 * k}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: `scale(${1 - ah * 1.6})`}}>
          {portada(46 * k)}
          {barras(4, 34 * k, 6 * k)}
        </div>
      ) : null}
      {ah >= 0.5 ? (
        <div style={{position: 'absolute', inset: 0, padding: 40 * k, display: 'flex', flexDirection: 'column', gap: 30 * k, transform: `scale(${0.85 + 0.15 * c01((ah - 0.5) * 2)})`, transformOrigin: '50% 0', filter: ah < 0.85 ? `blur(${(0.85 - ah) * 30}px)` : undefined}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 28 * k}}>
            {portada(150 * k)}
            <div style={{flex: 1, minWidth: 0}}>
              <div style={texto(46 * k, '#fff', 650, -0.025)}>{titulo}</div>
              <div style={{...texto(32 * k, 'rgba(255,255,255,0.55)', 500, -0.01), marginTop: 8 * k}}>{sub}</div>
            </div>
            {barras(6, 70 * k, 8 * k)}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20 * k}}>
            <div style={{...texto(24 * k, 'rgba(255,255,255,0.55)', 600, 0), fontVariantNumeric: 'tabular-nums'}}>{tiempo(progreso * 204)}</div>
            <div style={{flex: 1, height: 10 * k, borderRadius: 10, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
              <div style={{width: `${progreso * 100}%`, height: '100%', borderRadius: 10, background: '#fff'}} />
            </div>
            <div style={{...texto(24 * k, 'rgba(255,255,255,0.55)', 600, 0), fontVariantNumeric: 'tabular-nums'}}>-{tiempo(204 - progreso * 204)}</div>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 90 * k}}>
            <Icono n="ant" size={50 * k} color="#fff" relleno grosor={1.5} />
            <Icono n="pausa" size={60 * k} color="#fff" grosor={4.2} />
            <Icono n="sig" size={50 * k} color="#fff" relleno grosor={1.5} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
const tiempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------- navegación ---------- */

/** Barra de pestañas flotante de cristal con una lente que se desliza (pos en coma flotante). */
export const BarraPestanas: React.FC<{iconos: NombreIcono[]; pos: number; color: string; w?: number; tono?: Tono}> = ({iconos, pos, color, w = 640, tono = 'claro'}) => {
  const h = 120;
  const pad = 10;
  const sw = (w - 2 * pad) / iconos.length;
  const fr = pos - Math.floor(pos);
  const estira = 0.3 * Math.sin(Math.PI * fr);
  return (
    <div style={{position: 'relative', width: w, height: h, ...vidrio(tono, h / 2)}}>
      <div style={{position: 'absolute', left: pad + pos * sw - (sw * estira) / 2, top: pad - 4 * estira, width: sw * (1 + estira), height: h - 2 * pad + 8 * estira, borderRadius: h, background: alfa(color, 0.16), border: `1.5px solid ${alfa(color, 0.25)}`}} />
      {iconos.map((n, i) => {
        const on = c01(1 - Math.abs(pos - i));
        return (
          <div key={n} style={{position: 'absolute', left: pad + i * sw, top: 0, width: sw, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.12 * on})`}}>
            <Icono n={n} size={50} color={on > 0.5 ? color : grisDe(tono)} grosor={2.2} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------- datos ---------- */

/**
 * Contador de odómetro: cada cifra es una tira 0-9 que rueda; una cifra solo gira cuando la de debajo pasa de 9 a 0.
 * cifras: cuántas se enseñan (sin ceros a la izquierda); sep: separador de miles.
 */
export const Contador: React.FC<{valor: number; cifras: number; size: number; color: string; peso?: number; sep?: string; prefijo?: string; sufijo?: string}> = ({valor, cifras, size, color, peso = 650, sep = '.', prefijo = '', sufijo = ''}) => {
  const v = Math.max(0, valor);
  const alto = size * 1.12;
  const cols: React.ReactNode[] = [];
  for (let k = cifras - 1; k >= 0; k--) {
    const pk = 10 ** k;
    const pos = (Math.floor(v / pk) % 10) + c01((v % pk) - (pk - 1));
    const visible = v >= pk || k === 0;
    cols.push(
      <span key={`d${k}`} style={{display: 'inline-block', height: alto, overflow: 'hidden', width: visible ? '0.62em' : 0, verticalAlign: 'top'}}>
        <span style={{display: 'block', transform: `translateY(${-pos * alto}px)`}}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
            <span key={i} style={{display: 'block', height: alto, lineHeight: `${alto}px`, textAlign: 'center'}}>
              {d}
            </span>
          ))}
        </span>
      </span>,
    );
    if (k % 3 === 0 && k > 0 && v >= pk) cols.push(<span key={`s${k}`}>{sep}</span>);
  }
  return (
    <span style={{...texto(size, color, peso, -0.04), display: 'inline-flex', alignItems: 'flex-start', lineHeight: `${alto}px`, height: alto, fontVariantNumeric: 'tabular-nums'}}>
      {prefijo}
      {cols}
      {sufijo}
    </span>
  );
};

/** Gráfico de barras: crece[i] es el muelle de cada barra (0 → 1, con rebote); destaca: índice a todo color con su etiqueta. */
export const Barras: React.FC<{valores: number[]; etiquetas: string[]; crece: number[]; destaca: number; etiqueta: string; etiquetaT: number; color: string; w?: number; h?: number; tono?: Tono; techo?: number}> = ({
  valores,
  etiquetas,
  crece,
  destaca,
  etiqueta,
  etiquetaT,
  color,
  w = 720,
  h = 360,
  tono = 'claro',
  techo = 0.78,
}) => {
  const n = valores.length;
  // la barra más alta llega a techo · h: el resto del alto es para su etiqueta
  const max = Math.max(...valores) / techo;
  const sw = w / n;
  const bw = sw * 0.56;
  return (
    <div style={{position: 'relative', width: w, height: h + 50}}>
      {valores.map((v, i) => {
        const bh = (v / max) * h * Math.max(0, crece[i] ?? 0);
        const es = i === destaca;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: i * sw + (sw - bw) / 2,
                top: h - bh,
                width: bw,
                height: bh,
                borderRadius: `${bw * 0.32}px ${bw * 0.32}px ${bw * 0.14}px ${bw * 0.14}px`,
                background: es ? `linear-gradient(180deg, ${mezcla(color, '#ffffff', 0.25)}, ${color})` : alfa(color, tono === 'claro' ? 0.22 : 0.35),
                boxShadow: es ? `0 14px 30px ${alfa(color, 0.45)}` : undefined,
              }}
            />
            <div style={{position: 'absolute', left: i * sw, top: h + 12, width: sw, textAlign: 'center', ...texto(26, es ? tintaDe(tono) : grisDe(tono), 600, 0)}}>{etiquetas[i]}</div>
          </React.Fragment>
        );
      })}
      {etiquetaT > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: destaca * sw + sw / 2,
            top: h - (valores[destaca] / max) * h * (crece[destaca] ?? 0) - 24,
            transform: `translate(-50%, -100%) scale(${etiquetaT})`,
            transformOrigin: '50% 100%',
            padding: '10px 18px',
            borderRadius: 16,
            background: COLOR.tinta,
            ...texto(28, '#fff', 600, -0.01),
            boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
          }}
        >
          {etiqueta}
        </div>
      ) : null}
    </div>
  );
};

/** Línea de tendencia: t = 0 → 1 se dibuja; el área se rellena detrás y un punto va en la punta. */
export const Linea: React.FC<{puntos: number[]; t: number; color: string; w?: number; h?: number; grosor?: number}> = ({puntos, t, color, w = 720, h = 220, grosor = 6}) => {
  const min = Math.min(...puntos);
  const max = Math.max(...puntos);
  const n = puntos.length;
  // muestreo suave (Catmull-Rom) para que el punto de la punta caiga sobre la curva
  const y = (u: number) => {
    const x = u * (n - 1);
    const i = Math.min(n - 2, Math.floor(x));
    const s = x - i;
    const p0 = puntos[Math.max(0, i - 1)];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[Math.min(n - 1, i + 2)];
    const v = 0.5 * (2 * p1 + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s * s * s);
    return h - 16 - ((v - min) / (max - min || 1)) * (h - 32);
  };
  const M = 90;
  const tt = c01(t);
  const nP = Math.max(2, Math.round(M * tt) + 1);
  const pts: [number, number][] = Array.from({length: nP}, (_, i) => {
    const u = (i / (nP - 1)) * tt;
    return [u * w, y(u)];
  });
  const d = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
  const area = `${d} L${(tt * w).toFixed(1)} ${h} L0 ${h} Z`;
  const id = `linea-${color.slice(1)}`;
  const tip = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {tt > 0.01 ? <path d={area} fill={`url(#${id})`} /> : null}
      {tt > 0.01 ? <path d={d} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {tt > 0.01 ? (
        <>
          <circle cx={tip[0]} cy={tip[1]} r={grosor * 3} fill={alfa(color, 0.22)} />
          <circle cx={tip[0]} cy={tip[1]} r={grosor * 1.4} fill="#fff" stroke={color} strokeWidth={grosor * 0.7} />
        </>
      ) : null}
    </svg>
  );
};

/** Anillos de actividad: valores 0-1 (pueden pasar de 1), del exterior al interior. */
export const Anillos: React.FC<{valores: number[]; colores: string[]; size?: number; grosor?: number; fondo?: Tono}> = ({valores, colores, size = 420, grosor = 52, fondo = 'oscuro'}) => {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block', overflow: 'visible'}}>
      {valores.map((v, i) => {
        const r = c - grosor / 2 - i * (grosor + 8);
        const col = colores[i];
        const a = c01(v) * 2 * Math.PI - Math.PI / 2;
        const tx = c + r * Math.cos(a);
        const ty = c + r * Math.sin(a);
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={alfa(col, fondo === 'oscuro' ? 0.22 : 0.18)} strokeWidth={grosor} />
            {v > 0.003 ? (
              <>
                <circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={col}
                  strokeWidth={grosor}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={`${c01(v)} 1`}
                  transform={`rotate(-90 ${c} ${c})`}
                  style={{filter: `drop-shadow(0 0 ${grosor * 0.3}px ${alfa(col, 0.6)})`}}
                />
                <circle cx={tx} cy={ty} r={grosor * 0.5} fill={col} style={{filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.35))'}} />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

/** Calendario de un mes (lunes primero). filas: 0 → n filas visibles (entran fila a fila); sel: día; selT: muelle del día. */
export const Calendario: React.FC<{mes: string; primerDia: number; dias: number; sel: number; selT: number; filas: number; color: string; w?: number; tono?: Tono; pliega?: number}> = ({
  mes,
  primerDia,
  dias,
  sel,
  selT,
  filas,
  color,
  w = 760,
  tono = 'claro',
  pliega = 0,
}) => {
  const cw = w / 7;
  const celdas: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({length: dias}, (_, i) => i + 1)];
  const nFilas = Math.ceil(celdas.length / 7);
  const filaSel = Math.floor((primerDia + sel - 1) / 7);
  const alto = cw * 0.86;
  return (
    <div style={{width: w}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
        <div style={texto(46, tintaDe(tono), 650, -0.03)}>{mes}</div>
        <div style={{display: 'flex', gap: 26}}>
          <div style={{transform: 'scaleX(-1)'}}>
            <Icono n="flecha" size={38} color={grisDe(tono)} grosor={2.4} />
          </div>
          <Icono n="flecha" size={38} color={grisDe(tono)} grosor={2.4} />
        </div>
      </div>
      <div style={{display: 'flex'}}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} style={{width: cw, textAlign: 'center', ...texto(26, grisDe(tono), 600, 0.04)}}>
            {d}
          </div>
        ))}
      </div>
      {/* al plegarse, las filas suben hacia la del día elegido y se aplastan contra ella */}
      <div style={{position: 'relative', height: alto * mix(nFilas, 1, c01(pliega)) + 10, marginTop: 10}}>
        {Array.from({length: nFilas}).map((_, fi) => {
          const entra = c01(filas - fi);
          if (entra <= 0) return null;
          const yAbierta = fi * alto;
          const yPlegada = 0;
          const aplasta = fi === filaSel ? 1 : 1 - c01(pliega * 1.4);
          return (
            <div key={fi} style={{position: 'absolute', left: 0, top: mix(yAbierta, yPlegada, c01(pliega)), display: 'flex', transform: `translateY(${(1 - entra) * 26}px) scaleY(${aplasta * (0.7 + 0.3 * entra)})`, transformOrigin: '50% 50%'}}>
              {celdas.slice(fi * 7, fi * 7 + 7).map((d, ci) => {
                const es = d === sel;
                const s = es ? c01(selT) : 0;
                return (
                  <div key={ci} style={{position: 'relative', width: cw, height: alto, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {es ? (
                      <>
                        <div style={{position: 'absolute', width: alto * 0.84, height: alto * 0.84, borderRadius: '50%', background: color, transform: `scale(${selT})`, boxShadow: `0 10px 24px ${alfa(color, 0.45)}`}} />
                        <div style={{position: 'absolute', width: alto * 0.84, height: alto * 0.84, borderRadius: '50%', border: `3px solid ${alfa(color, 0.6 * (1 - c01((selT - 0.6) * 2.5)))}`, transform: `scale(${1 + 0.6 * c01(selT)})`}} />
                      </>
                    ) : null}
                    <div style={{position: 'relative', ...texto(36, s > 0.4 ? '#fff' : d === null ? 'transparent' : tintaDe(tono), es ? 700 : 550, -0.02), fontVariantNumeric: 'tabular-nums'}}>{d ?? ''}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Avatares con iniciales que se solapan; entra[i] 0 → 1. */
export const Avatares: React.FC<{iniciales: string[]; colores: string[]; entra: number[]; size?: number}> = ({iniciales, colores, entra, size = 96}) => (
  <div style={{display: 'flex'}}>
    {iniciales.map((t, i) => (
      <div
        key={t}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          marginLeft: i ? -size * 0.28 : 0,
          background: `linear-gradient(150deg, ${mezcla(colores[i], '#ffffff', 0.25)}, ${colores[i]})`,
          border: '4px solid #fff',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...texto(size * 0.36, '#fff', 650, 0),
          transform: `scale(${entra[i] ?? 0})`,
          zIndex: iniciales.length - i,
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

/* ---------- efectos ---------- */

/** Una luz que recorre el borde (t: vueltas, en coma flotante). Va encima de la tarjeta, que la recorta con su radio. */
export const BordeHaz: React.FC<{t: number; color: string; r: number; grosor?: number}> = ({t, color, r, grosor = 3}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: r,
      padding: grosor,
      background: `conic-gradient(from ${t * 360}deg, rgba(255,255,255,0) 0deg, ${color} 50deg, #ffffff 62deg, rgba(255,255,255,0) 90deg, rgba(255,255,255,0) 360deg)`,
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    }}
  />
);

/** Texto con un brillo que lo cruza (b: posición del brillo en %, de -20 a 120). */
export const brilloTexto = (b: number, base: string, brillo = '#ffffff'): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${b - 10}%, ${brillo} ${b}%, rgba(255,255,255,0) ${b + 10}%), linear-gradient(0deg, ${base}, ${base})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
});

/** Confeti determinista: sale de (x, y) hacia arriba, cae con gravedad, gira y se encoge al final. */
export const Confeti: React.FC<{f: number; at: number; x: number; y: number; colores: string[]; n?: number; seed?: number; fuerza?: number}> = ({f, at, x, y, colores, n = 40, seed = 1, fuerza = 1}) => {
  const t = f - at;
  if (t < 0 || t > 48) return null;
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const r1 = frac(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453);
        const r2 = frac(Math.sin((i + 1) * 39.3468 + seed * 11.135) * 24634.6345);
        const r3 = frac(Math.sin((i + 1) * 73.156 + seed * 52.235) * 12345.6789);
        const ang = (-90 + (r1 - 0.5) * 130) * (Math.PI / 180);
        const vel = (16 + 22 * r2) * fuerza;
        const drag = 0.94;
        const dist = (vel * (1 - drag ** t)) / (1 - drag);
        const px = x + Math.cos(ang) * dist;
        const py = y + Math.sin(ang) * dist + 0.55 * t * t * 0.5;
        const s = (1 - c01((t - 30) / 18)) * c01(t / 3);
        const w = 12 + 12 * r3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - w / 2,
              top: py - w / 4,
              width: w,
              height: i % 3 === 0 ? w : w / 2.2,
              borderRadius: i % 3 === 0 ? '50%' : 3,
              background: colores[i % colores.length],
              transform: `rotate(${t * (8 + 14 * r3) * (i % 2 ? 1 : -1)}deg) rotateX(${t * 17 * r1}deg) scale(${s})`,
            }}
          />
        );
      })}
    </>
  );
};
const frac = (v: number) => v - Math.floor(v);

/* ---------- guías: el toque y el marco ---------- */

/** El toque, conductor de todo: punto de cristal que se hunde al apretar y suelta una onda (onda: 0 → 1). */
export const Toque: React.FC<{x: number; y: number; s: number; presion: number; onda?: number; size?: number}> = ({x, y, s, presion, onda = 0, size = 76}) => {
  if (s <= 0.001) return null;
  const d = size * s * (1 - 0.18 * presion);
  return (
    <>
      {onda > 0 && onda < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: x - size,
            top: y - size,
            width: 2 * size,
            height: 2 * size,
            borderRadius: '50%',
            border: `${6 * (1 - onda)}px solid rgba(255,255,255,0.85)`,
            boxSizing: 'border-box',
            transform: `scale(${0.4 + 1.3 * E.out(onda)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - d / 2,
          top: y - d / 2,
          width: d,
          height: d,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.28) 100%)',
          border: '2.5px solid rgba(255,255,255,0.95)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3), inset 0 -4px 10px rgba(255,255,255,0.35)',
          backdropFilter: 'blur(3px) saturate(160%)',
          WebkitBackdropFilter: 'blur(3px) saturate(160%)',
          boxSizing: 'border-box',
        }}
      />
    </>
  );
};

/**
 * Marco de selección de una herramienta de diseño alrededor de un componente, con sus asas y su nombre.
 * t: muelle del marco (0 → 1); asas: muelle de las asas; nombre: muelle de la etiqueta.
 */
export const Marco: React.FC<{x: number; y: number; w: number; h: number; t: number; asas: number; nombreT: number; nombre: string; color?: string; r?: number; lado?: 'arriba' | 'abajo'; alinea?: 'izq' | 'der'; ancho?: number}> = ({
  x,
  y,
  w,
  h,
  t,
  asas,
  nombreT,
  nombre,
  color = COLOR.azul,
  r = 0,
  lado = 'arriba',
  alinea = 'izq',
  ancho = 1080,
}) => {
  if (t <= 0.001) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const W = w * (0.86 + 0.14 * t);
  const H = h * (0.86 + 0.14 * t);
  const X = cx - W / 2;
  const Y = cy - H / 2;
  const asa = (ax: number, ay: number, i: number) => (
    <div key={i} style={{position: 'absolute', left: ax - 11, top: ay - 11, width: 22, height: 22, background: '#fff', border: `3.5px solid ${color}`, boxSizing: 'border-box', borderRadius: 5, transform: `scale(${asas})`}} />
  );
  return (
    <>
      <div style={{position: 'absolute', left: X, top: Y, width: W, height: H, border: `3px solid ${color}`, borderRadius: r, boxSizing: 'border-box', boxShadow: `0 0 18px ${alfa(color, 0.45)}`, transform: `scale(${c01(t * 1.2)})`, transformOrigin: '50% 50%'}} />
      {asa(X, Y, 0)}
      {asa(X + W, Y, 1)}
      {asa(X + W, Y + H, 2)}
      {asa(X, Y + H, 3)}
      <div
        style={{
          position: 'absolute',
          left: alinea === 'izq' ? X - 2 : undefined,
          right: alinea === 'der' ? ancho - (X + W) - 2 : undefined,
          top: lado === 'arriba' ? Y - 64 : Y + H + 14,
          padding: '8px 18px',
          borderRadius: 12,
          background: color,
          boxShadow: `0 10px 24px ${alfa(color, 0.4)}`,
          ...texto(32, '#fff', 600, -0.01),
          transform: `scale(${nombreT})`,
          transformOrigin: `${alinea === 'izq' ? '0' : '100%'} ${lado === 'arriba' ? '100%' : '0'}`,
        }}
      >
        {nombre}
      </div>
    </>
  );
};

/* ---------- marca ---------- */

/** Símbolo de «Tu marca»: un aro con un punto dentro que salta con `punto`. Cámbialo por el SVG de tu logotipo, plano y monocromo. */
export const Logo: React.FC<{size: number; color: string; punto?: number}> = ({size, color, punto = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', flexShrink: 0}}>
    <circle cx={50} cy={50} r={36} fill="none" stroke={color} strokeWidth={13} />
    <circle cx={50} cy={50} r={12 * punto} fill={color} />
  </svg>
);

/** Para un antetítulo en cursiva serif cuando hace falta. */
export const serif = (size: number, color: string): React.CSSProperties => ({fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: size, letterSpacing: '-0.01em', lineHeight: 1.08, color});

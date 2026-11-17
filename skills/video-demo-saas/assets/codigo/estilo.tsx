import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

/*
 * Estilo «premium» (13 nov 2026). Sale de dos referencias de motion designers: la intro «Ideas are static»
 * y el anuncio de una skill de Claude Code. Lo que las hace caras:
 *
 * - Fondos de verdad: fotos de cielo, nubes y montaña (Unsplash, licencia libre), nunca un degradado plano.
 *   Las escenas de texto van sobre un «aura» pastel: una foto de nubes muy desenfocada y lavada.
 * - Profundidad de cámara: lo que entra llega desenfocado y se enfoca; el fondo se mueve menos que lo de delante.
 * - Tipografía en pareja: sans negra y apretada + una palabra en cursiva serif (Instrument Serif) y una
 *   palabra clave en degradado azul con un brillo que la cruza. Un «antetítulo» pequeño en gris encima.
 * - Rótulos en pastillas de cristal junto a su objeto, no en el aire.
 * - Transiciones con oficio: semitono (trama de puntos), círculo desde lo que se mira, recogida al centro.
 * - Cierre oscuro con el arco de un planeta azul y la palabra clave dentro de una caja de color.
 *
 * Todo es función pura del fotograma. Nada aparece ni se va solo por opacidad: cada entrada sube y se enfoca.
 */

loadFont({family: 'Geist', url: staticFile('fonts/Geist-variable.woff2'), weight: '100 900'});
loadFont({family: 'Instrument Serif', url: staticFile('fonts/InstrumentSerif-Italic.ttf'), style: 'italic', weight: '400'});

export const SANS = "Geist, 'Instrument Sans', system-ui, sans-serif";
export const SERIF = "'Instrument Serif', Georgia, serif";

/** Paleta del estilo: tinta casi negra, gris de antetítulo, azul eléctrico y violeta para los degradados. */
export const PALETA = {
  tinta: '#14151b',
  gris: '#7c8299',
  azul: '#2f5bff',
  azulClaro: '#6f93ff',
  violeta: '#7a5cff',
  noche: '#05060b',
  claro: '#f4f5fb',
};

const c01 = (x: number) => Math.min(1, Math.max(0, x));
const SALE = Easing.bezier(0.2, 0.7, 0.2, 1);
const ENTRA = Easing.bezier(0.5, 0, 0.75, 0);

/* ---------- fondos ---------- */

export type FotoProps = {
  src: string;
  /** Punto de la foto (en %) que se queda en el centro del encuadre y alrededor del que escala. */
  foco?: [number, number];
  escala?: number;
  dx?: number;
  dy?: number;
  /** Desenfoque de cámara en px. */
  blur?: number;
  /** Ajuste de color CSS, p. ej. «brightness(1.1) saturate(0.8)». */
  filtro?: string;
  /** id de un <LlaveCielo>: deja solo las nubes (el cielo azul se vuelve transparente). */
  llave?: string;
};

/** Foto a sangre: cubre el cuadro con su foco, escala, desplazamiento y desenfoque. */
export const Foto: React.FC<FotoProps> = ({src, foco = [50, 50], escala = 1, dx = 0, dy = 0, blur = 0, filtro, llave}) => {
  const filtros = [llave ? `url(#${llave})` : '', filtro ?? '', blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''].filter(Boolean).join(' ');
  // sin overflow: hidden: la foto escalada tiene que poder salirse de su caja cuando el plano se encoge con la cámara
  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${foco[0]}% ${foco[1]}%`,
          transform: `translate(${dx}px, ${dy}px) scale(${escala})`,
          transformOrigin: `${foco[0]}% ${foco[1]}%`,
          filter: filtros || undefined,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Llave de cielo: un filtro SVG que convierte el azul en transparencia y deja las nubes.
 * alfa = A + fuerza·(R − B): la nube blanca (R ≈ B) se queda; el cielo (B ≫ R) desaparece.
 * Parte del alfa A de la foto y no de un 1 fijo: si no, el margen del filtro (vacío, negro) sale opaco.
 */
export const LlaveCielo: React.FC<{id: string; fuerza?: number}> = ({id, fuerza = 2.6}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  ${fuerza} 0 ${-fuerza} 1 0`} />
    </filter>
  </svg>
);

/** Aura pastel: una foto de nubes muy desenfocada, lavada hacia el blanco, con manchas lavanda y azul. */
export const Aura: React.FC<{f: number; src: string}> = ({f, src}) => (
  <AbsoluteFill style={{background: '#eef1fb'}}>
    <Foto src={src} foco={[50, 62]} escala={1.45} dx={46 * Math.sin(f / 95)} dy={34 * Math.cos(f / 120)} blur={40} filtro="brightness(1.22) saturate(0.7) hue-rotate(10deg)" />
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(70% 42% at ${24 + 6 * Math.sin(f / 70)}% 84%, rgba(190,176,255,0.6), rgba(190,176,255,0) 72%)`,
          `radial-gradient(62% 38% at ${82 + 5 * Math.cos(f / 80)}% 12%, rgba(140,182,255,0.5), rgba(140,182,255,0) 72%)`,
          'radial-gradient(70% 48% at 50% 44%, rgba(255,255,255,0.78), rgba(255,255,255,0) 76%)',
        ].join(', '),
      }}
    />
  </AbsoluteFill>
);

/* ---------- transiciones ---------- */

/** Radio de un revelado circular de `dur` fotogramas desde `a` (con una curva que arranca seca y frena). */
export const radioRevela = (f: number, a: number, dur = 9, max = 2600) => max * Easing.bezier(0.3, 0, 0.2, 1)(c01((f - a) / dur));

/**
 * Revelado en semitono: la escena nueva entra por una trama de puntos que crecen desde (x, y), como la
 * trama de una imprenta. R es el radio del frente; `banda` es lo que tarda un punto en llenarse.
 */
export const Semitono: React.FC<{id: string; x: number; y: number; R: number; W: number; H: number; paso?: number; banda?: number; children: React.ReactNode}> = ({
  id,
  x,
  y,
  R,
  W,
  H,
  paso = 40,
  banda = 440,
  children,
}) => {
  const fila = paso * 0.866;
  const puntos: React.ReactNode[] = [];
  let lleno = true;
  for (let j = -1; j * fila < H + paso; j++) {
    for (let i = -1; i * paso < W + paso; i++) {
      const cx = i * paso + (Math.abs(j) % 2 ? paso / 2 : 0);
      const cy = j * fila;
      const t = c01((R - Math.hypot(cx - x, cy - y)) / banda);
      if (t < 1) lleno = false;
      // en una trama hexagonal, r ≥ 0,577·paso ya cubre todo
      if (t > 0) puntos.push(<circle key={`${i}_${j}`} cx={cx} cy={cy} r={paso * 0.62 * t} />);
    }
  }
  if (lleno) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            {puntos}
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{clipPath: `url(#${id})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- texto ---------- */

/**
 * Entrada «con foco»: la palabra sube, se enfoca y gana cuerpo a la vez (11 fotogramas).
 * Con `sale`, se va al revés: sigue subiendo y se desenfoca.
 */
export const enfoque = (f: number, a: number, sale = Infinity, dur = 11): React.CSSProperties => {
  if (f < a) return {visibility: 'hidden'};
  const t = SALE(c01((f - a) / dur));
  const s = ENTRA(c01((f - sale) / 8));
  const blur = 16 * (1 - t) + 14 * s;
  return {
    display: 'inline-block',
    transform: `translateY(${0.34 * (1 - t) - 0.42 * s}em) scale(${1.05 - 0.05 * t})`,
    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
    opacity: c01((f - a) / 4) * (1 - s),
  };
};

/** Texto en degradado azul → violeta con un brillo blanco que lo cruza (b: posición del brillo, 0-100). */
export const degradado = (b: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${b - 9}%, rgba(225,233,255,0.95) ${b}%, rgba(255,255,255,0) ${b + 9}%), linear-gradient(100deg, #1f3cff 0%, #3a66ff 45%, #7a5cff 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
});

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Color de la letra i de n en la rampa azul → violeta (para palabras que ondulan letra a letra). */
export const rampa = (i: number, n: number, brillo = -1) => {
  const t = n > 1 ? i / (n - 1) : 0;
  const a = hex('#1f3cff');
  const m = hex('#3a66ff');
  const b = hex('#7a5cff');
  const c = t < 0.45 ? a.map((v, k) => v + (m[k] - v) * (t / 0.45)) : m.map((v, k) => v + (b[k] - v) * ((t - 0.45) / 0.55));
  const luz = brillo < 0 ? 0 : Math.max(0, 1 - Math.abs(t - brillo) * 6);
  return `rgb(${c.map((v) => Math.round(v + (235 - v) * 0.85 * luz)).join(',')})`;
};

/** Caja de color detrás de una palabra (como texto seleccionado): se abre de izquierda a derecha. */
export const Resalte: React.FC<{f: number; a: number; color?: string; children: React.ReactNode}> = ({f, a, color = PALETA.azul, children}) => {
  const t = SALE(c01((f - a) / 9));
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: '0 0.14em'}}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '0.1em',
          bottom: '0.02em',
          borderRadius: '0.06em',
          background: color,
          boxShadow: `0 0 50px ${color}aa, 0 0 14px ${color}`,
          transformOrigin: '0 50%',
          transform: `scaleX(${t})`,
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

/* ---------- piezas ---------- */

/** Pastilla de cristal con un rótulo: crece desde su ancla con un muelle y se enfoca. */
export const Pastilla: React.FC<{texto: string; x: number; y: number; s: number; blur?: number; size?: number}> = ({texto, x, y, s, blur = 0, size = 40}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${s})`,
      padding: `${0.4 * size}px ${0.75 * size}px`,
      borderRadius: 999,
      background: 'linear-gradient(150deg, rgba(110,132,190,0.5), rgba(70,92,150,0.34))',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      border: '1.5px solid rgba(255,255,255,0.55)',
      boxShadow: '0 16px 36px rgba(20,40,90,0.28), inset 0 1.5px 0 rgba(255,255,255,0.5)',
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: '-0.01em',
      color: '#ffffff',
      whiteSpace: 'nowrap',
      filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
    }}
  >
    {texto}
  </div>
);

/**
 * El arco de un planeta en la oscuridad, con el borde encendido en azul y su atmósfera.
 * `y` es la cima del arco en el cuadro.
 */
export const Planeta: React.FC<{y: number; W: number; radio?: number}> = ({y, W, radio = 1100}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: W / 2 - radio * 1.5,
        top: y - radio * 0.55,
        width: radio * 3,
        height: radio * 1.6,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(40,90,255,0.32), rgba(40,90,255,0.1) 55%, rgba(40,90,255,0) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: W / 2 - radio,
        top: y,
        width: 2 * radio,
        height: 2 * radio,
        borderRadius: '50%',
        background: 'radial-gradient(120% 60% at 50% 0%, #0b1236 0%, #04050b 45%)',
        boxShadow: [
          '0 0 0 3px rgba(170,200,255,0.95)',
          '0 0 26px 6px rgba(90,140,255,0.95)',
          '0 0 110px 34px rgba(50,100,255,0.6)',
          '0 0 280px 110px rgba(40,80,255,0.25)',
          'inset 0 26px 60px rgba(70,120,255,0.55)',
        ].join(', '),
      }}
    />
  </>
);

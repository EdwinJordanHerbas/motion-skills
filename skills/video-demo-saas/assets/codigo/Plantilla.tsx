import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Html5Audio, Img, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {AJUSTES, type Insignia as InsigniaAjuste} from './ajustes';
import {alfa, C, E, mix, MONO, p, type Props, TEXTO} from './kit-plantilla';
import {area, BILLETES, CH, CW, Dinero, LAPTOP, MARGEN, MONEDAS, MOVIL, Mundo, type Portatil as PortatilEstado, type Pose, quadDe, quadPantalla} from './mundo3d';
import {Mapped} from './projection';
import timeline from './timeline.json';

const A = AJUSTES;

/*
 * Template «Tu marca»: a vertical product demo with no voice, in one continuous shot. A customer asks
 * in a chat and the answer is the film: the brand, a laptop with a panel and an editor that cuts three
 * pieces, the pieces landing on three phones, one phone tilting into a racing feed, a flip with coins,
 * the review, the report and the contact form, closing on the brand. Product-demo type (black headline
 * over a grey line), soft neumorphic surfaces and magic pops; music and effects carry the sound.
 * Texts, colour, type, captures and sound come from ajustes.ts. The timing is fixed: 988 frames.
 */

const FPS = 30;
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const sp = (f: number, a: number, damping = 15, stiffness = 140, mass = 0.9) => spring({frame: f - a, fps: FPS, config: {damping, stiffness, mass}});
const sale = (f: number, a: number, d = 10) => p(f, a, d, E.in);
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- beats: no voice, every moment is a frame here ---------- */

// 1. A conversation with the brand: the file, the question, the magic reply.
const ADJ = 8;
const MSG = A.chat.mensaje;
/** The typing always fills frames 18 → MSG_FIN, whatever the message's length, so the timing never moves. */
const MSG_FIN = 79;
const MSG_KEYS = (() => {
  const out: number[] = [];
  const cyc = [1, 2, 1, 1, 2, 1, 2, 1];
  let t = 18;
  for (let i = 0; i < MSG.length; i++) {
    if (i > 0) t += cyc[i % cyc.length] + ('.,'.includes(MSG[i - 1]) ? 3 : 0);
    out.push(t);
  }
  const k = (MSG_FIN - 18) / Math.max(1, t - 18);
  return out.map((x) => Math.round(18 + (x - 18) * k));
})();
const SEND = MSG_FIN + 6;
const DOTS = SEND + 5;
const REPLY = DOTS + 14;
const RESPUESTA = A.chat.respuesta;
const FLY = REPLY + 16;
const CUT = FLY + 8;
const MARCA_AT = CUT + 3;
// 2. The brand.
const BRAND_OUT = MARCA_AT + 36;
// 3. The laptop: the panel.
const LAP_IN = BRAND_OUT + 2;
const ROW0 = LAP_IN + 76;
const ROW_GAP = 8;
const STAMP = ROW0 + 4 * ROW_GAP + 8;
// 4. The editor.
const EDIT = STAMP + 20;
const SWEEP = {from: EDIT + 6, to: EDIT + 46};
const LIFT = SWEEP.to + 8;
const PH_IN = LIFT + 22;
// 5. One phone tilts, its feed races, it flips and pays out.
const HERO = PH_IN + 46;
const FEED = HERO + 10;
const ASOMBRO = FEED + 72;
const GIRO = ASOMBRO + 8;
const PAGO = GIRO + 24;
const DINERO = PAGO + 14;
// 6. Review, 7. report.
const REV = DINERO + 58;
const R = [REV + 20, REV + 44, REV + 70];
const INF = REV + 100;
// 8. Call to action: the web's form.
const CTA0 = INF + 64;
const CORREO = A.formulario.escrito;
const PIDE = CTA0 + 28;
const CTA_A = {press: PIDE + 2, morph: PIDE + 5, chip: PIDE + 22, field: PIDE + 34};
/** The e-mail is typed in the same 23 frames whatever its length. */
const TECLEO = 23;
const TECLAS = Array.from(CORREO, (_, i) => Math.round(CTA_A.field + 5 + (i * TECLEO) / Math.max(1, CORREO.length - 1)));
const CTA = {...CTA_A, send: CTA_A.field + 5 + TECLEO + 12};
const PLANE = CTA.send + 5;
const TOAST = PLANE + 16;
const FIN = TOAST + 40;
export const FRAMES = FIN + 48;
if (FRAMES !== timeline.frames) {
  throw new Error(`timeline.json dice ${timeline.frames} fotogramas y el guion ${FRAMES}`);
}

/** Two moments inside a scene: the file shows up on the panel, the highlighted column fills in. */
const V = {recibido: LAP_IN + 30, destacada: INF + 28};

/* ---------- type and finish: product-demo type, neumorphic surfaces ---------- */

const DISPLAY: React.CSSProperties = {fontFamily: TEXTO, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.04};
const GRIS = '#8b867c';
const NEU = {
  fondo: '#ece9e3',
  alto: '#f4f1ec',
  sombra: '22px 22px 50px rgba(160,146,126,0.42), -18px -18px 44px rgba(255,255,255,0.95)',
  sombraS: '8px 8px 18px rgba(160,146,126,0.40), -7px -7px 16px rgba(255,255,255,0.95)',
  hundido: 'inset 6px 6px 14px rgba(160,146,126,0.36), inset -6px -6px 14px rgba(255,255,255,0.92)',
};
const VIDRIO_OSCURO: React.CSSProperties = {
  background: 'linear-gradient(140deg, rgba(38,35,30,0.9) 0%, rgba(22,20,17,0.8) 100%)',
  backdropFilter: 'blur(24px) saturate(140%)',
  WebkitBackdropFilter: 'blur(24px) saturate(140%)',
  border: '1.5px solid rgba(255,255,255,0.14)',
  boxShadow: '0 40px 100px rgba(40,25,10,0.32), inset 0 1px 0 rgba(255,255,255,0.12)',
};
const VERDE = '#2fb37a';

/* ---------- magic: an element lands with a spring, a flash, a ring and sparks ---------- */

const pum = (f: number, at: number) => {
  const s = spring({frame: f - at, fps: FPS, config: {damping: 9, stiffness: 210, mass: 0.6}});
  return {s, o: c01((f - at + 1) / 4), blur: 12 * (1 - c01((f - at) / 8)), on: f >= at - 1};
};
const pumStyle = (f: number, at: number, origin = '50% 50%'): React.CSSProperties => {
  const m = pum(f, at);
  return {
    opacity: m.on ? m.o : 0,
    transform: `scale(${0.35 + 0.65 * m.s})`,
    transformOrigin: origin,
    filter: m.blur > 0.4 && m.on ? `blur(${m.blur}px)` : undefined,
  };
};

const CHISPAS = 10;
const Destello: React.FC<{f: number; at: number; x: number; y: number; r?: number; seed?: number}> = ({f, at, x, y, r = 140, seed = 0}) => {
  const t = f - at;
  if (t < 0 || t > 28) {
    return null;
  }
  const flash = p(f, at, 11, E.out);
  const ring = p(f, at, 17, E.out);
  const k = r / 140;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: 2 * r,
          height: 2 * r,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,226,180,0.55) 45%, rgba(255,255,255,0) 100%)',
          transform: `scale(${0.3 + 1.1 * flash})`,
          opacity: (1 - flash) * 0.95,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: 2 * r,
          height: 2 * r,
          borderRadius: '50%',
          border: `${(2 + 5 * (1 - ring)) * k}px solid rgba(255,183,100,${0.75 * (1 - ring)})`,
          boxShadow: `0 0 ${30 * (1 - ring) * k}px rgba(255,170,80,${0.45 * (1 - ring)})`,
          transform: `scale(${0.2 + 1.25 * ring})`,
        }}
      />
      {Array.from({length: CHISPAS}).map((_, i) => {
        const ang = (((i / CHISPAS) * 360 + seed * 37 + (i % 2) * 14) * Math.PI) / 180;
        const dist = r * (0.75 + 0.6 * (((i * 7 + seed * 3) % 5) / 4));
        const v = p(f, at + (i % 3), 18, E.out);
        const sz = (i % 3 === 0 ? 34 : 22) * k;
        const vida = Math.sin(Math.PI * c01((t - (i % 3)) / (19 + (i % 3) * 2)));
        const col = ['#ffb547', '#ffffff', '#ff8a3d', '#ffd98a'][i % 4];
        return (
          <svg
            key={i}
            width={sz}
            height={sz}
            viewBox="-12 -12 24 24"
            style={{
              position: 'absolute',
              left: x + Math.cos(ang) * dist * v - sz / 2,
              top: y + Math.sin(ang) * dist * v - sz / 2,
              transform: `scale(${Math.max(0, vida)}) rotate(${v * 90 + i * 20}deg)`,
              filter: 'drop-shadow(0 0 6px rgba(255,160,60,0.75))',
            }}
          >
            <path d="M0 -12 C1.4 -3 3 -1.4 12 0 C3 1.4 1.4 3 0 12 C-1.4 3 -3 1.4 -12 0 C-3 -1.4 -1.4 -3 0 -12Z" fill={col} />
          </svg>
        );
      })}
    </div>
  );
};

/* ---------- small parts ---------- */

const Tick: React.FC<{size: number; draw: number; color?: string; stroke?: number}> = ({size, draw, color = C.tinta, stroke = 3}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - draw)} />
  </svg>
);

const Cruz: React.FC<{size: number; draw: number; color?: string}> = ({size, draw, color = C.papel}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 6 L18 18" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={17} strokeDashoffset={17 * (1 - c01(draw * 2))} />
    <path d="M18 6 L6 18" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={17} strokeDashoffset={17 * (1 - c01(draw * 2 - 1))} />
  </svg>
);

/** The default icon's glyph: an accent bar, the same object as the blade that cuts the reply open. */
const GLIFO_K = {h: 0.5, w: 0.1};
const Glifo: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size * GLIFO_K.w, height: size * GLIFO_K.h, borderRadius: (size * GLIFO_K.w) / 2, background: C.acento}} />
);

/** The app icon: the brand's own (ajustes.marca.icono) or a dark tile with the accent bar. */
const Logo: React.FC<{size: number; glifo?: boolean}> = ({size, glifo = true}) =>
  A.marca.icono ? (
    <Img
      src={staticFile(A.marca.icono)}
      style={{width: size, height: size, borderRadius: size * 0.27, objectFit: 'cover', flexShrink: 0, boxShadow: `0 ${size * 0.12}px ${size * 0.28}px rgba(40,25,10,0.28)`}}
    />
  ) : (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.27,
      background: 'linear-gradient(150deg, #2a2722 0%, #11100e 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 ${size * 0.12}px ${size * 0.28}px rgba(40,25,10,0.28), inset 0 ${Math.max(1, size * 0.012)}px 0 rgba(255,255,255,0.14)`,
    }}
  >
    {glifo ? <Glifo size={size} /> : null}
  </div>
  );

const Pastilla: React.FC<{children: React.ReactNode; tone?: 'neu' | 'tinta' | 'error'; size?: number; style?: React.CSSProperties}> = ({children, tone = 'neu', size = 20, style}) => {
  const t = {
    neu: {background: NEU.alto, color: C.grisPapel, boxShadow: NEU.sombraS},
    tinta: {background: C.tinta, color: C.blanco, boxShadow: '0 10px 24px rgba(17,16,14,0.25)'},
    error: {background: C.error, color: C.blanco, boxShadow: '0 10px 24px rgba(163,29,11,0.25)'},
  }[tone];
  return (
    <div style={{fontFamily: TEXTO, fontWeight: 600, fontSize: size, padding: `${size * 0.5}px ${size * 0.85}px`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: size * 0.5, whiteSpace: 'nowrap', ...t, ...style}}>
      {children}
    </div>
  );
};

const Caret: React.FC<{on: boolean; h?: number}> = ({on, h = 40}) => <span style={{display: 'inline-block', width: 3, height: h, background: C.tinta, marginLeft: 3, verticalAlign: 'middle', opacity: on ? 1 : 0}} />;

/** A capture from ajustes.capturas, filling its screen. */
const Captura: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style}} />
);

/** Typed text: each character lands with a small lift, as on a real screen. */
const Tecleado: React.FC<{f: number; text: string; keys: number[]}> = ({f, text, keys}) => {
  let i0 = 0;
  return (
    <>
      {(text.match(/\S+|\s+/g) ?? []).map((tok, t) => {
        const start = i0;
        i0 += tok.length;
        if (f < keys[start]) {
          return null;
        }
        return (
          <span key={t} style={{display: 'inline-block', whiteSpace: 'pre'}}>
            {tok.split('').map((ch, k) => {
              const j = start + k;
              return f >= keys[j] ? (
                <span key={k} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - p(f, keys[j], 3, E.out)) * 6}px)`, opacity: c01(p(f, keys[j], 2) * 1.5)}}>
                  {ch}
                </span>
              ) : null;
            })}
          </span>
        );
      })}
    </>
  );
};

/** An abstract video: no real footage, no brands. Vertical pieces carry burned-in captions. */
const Escena: React.FC<{f: number; vertical?: boolean; seed?: number; subs?: {t: string; f: number}[]}> = ({f, vertical, seed = 0, subs}) => {
  const hue = [22, 200, 330][seed % 3];
  const shown = subs ? subs.filter((w) => f >= w.f).slice(-3) : [];
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, hsl(${hue}, 32%, 22%) 0%, #1c1a17 48%, hsl(${hue + 160}, 18%, 18%) 100%)`, overflow: 'hidden'}}>
      {[0, 1, 2].map((j) => (
        <div
          key={j}
          style={{
            position: 'absolute',
            left: `${-30 + ((f * 0.6 + j * 45 + seed * 20) % 160)}%`,
            top: '-20%',
            width: '18%',
            height: '140%',
            transform: 'rotate(18deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,200,150,0.12), rgba(255,255,255,0))',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: vertical ? '14%' : '4%',
          bottom: vertical ? '30%' : '8%',
          width: vertical ? '72%' : '24%',
          aspectRatio: '4 / 3',
          borderRadius: 12,
          background: '#2b2722',
          border: '2px solid rgba(255,255,255,0.18)',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: '39%', top: '20%', width: '22%', aspectRatio: '1', borderRadius: '50%', background: '#5a5246', transform: `translateY(${Math.sin(f / 9 + seed) * 2}px)`}} />
        <div style={{position: 'absolute', left: '24%', top: '56%', width: '52%', height: '60%', borderRadius: '40% 40% 0 0', background: '#5a5246'}} />
      </div>
      {vertical ? null : (
        <div style={{position: 'absolute', right: '3%', top: '6%', bottom: '6%', width: '24%', borderRadius: 10, background: 'rgba(0,0,0,0.25)', overflow: 'hidden'}}>
          {Array.from({length: 10}).map((_, j) => (
            <div
              key={j}
              style={{
                position: 'absolute',
                left: 10,
                right: 10 + ((j * 37) % 40),
                height: 8,
                borderRadius: 4,
                top: (((j * 24 - f * 1.4) % 240) + 240) % 240,
                background: j % 3 === 0 ? 'rgba(255,190,140,0.4)' : 'rgba(244,242,236,0.18)',
              }}
            />
          ))}
        </div>
      )}
      {shown.length ? (
        <div style={{position: 'absolute', left: '8%', right: '8%', top: '56%', textAlign: 'center', lineHeight: 1.05}}>
          {shown.map((w) => (
            <span
              key={`${w.t}-${w.f}`}
              style={{
                ...DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                display: 'inline-block',
                margin: '0 0.12em',
                fontSize: 30,
                color: C.blanco,
                WebkitTextStroke: `2px ${C.tinta}`,
                paintOrder: 'stroke',
                transform: `scale(${1 + 0.3 * (1 - p(f, w.f, 4, E.out))})`,
              }}
            >
              {w.t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- captions: next to their object, inside the camera, one focus at a time ----------
 * Same object, same place; new object, new place. A caption comes in while its scene is still,
 * and the scene acts once it has been read (about 15 characters a second).
 * Entrances: 'sube' (each word rises through its mask), 'detras' (the block rises from behind an
 * edge `borde` px below it) and 'lado' (the block slides out leftwards from behind its right edge).
 */
type Entrada = 'sube' | 'detras' | 'lado';
type RotuloProps = {
  f: number;
  at: number;
  out: number;
  t: string;
  sub?: string;
  subAt?: number;
  /** Anchor in world px: the caption's bottom edge (ancla 'abajo') or top edge ('arriba'). */
  x: number;
  y: number;
  ancla?: 'abajo' | 'arriba';
  align?: 'center' | 'left';
  w?: number;
  size?: number;
  entrada?: Entrada;
  borde?: number;
};

const Rotulo: React.FC<RotuloProps> = ({f, at, out, t, sub, subAt, x, y, ancla = 'abajo', align = 'center', w = 920, size = 76, entrada = 'sube', borde = 0}) => {
  const ws = t.split(' ');
  if (f < at - 2 || f > out + ws.length + 14) {
    return null;
  }
  const sAt = subAt ?? at + ws.length * 3 + 4;
  const sIn = p(f, sAt, 14, E.out);
  const sOut = p(f, out, 9, E.in);
  const sBlur = (1 - sIn) * 8 + sOut * 8;
  const left = align === 'center' ? x - w / 2 : x;
  const linea = (
    <div style={{...DISPLAY, fontSize: size, color: C.tinta, textWrap: 'balance', textAlign: align}}>
      {entrada === 'sube'
        ? ws.map((wd, i) => {
            const a = sp(f, at + i * 3, 17, 170, 0.8);
            const xo = p(f, out + i, 8, E.in);
            const bl = (1 - c01(a)) * 9 + xo * 9;
            return (
              <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.04em 0.03em 0.16em', margin: '0 0.11em -0.16em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - a) * 105 - xo * 112}%)`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined}}>{wd}</span>
              </span>
            );
          })
        : t}
    </div>
  );
  const gris = sub ? (
    <div
      style={{
        fontFamily: TEXTO,
        fontWeight: 500,
        fontSize: size * 0.52,
        letterSpacing: '-0.012em',
        lineHeight: 1.2,
        color: GRIS,
        textAlign: align,
        marginTop: size * 0.2,
        opacity: sIn * (entrada === 'sube' ? 1 - sOut : 1),
        transform: `translateY(${(1 - sIn) * 18 - (entrada === 'sube' ? sOut * 16 : 0)}px)`,
        filter: sBlur > 0.3 && entrada === 'sube' ? `blur(${sBlur}px)` : sIn < 0.95 ? `blur(${(1 - sIn) * 8}px)` : undefined,
      }}
    >
      {sub}
    </div>
  ) : null;
  const pos: React.CSSProperties = {position: 'absolute', left, width: w, top: y, transform: ancla === 'abajo' ? 'translateY(-100%)' : undefined};
  if (entrada === 'sube') {
    return (
      <div style={pos}>
        {linea}
        {gris}
      </div>
    );
  }
  const e = sp(f, at, 19, 150, 0.9);
  const o = p(f, out, 11, E.in);
  const bl = (1 - c01(e)) * 10 + o * 10;
  if (entrada === 'detras') {
    // The mask's bottom edge is `borde` px below the caption: the block rises out from behind it and sinks back.
    const k = 1 - e + o;
    return (
      <div style={{...pos, top: y + borde, overflow: 'hidden', paddingTop: 24, paddingBottom: borde}}>
        <div style={{transform: `translateY(calc(${k * 100}% + ${k * borde}px))`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined}}>
          {linea}
          {gris}
        </div>
      </div>
    );
  }
  // 'lado': slides out leftwards from behind the mask's right edge and goes back the same way.
  const k = 1 - e + o;
  return (
    <div style={{...pos, overflow: 'hidden', padding: '0.1em 0'}}>
      <div style={{transform: `translateX(${k * 105}%)`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined}}>
        {linea}
        {gris}
      </div>
    </div>
  );
};

/* ---------- camera ---------- */

type CamKey = {f: number; x: number; y: number; z: number};
/*
 * Safe zone. Feed apps cover the frame: Meta asks Reels ads to keep text, logos and key elements
 * out of the top 14 %, the bottom 35 % and 6 % at each side; YouTube's vertical ads zone leaves
 * 288 px at the top, 672 at the bottom, 48 left and 192 right (the action buttons). Together, on
 * 1080×1920: x 65-888, y 288-1248. The camera looks at that zone's centre, not the frame's, and
 * shows the world a little smaller (G), so every caption, button and the brand land inside it;
 * only bodies (keyboard, phone bottoms, falling coins) reach into the covered strips.
 */
const ZONA = {x0: 65, x1: 888, y0: 288, y1: 1248};
const AX = 496;
const AY = 790;
const G = 0.86;
const CAM: CamKey[] = [
  {f: 0, x: 540, y: 1040, z: 1.0},
  {f: ADJ + 4, x: 540, y: 1080, z: 1.02},
  {f: 38, x: 540, y: 1100, z: 1.03},
  {f: SEND - 2, x: 540, y: 1100, z: 1.03},
  {f: REPLY + 4, x: 540, y: 1080, z: 1.02},
  {f: FLY + 8, x: 540, y: 900, z: 1.0},
  {f: MARCA_AT + 30, x: 540, y: 900, z: 1.05},
  {f: BRAND_OUT + 2, x: 540, y: 940, z: 1.04},
  {f: LAP_IN + 26, x: 540, y: 1110, z: 0.92},
  {f: ROW0 - 4, x: 540, y: 1080, z: 1.04},
  {f: STAMP + 2, x: 540, y: 1160, z: 1.04},
  {f: EDIT + 6, x: 540, y: 1110, z: 1.0},
  {f: EDIT + 22, x: 540, y: 1170, z: 1.04},
  {f: LIFT - 2, x: 540, y: 1175, z: 1.03},
  {f: PH_IN + 4, x: 540, y: 1130, z: 0.95},
  {f: HERO - 4, x: 540, y: 1150, z: 1.0},
  {f: FEED + 8, x: 540, y: 1150, z: 0.9},
  {f: ASOMBRO - 1, x: 540, y: 1150, z: 1.0},
  {f: ASOMBRO + 7, x: 540, y: 1150, z: 0.95},
  {f: PAGO + 4, x: 540, y: 1100, z: 1.02},
  {f: DINERO + 6, x: 540, y: 1060, z: 0.93},
  {f: REV - 6, x: 540, y: 1080, z: 0.97},
  {f: REV + 10, x: 540, y: 1090, z: 1.0},
  {f: R[1] - 4, x: 540, y: 1110, z: 1.02},
  {f: R[1] + 16, x: 540, y: 1130, z: 1.06},
  {f: INF - 2, x: 540, y: 1130, z: 1.06},
  {f: INF + 14, x: 540, y: 1100, z: 1.0},
  {f: V.destacada, x: 540, y: 1100, z: 1.0},
  {f: CTA0 - 4, x: 540, y: 1110, z: 1.0},
  {f: CTA0 + 10, x: 540, y: 1060, z: 0.97},
  {f: CTA.press - 2, x: 540, y: 1060, z: 1.08},
  {f: CTA.morph + 14, x: 540, y: 1080, z: 0.97},
  {f: CTA.chip - 2, x: 550, y: 1010, z: 1.02},
  {f: CTA.field + 2, x: 540, y: 1120, z: 1.08},
  {f: CTA.send - 6, x: 540, y: 1200, z: 1.0},
  {f: PLANE + 2, x: 540, y: 1080, z: 1.0},
  {f: PLANE + 16, x: 700, y: 760, z: 0.94},
  {f: TOAST + 8, x: 540, y: 1080, z: 1.0},
  {f: FIN - 6, x: 540, y: 1000, z: 1.04},
  {f: FIN + 4, x: 540, y: 1000, z: 0.97},
  {f: FIN + 90, x: 540, y: 1000, z: 1.03},
];
type Cam = {x: number; y: number; z: number; r: number};
const KICKS: [number, number][] = [
  [ADJ, 1],
  [SEND, 1],
  [REPLY, 1],
  [CUT, 1],
  [STAMP, 1],
  [LIFT, 1],
  [ASOMBRO, 4],
  [GIRO + 12, 1.5],
  [DINERO, 2.5],
  [REV, 1],
  [CTA.press, 1],
  [CTA.chip, 1],
  [CTA.field, 1],
  [CTA.send, 1],
  [FIN, 1],
];
const camara = (f: number): Cam => {
  const last = CAM[CAM.length - 1];
  let base = {x: last.x, y: last.y, z: last.z};
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i];
    const b = CAM[i + 1];
    if (f < b.f) {
      const t = E.io(c01((f - a.f) / (b.f - a.f)));
      base = {x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), z: mix(a.z, b.z, t)};
      break;
    }
  }
  const kick = KICKS.reduce((s, [c, k]) => s + (f >= c && f < c + 7 ? k * Math.sin(((f - c) / 7) * Math.PI) : 0), 0);
  const shake = f >= ASOMBRO && f < ASOMBRO + 10 ? (1 - (f - ASOMBRO) / 10) * 6 : 0;
  return {
    x: base.x + 5 * Math.sin(f / 43) + 2 * Math.sin(f / 17) + shake * Math.sin(f * 2.3),
    y: base.y + 4 * Math.cos(f / 37) + 1.5 * Math.sin(f / 13) + shake * Math.cos(f * 2.9),
    z: base.z * (1 + 0.014 * kick),
    r: 0.2 * Math.sin(f / 57),
  };
};
/** Review renders only (prop `zonas`): what the feed apps may cover, in red. */
const ZonaSegura: React.FC = () => {
  const rojo = 'rgba(255,0,80,0.22)';
  const caja = (left: number, top: number, width: number, height: number) => <div style={{position: 'absolute', left, top, width, height, background: rojo}} />;
  return (
    <>
      {caja(0, 0, 1080, ZONA.y0)}
      {caja(0, ZONA.y1, 1080, 1920 - ZONA.y1)}
      {caja(0, ZONA.y0, ZONA.x0, ZONA.y1 - ZONA.y0)}
      {caja(ZONA.x1, ZONA.y0, 1080 - ZONA.x1, ZONA.y1 - ZONA.y0)}
    </>
  );
};
const Camara: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${AX}px, ${AY}px) rotate(${cam.r}deg) scale(${cam.z * G}) translate(${-cam.x}px, ${-cam.y}px)`}}>{children}</AbsoluteFill>
);

/* ---------- sets: one soft neumorphic surface; each act changes the light ---------- */

type Look = 'neu' | 'puntos' | 'calido';
// x, y: the world point the reveal starts from (it follows the camera); pantalla: a screen point.
const CAPAS: {from: number; dur: number; x: number; y: number; k: Look; pantalla?: boolean}[] = [
  {from: -100, dur: 1, x: 540, y: 960, k: 'neu', pantalla: true},
  {from: LAP_IN - 4, dur: 18, x: 540, y: 1920, k: 'puntos', pantalla: true},
  {from: HERO - 2, dur: 18, x: 540, y: 1150, k: 'calido'},
  {from: REV - 2, dur: 16, x: 540, y: 1110, k: 'neu'},
  {from: INF - 4, dur: 16, x: 540, y: 1100, k: 'puntos'},
  {from: CTA0 - 2, dur: 16, x: 540, y: 1060, k: 'neu'},
];
const M = 140;

const Luz: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{position: 'absolute', left: -300 + 120 * Math.sin(f / 80), top: -500, width: 1700, height: 1500, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.78) 22%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.2) 78%, rgba(255,255,255,0) 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(90,70,45,0.10) 100%)'}} />
  </>
);

const Neu: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #f1eee9 0%, #ebe8e2 60%, #e3dfd8 100%)', overflow: 'hidden'}}>
    <Luz f={f} />
  </AbsoluteFill>
);

const Puntos: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: 'linear-gradient(175deg, #efece6 0%, #e7e3dc 100%)', overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(rgba(17,16,14,0.08) 2.2px, transparent 2.4px)',
        backgroundSize: '44px 44px',
        backgroundPosition: `${(f * 0.5) % 44}px ${(f * 1.0) % 44}px`,
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 55%, black 25%, transparent 78%)',
      }}
    />
    <Luz f={f} />
  </AbsoluteFill>
);

/** The hero's set: warmer, with a glow behind the phone that flares on the wow. */
const Calido: React.FC<{f: number}> = ({f}) => {
  const wow = f >= ASOMBRO ? Math.exp(-(f - ASOMBRO) / 14) : 0;
  const g = 0.32 + 0.25 * p(f, FEED, ASOMBRO - FEED, E.in) + 0.5 * wow;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #f0ebe3 0%, #e9e2d7 60%, #e0d8cb 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 + M - 760, top: 1170 + M - 760, width: 1520, height: 1520, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(255,170,90,${g}) 0%, rgba(255,175,100,${g * 0.95}) 18%, rgba(255,200,150,${g * 0.5}) 50%, rgba(255,220,190,${g * 0.15}) 80%, rgba(255,255,255,0) 100%)`, transform: `scale(${1 + 0.15 * wow + 0.03 * Math.sin(f / 9)})`}} />
      <div style={{position: 'absolute', left: 540 + M - 420, top: 1000 + M - 420, width: 840, height: 840, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(150,170,255,${0.16 + 0.2 * wow}), rgba(255,255,255,0))`, transform: `translate(${120 * Math.sin(f / 40)}px, ${80 * Math.cos(f / 50)}px)`}} />
      <Luz f={f} />
    </AbsoluteFill>
  );
};

const LOOK: Record<Look, React.FC<{f: number}>> = {neu: Neu, puntos: Puntos, calido: Calido};

const Fondo: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  let i = 0;
  CAPAS.forEach((c, j) => {
    if (f >= c.from) i = j;
  });
  const c = CAPAS[i];
  const r = p(f, c.from, c.dur, E.io);
  const Rr = 2500 * r;
  const Prev = i > 0 ? LOOK[CAPAS[i - 1].k] : null;
  const Now = LOOK[c.k];
  const k = 0.18;
  const tx = -(cam.x - AX) * k;
  const ty = -(cam.y - AY) * k;
  const s = 1 + (cam.z - 1) * 0.25;
  // The reveal's centre in the layer: where its object is on screen, through the layer's own move.
  const sx = c.pantalla ? c.x : AX + cam.z * G * (c.x - cam.x);
  const sy = c.pantalla ? c.y : AY + cam.z * G * (c.y - cam.y);
  const cx = (sx - tx - 540) / s + 540 + M;
  const cy = (sy - ty - 960) / s + 960 + M;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: NEU.fondo}}>
      <div style={{position: 'absolute', left: -M, top: -M, width: 1080 + 2 * M, height: 1920 + 2 * M, transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
        {r < 1 && Prev ? <Prev f={f} /> : null}
        <AbsoluteFill style={{clipPath: r < 1 ? `circle(${Rr}px at ${cx}px ${cy}px)` : undefined}}>
          <Now f={f} />
        </AbsoluteFill>
        {r > 0 && r < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: cx - Rr,
              top: cy - Rr,
              width: 2 * Rr,
              height: 2 * Rr,
              borderRadius: '50%',
              border: `${6 * (1 - r) + 1}px solid rgba(255,255,255,${0.9 * (1 - r)})`,
              boxShadow: `0 0 40px rgba(160,146,126,${0.3 * (1 - r)})`,
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- cursor ---------- */

type CK = {f: number; x: number; y: number};
const ruta = (ks: CK[], f: number) => {
  if (f <= ks[0].f) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (f < b.f) {
      const t = E.io((f - a.f) / (b.f - a.f));
      const bend = Math.sin(Math.PI * t) * 0.12 * (i % 2 ? -1 : 1);
      return {f, x: mix(a.x, b.x, t) + (b.y - a.y) * bend, y: mix(a.y, b.y, t) - (b.x - a.x) * bend};
    }
  }
  return ks[ks.length - 1];
};

const Cursor: React.FC<{f: number; ks: CK[]; clicks: number[]; to: number}> = ({f, ks, clicks, to}) => {
  if (f < ks[0].f - 2 || f > to + 12) return null;
  const o = p(f, ks[0].f, 8) * (1 - sale(f, to, 10));
  const {x, y} = ruta(ks, f);
  const press = Math.max(0, ...clicks.map((c) => (f >= c - 3 && f <= c + 4 ? 1 - Math.abs(f - c) / 4 : 0)));
  const mano = clicks.some((c) => f >= c - 9 && f <= c + 5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {clicks.map((c) => {
        if (f < c || f > c + 20) return null;
        const r = p(f, c, 18, E.out);
        const d = 24 + 120 * r;
        return <div key={c} style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: '4px solid rgba(17,16,14,0.35)', opacity: 1 - r}} />;
      })}
      {mano ? (
        <svg width={66} height={66} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 26.8, top: y - 8.2, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '26.8px 8.2px', filter: 'drop-shadow(0 6px 10px rgba(40,25,10,0.35))'}}>
          <path
            d="M8.5 13 V4.2 a1.25 1.25 0 0 1 2.5 0 V10.5 V9.2 a1.25 1.25 0 0 1 2.5 0 V11 V10 a1.25 1.25 0 0 1 2.5 0 V11.6 V11 a1.25 1.25 0 0 1 2.5 0 V16 q0 5 -5 5.5 H11.5 q-2 0 -3.4 -1.6 L4.6 15.4 a1.3 1.3 0 0 1 1.9 -1.8 L8.5 15 Z"
            fill="#fff"
            stroke={C.tinta}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
          <path d="M11 10.5 V13.4 M13.5 11 V13.6 M16 11.6 V13.8" fill="none" stroke={C.tinta} strokeWidth={0.9} strokeLinecap="round" />
        </svg>
      ) : (
        <svg width={60} height={60} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 12.5, top: y - 6.25, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '12.5px 6.25px', filter: 'drop-shadow(0 6px 10px rgba(40,25,10,0.35))'}}>
          <path d="M5 2.5 L5 19.5 L9.3 15.6 L12.2 21.8 L15 20.6 L12.1 14.4 L18 14.4 Z" fill="#fff" stroke={C.tinta} strokeWidth={1.3} strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

/* ---------- 1. the chat ---------- */

const CHAT = {x: 90, y: 520, w: 900, h: 1040, pad: 36, cab: 124, comp: 150};
const CHAT_FONDO = CHAT.y + CHAT.h - CHAT.comp - 18;
const GAP_MSG = 18;
const H_ADJ = 168;
const H_USR = 132;
const H_PUNTOS = 84;
const H_RESP = 96;
const W_RESP = 560;
/** Where the reply sits in the chat, in composition pixels (the flight starts there). */
const RESP0 = {x: CHAT.x + CHAT.pad + W_RESP / 2, y: CHAT_FONDO - H_RESP / 2};
const RESP1 = {x: 540, y: 860, s: 1.3};

const Chat: React.FC<{f: number}> = ({f}) => {
  if (f > FLY + 16) return null;
  const e = sp(f, -6, 18, 120, 1);
  const fuera = p(f, FLY, 12, E.in);
  const typed = MSG_KEYS.filter((k) => f >= k).length;
  const last = typed ? MSG_KEYS[typed - 1] : -99;
  const enviado = f >= SEND;
  const caretOn = !enviado && f >= MSG_KEYS[0] - 6 && (f - last < 8 || Math.floor(f / 9) % 2 === 0);
  const ready = typed === MSG.length && !enviado ? p(f, last, 4) : 0;
  const press = f >= SEND - 2 && f <= SEND + 2 ? 1 : 0;
  // The stack grows from the bottom: each new message pushes the others up.
  const sube = (desde: number, h: number) => (f >= desde ? (h + GAP_MSG) * c01(sp(f, desde, 16, 170, 0.9)) : 0);
  const slotH = mix(H_PUNTOS, H_RESP, c01(sp(f, REPLY, 16, 170, 0.9)));
  const yResp = CHAT_FONDO;
  const yUsr = CHAT_FONDO - sube(DOTS, slotH);
  const yAdj = yUsr - sube(SEND, H_USR);
  const usr = sp(f, SEND, 15, 170, 0.9);
  const dots = f >= DOTS && f < REPLY + 2 ? pum(f, DOTS) : null;
  const L = (x: number) => x - CHAT.x;
  const T = (y: number) => y - CHAT.y;
  return (
    <div
      style={{
        position: 'absolute',
        left: CHAT.x,
        top: CHAT.y,
        width: CHAT.w,
        height: CHAT.h,
        borderRadius: 52,
        background: NEU.alto,
        boxShadow: NEU.sombra,
        transform: `translateY(${(1 - e) * 60 + fuera * 90}px) scale(${1 - 0.06 * fuera})`,
        opacity: c01(e * 1.5) * (1 - fuera),
        filter: fuera > 0 ? `blur(${fuera * 10}px)` : undefined,
      }}
    >
      <div style={{position: 'absolute', left: CHAT.pad, right: CHAT.pad, top: 0, height: CHAT.cab, display: 'flex', alignItems: 'center', gap: 22, borderBottom: '1.5px solid rgba(17,16,14,0.07)'}}>
        <Logo size={70} />
        <div>
          <div style={{...DISPLAY, fontSize: 34, color: C.tinta}}>{A.marca.nombre}</div>
          <div style={{fontFamily: TEXTO, fontSize: 21, color: GRIS, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: VERDE, display: 'inline-block'}} />
            {A.chat.estado}
          </div>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 9, height: 9, borderRadius: 5, background: 'rgba(17,16,14,0.25)'}} />
          ))}
        </div>
      </div>

      {/* the file, dropped in as an attachment */}
      {f >= ADJ - 1 ? (
        <div
          style={{
            position: 'absolute',
            right: CHAT.pad,
            top: T(yAdj - H_ADJ),
            width: 590,
            height: H_ADJ,
            borderRadius: '30px 30px 8px 30px',
            background: NEU.alto,
            boxShadow: NEU.sombraS,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '0 22px',
            boxSizing: 'border-box',
            ...pumStyle(f, ADJ, '100% 100%'),
          }}
        >
          <div style={{position: 'relative', width: 200, height: 120, borderRadius: 16, overflow: 'hidden', flexShrink: 0}}>
            <Escena f={f} />
            <div style={{position: 'absolute', right: 8, bottom: 8, ...MONO, fontSize: 14, padding: '3px 8px', borderRadius: 6, background: 'rgba(17,16,14,0.8)', color: C.papel}}>{A.chat.adjunto.duracion}</div>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: TEXTO, fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', color: C.tinta}}>{A.chat.adjunto.nombre}</div>
            <div style={{fontFamily: TEXTO, fontSize: 20, color: GRIS, marginTop: 4}}>{A.chat.adjunto.detalle}</div>
            <div style={{position: 'relative', height: 24, marginTop: 12, display: 'flex', alignItems: 'center', gap: 2}}>
              {Array.from({length: 46}).map((_, j) => (
                <div key={j} style={{flex: 1, height: `${25 + 75 * Math.abs(Math.sin(j * 1.3) * Math.cos(j * 0.4))}%`, borderRadius: 2, background: 'rgba(17,16,14,0.18)'}} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* the question, sent */}
      {enviado ? (
        <div
          style={{
            position: 'absolute',
            right: CHAT.pad,
            top: T(yUsr - H_USR),
            width: 610,
            height: H_USR,
            boxSizing: 'border-box',
            padding: '0 30px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '30px 30px 8px 30px',
            background: C.tinta,
            color: C.blanco,
            fontFamily: TEXTO,
            fontSize: 30,
            lineHeight: 1.28,
            boxShadow: '0 16px 34px rgba(17,16,14,0.22)',
            transform: `translateY(${(1 - usr) * 150}px) scale(${0.9 + 0.1 * c01(usr)})`,
            transformOrigin: '100% 100%',
            opacity: c01(usr * 2),
          }}
        >
          {MSG}
        </div>
      ) : null}

      {/* «escribiendo…» */}
      {dots ? (
        <div
          style={{
            position: 'absolute',
            left: CHAT.pad,
            top: T(yResp - H_PUNTOS),
            width: 132,
            height: H_PUNTOS,
            borderRadius: '30px 30px 30px 8px',
            background: NEU.alto,
            boxShadow: NEU.sombraS,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transform: `scale(${(0.35 + 0.65 * dots.s) * (1 - p(f, REPLY - 1, 3))})`,
            transformOrigin: '0 100%',
            opacity: dots.o,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: GRIS, transform: `translateY(${-7 * Math.max(0, Math.sin((f - DOTS) / 2.6 - i * 0.9))}px)`, opacity: 0.55 + 0.45 * Math.max(0, Math.sin((f - DOTS) / 2.6 - i * 0.9))}} />
          ))}
        </div>
      ) : null}

      {/* the reply, in its place until it flies */}
      {f >= REPLY - 1 && f < FLY ? (
        <div style={{position: 'absolute', left: L(RESP0.x - W_RESP / 2), top: T(yResp - H_RESP), ...pumStyle(f, REPLY, '0 100%')}}>
          <Respuesta />
        </div>
      ) : null}

      {/* composer */}
      <div
        style={{
          position: 'absolute',
          left: CHAT.pad,
          right: CHAT.pad + 110,
          bottom: 26,
          height: 108,
          borderRadius: 28,
          background: NEU.fondo,
          boxShadow: NEU.hundido,
          padding: '0 26px',
          display: 'flex',
          alignItems: 'center',
          fontFamily: TEXTO,
          fontSize: 29,
          lineHeight: 1.25,
          color: C.tinta,
        }}
      >
        {enviado || typed === 0 ? <span style={{color: '#a9a397'}}>{A.chat.placeholder}</span> : null}
        {!enviado ? (
          <span>
            <Tecleado f={f} text={MSG} keys={MSG_KEYS} />
            <Caret on={caretOn} h={36} />
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          right: CHAT.pad,
          bottom: 30,
          width: 100,
          height: 100,
          borderRadius: 50,
          background: ready > 0 ? C.tinta : NEU.alto,
          boxShadow: ready > 0 ? '0 14px 30px rgba(17,16,14,0.3)' : NEU.sombraS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + 0.06 * ready - 0.12 * press})`,
        }}
      >
        <svg width={42} height={42} viewBox="0 0 24 24">
          <path d="M12 19 V5 M5.5 11.5 L12 5 L18.5 11.5" fill="none" stroke={ready > 0 ? C.blanco : GRIS} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Respuesta: React.FC = () => (
  <div
    style={{
      width: W_RESP,
      height: H_RESP,
      boxSizing: 'border-box',
      borderRadius: '30px 30px 30px 8px',
      background: NEU.alto,
      boxShadow: NEU.sombraS,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 28px',
      fontFamily: TEXTO,
      fontSize: 32,
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: C.tinta,
      whiteSpace: 'nowrap',
    }}
  >
    <Logo size={44} />
    {RESPUESTA}
  </div>
);

/** The reply leaves the chat, takes the centre and the accent blade cuts it open into the brand. */
const Vuelo: React.FC<{f: number}> = ({f}) => {
  if (f < FLY || f > CUT + 16) return null;
  const t = p(f, FLY, CUT - FLY + 2, E.io);
  const s = p(f, CUT, 14, E.in);
  const x = mix(RESP0.x, RESP1.x, t);
  const y = mix(RESP0.y, RESP1.y, t) - Math.sin(Math.PI * t) * 60;
  const k = mix(1, RESP1.s, t);
  const box: React.CSSProperties = {position: 'absolute', left: x - W_RESP / 2, top: y - H_RESP / 2, transformOrigin: '50% 50%'};
  const base = `scale(${k})`;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
      {s > 0 ? (
        <>
          <div style={{...box, transform: `translateX(${-420 * s}px) ${base} rotateY(${30 * s}deg) rotateZ(${-8 * s}deg)`, clipPath: 'inset(-40px 50% -40px -40px)', opacity: 1 - s}}>
            <Respuesta />
          </div>
          <div style={{...box, transform: `translateX(${420 * s}px) ${base} rotateY(${-30 * s}deg) rotateZ(${8 * s}deg)`, clipPath: 'inset(-40px -40px -40px 50%)', opacity: 1 - s}}>
            <Respuesta />
          </div>
        </>
      ) : (
        <div style={{...box, transform: base}}>
          <Respuesta />
        </div>
      )}
    </div>
  );
};

/* ---------- 2. the brand: app icon, name, one line ---------- */

const LOCK = {y: 740, s: 200};
const GLIFO = {h: LOCK.s * GLIFO_K.h, w: LOCK.s * GLIFO_K.w};

const Lockup: React.FC<{f: number; at: number; lema?: string; nota?: string; glifoAt: number}> = ({f, at, lema, nota, glifoAt}) => {
  const nombre = A.marca.nombre;
  // Full size up to ~8 characters; longer names shrink so they stay inside the safe zone.
  const tam = Math.min(150, 1200 / Math.max(1, nombre.length));
  return (
    <>
      <div style={{position: 'absolute', left: 540 - LOCK.s / 2, top: LOCK.y - LOCK.s / 2, ...pumStyle(f, at)}}>
        <Logo size={LOCK.s} glifo={f >= glifoAt} />
      </div>
      <Destello f={f} at={at} x={540} y={LOCK.y} r={260} seed={3} />
      <div style={{position: 'absolute', left: 0, right: 0, top: LOCK.y + LOCK.s / 2 + 40, textAlign: 'center'}}>
        <div style={{...DISPLAY, fontSize: tam, letterSpacing: '-0.05em', color: C.tinta, lineHeight: 1}}>
          {nombre.split('').map((ch, i) => {
            const a = sp(f, at + 5 + i * 1.5, 16, 180, 0.8);
            return (
              <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.02em 0 0.12em', marginBottom: '-0.12em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - a) * 110}%)`, filter: a < 0.9 ? `blur(${(1 - c01(a)) * 8}px)` : undefined}}>{ch === ' ' ? '\u00a0' : ch}</span>
              </span>
            );
          })}
        </div>
        {lema ? <div style={{fontFamily: TEXTO, fontWeight: 500, fontSize: 46, letterSpacing: '-0.015em', color: GRIS, marginTop: 26, opacity: p(f, at + 16, 12), transform: `translateY(${(1 - p(f, at + 16, 14)) * 20}px)`}}>{lema}</div> : null}
        {nota ? (
          <div style={{marginTop: 44, opacity: p(f, at + 22, 12), transform: `translateY(${(1 - p(f, at + 22, 14)) * 20}px)`}}>
            <Pastilla size={26}>{nota}</Pastilla>
          </div>
        ) : null}
      </div>
    </>
  );
};

const MarcaInicio: React.FC<{f: number}> = ({f}) => {
  if (f < MARCA_AT - 1 || f > BRAND_OUT + 12) return null;
  const x = p(f, BRAND_OUT, 10, E.in);
  return (
    <AbsoluteFill style={{opacity: 1 - x, transform: `translateY(${-240 * x}px) scale(${1 + 0.06 * x})`, filter: x > 0 ? `blur(${x * 12}px)` : undefined}}>
      <Lockup f={f} at={MARCA_AT} lema={A.marca.lema} glifoAt={MARCA_AT + 8} />
    </AbsoluteFill>
  );
};

/* ---------- the blade: cuts the reply open and becomes the icon's glyph, twice ---------- */

type Key = {f: number; x: number; y: number; h: number; w: number; o: number};
const ARRIBA = {x: 540, y: -420, h: 300, w: 10};
const ENICONO = {x: 540, y: LOCK.y - GLIFO.h / 2, h: GLIFO.h, w: GLIFO.w};
const CAB: Key[] = [
  {f: 0, ...ARRIBA, o: 0},
  {f: CUT - 7, ...ARRIBA, o: 0},
  {f: CUT - 6, ...ARRIBA, o: 1},
  {f: CUT + 1, x: 540, y: RESP1.y - 260, h: 520, w: 10, o: 1},
  {f: MARCA_AT + 7, ...ENICONO, o: 1},
  {f: MARCA_AT + 8, ...ENICONO, o: 0},
  {f: FIN - 12, ...ARRIBA, o: 0},
  {f: FIN - 11, ...ARRIBA, o: 1},
  {f: FIN + 5, ...ENICONO, o: 1},
  {f: FIN + 6, ...ENICONO, o: 0},
];
const cabEn = (f: number): Key => {
  if (f <= CAB[0].f) return CAB[0];
  for (let i = 0; i < CAB.length - 1; i++) {
    const a = CAB[i];
    const b = CAB[i + 1];
    if (f < b.f) {
      const t = E.io((f - a.f) / (b.f - a.f));
      return {f, x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), h: mix(a.h, b.h, t), w: mix(a.w, b.w, t), o: b.o === 0 && a.o === 1 ? 1 : mix(a.o, b.o, t)};
    }
  }
  return CAB[CAB.length - 1];
};
const Cuchilla: React.FC<{f: number}> = ({f}) => {
  const k = cabEn(f);
  if (k.o <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: k.x - k.w / 2, top: k.y, width: k.w, height: k.h, borderRadius: k.w / 2, background: C.acento, opacity: k.o}} />
  );
};

/* ---------- 3-4. the laptop: the panel, then the editor ---------- */

// The laptop is the widest object, so it sits on the frame's centre, not the safe zone's: the same
// margin on both sides, its screen still inside the zone. The camera looks at x 540 in the world and
// puts it at AX on screen, so the laptop moves (540 - AX) / (G · z) to the right, about 51 px.
// (Moving the camera instead broke the render: from one frame on, Chrome dropped the 3D canvas.)
const LAP = {w: 960, h: 620, cx: 591, cy: 1110};
const IN = {l: LAP.cx - LAP.w / 2 + 22, t: LAP.cy - LAP.h / 2 + 22, w: LAP.w - 44, h: LAP.h - 44};
const TW = IN.w - 40;
const SEGS = [
  {pos: 0.288, tc: '01:12:40', d: '45 s'},
  {pos: 0.489, tc: '02:03:15', d: '38 s'},
  {pos: 0.877, tc: '03:41:02', d: '52 s'},
];
const SEG_W = 0.06;
const SEG_Y = 412;
const SEG_H = 70;
const cutAt = (j: number) => Math.round(SWEEP.from + (SEGS[j].pos + SEG_W) * (SWEEP.to - SWEEP.from));

const BarraApp: React.FC<{titulo: string; derecha?: string}> = ({titulo, derecha}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: '1.5px solid rgba(244,242,236,0.08)', background: '#1b1915'}}>
    {['#4a4740', '#4a4740', '#4a4740'].map((c, i) => (
      <div key={i} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
    ))}
    <div style={{fontFamily: TEXTO, fontSize: 18, fontWeight: 600, color: C.grisSala, marginLeft: 16}}>{titulo}</div>
    {derecha ? <div style={{...MONO, fontSize: 17, color: C.acento, marginLeft: 'auto'}}>{derecha}</div> : null}
  </div>
);

const FILAS_BRIEF = A.panel.filas;

const Brief: React.FC<{f: number}> = ({f}) => {
  const x = p(f, EDIT - 8, 10, E.in);
  if (x >= 1) return null;
  if (A.capturas.panel) {
    return <Captura src={A.capturas.panel} style={{opacity: 1 - x, transform: `translateX(${-80 * x}px)`}} />;
  }
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f3f0eb', opacity: 1 - x, transform: `translateX(${-80 * x}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: '1.5px solid rgba(17,16,14,0.07)', background: '#f8f6f2'}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 13, height: 13, borderRadius: 7, background: '#d9d5cc'}} />
        ))}
        <div style={{fontFamily: TEXTO, fontSize: 18, fontWeight: 600, color: C.grisPapel, marginLeft: 16}}>
          {A.marca.nombre} · {A.panel.seccion}
        </div>
        <div style={{fontFamily: TEXTO, fontSize: 18, color: GRIS, marginLeft: 'auto'}}>{A.panel.etiqueta}</div>
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, top: 80}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
          <div style={{...DISPLAY, fontSize: 48, color: C.tinta}}>{A.panel.titulo}</div>
          {f >= V.recibido - 1 ? (
            <div style={pumStyle(f, V.recibido, '100% 50%')}>
              <Pastilla size={17}>
                <Tick size={20} draw={p(f, V.recibido + 4, 8)} color={VERDE} />
                {A.chat.adjunto.nombre} · {A.panel.recibido}
              </Pastilla>
            </div>
          ) : null}
        </div>
        {FILAS_BRIEF.map(([k, v], j) => {
          const a = ROW0 + j * ROW_GAP;
          const d = p(f, a, 8);
          const m = f >= a ? pum(f, a) : null;
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 18, height: 72, borderBottom: j < FILAS_BRIEF.length - 1 ? '1.5px solid rgba(17,16,14,0.07)' : 'none'}}>
              <div style={{position: 'relative', width: 40, height: 40, flexShrink: 0}}>
                <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: '#ece9e3', boxShadow: 'inset 3px 3px 7px rgba(160,146,126,0.4), inset -3px -3px 7px rgba(255,255,255,0.95)'}} />
                {m ? (
                  <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: C.tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.35 + 0.65 * m.s})`, opacity: m.o, boxShadow: '0 6px 14px rgba(17,16,14,0.25)'}}>
                    <Tick size={28} draw={d} color={C.blanco} stroke={3.4} />
                  </div>
                ) : null}
              </div>
              <div style={{fontFamily: TEXTO, fontSize: 19, fontWeight: 600, color: GRIS, width: 150, flexShrink: 0}}>{k}</div>
              <div style={{fontFamily: TEXTO, fontSize: 27, fontWeight: 500, letterSpacing: '-0.01em', color: C.tinta}}>{v}</div>
            </div>
          );
        })}
      </div>
      {f >= STAMP - 1 ? (
        <div style={{position: 'absolute', right: 40, bottom: 24, transform: 'rotate(-5deg)'}}>
          <div style={pumStyle(f, STAMP, '100% 100%')}>
            <div style={{border: `3px solid ${C.tinta}`, borderRadius: 14, padding: '9px 18px', fontFamily: TEXTO, fontWeight: 700, fontSize: 21, letterSpacing: '-0.01em', color: C.tinta, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 10}}>
              <Tick size={22} draw={p(f, STAMP + 3, 8)} color={VERDE} stroke={3.4} />
              {A.panel.sello}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Editor: React.FC<{f: number}> = ({f}) => {
  const i = p(f, EDIT - 8, 12);
  if (i <= 0) return null;
  if (A.capturas.editor) {
    return <Captura src={A.capturas.editor} style={{opacity: i, transform: `translateX(${80 * (1 - i)}px)`}} />;
  }
  const sweep = c01((f - SWEEP.from) / (SWEEP.to - SWEEP.from));
  const ticks = ['0:00:00', '1:00:00', '2:00:00', '3:00:00', '4:12:07'];
  const tPos = [0, 0.238, 0.476, 0.714, 1];
  const tc = (s: number) => {
    const t = Math.round(s * 15127);
    return `${Math.floor(t / 3600)}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  return (
    <div style={{position: 'absolute', inset: 0, background: '#15130f', opacity: i, transform: `translateX(${80 * (1 - i)}px)`}}>
      <BarraApp titulo={`${A.editor.titulo} · ${A.chat.adjunto.nombre}`} derecha={tc(sweep)} />
      <div style={{position: 'absolute', left: 20, top: 70, width: 540, height: 304, borderRadius: 12, overflow: 'hidden'}}>
        <Escena f={f} />
      </div>
      <div style={{position: 'absolute', left: 576, right: 20, top: 70, height: 304, borderRadius: 12, background: '#1d1b17', border: '1.5px solid rgba(244,242,236,0.08)', padding: '14px 16px'}}>
        <div style={{fontFamily: TEXTO, fontSize: 17, fontWeight: 600, color: C.grisSala}}>{A.editor.lista}</div>
        {SEGS.map((s, j) => {
          const a = sp(f, cutAt(j), 14, 200, 0.8);
          if (f < cutAt(j)) return null;
          return (
            <div key={j} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, opacity: c01(a * 1.4), transform: `translateX(${(1 - a) * 30}px)`}}>
              <div style={{width: 36, height: 56, borderRadius: 6, overflow: 'hidden', position: 'relative', flexShrink: 0, border: `2px solid ${C.acento}`}}>
                <Escena f={f} vertical seed={j} />
              </div>
              <div>
                <div style={{fontFamily: TEXTO, fontSize: 20, fontWeight: 600, color: C.papel}}>
                  {A.editor.pieza} 0{j + 1}
                </div>
                <div style={{...MONO, fontSize: 14, color: C.grisSala, marginTop: 2}}>
                  {s.tc} · {s.d}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 20, width: TW, top: 384, bottom: 16}}>
        {ticks.map((t, j) => (
          <span key={t} style={{position: 'absolute', top: 0, left: tPos[j] * TW, transform: `translateX(${j === 0 ? 0 : j === 4 ? -100 : -50}%)`, ...MONO, fontSize: 13, color: C.salaLinea}}>
            {t}
          </span>
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 60, borderRadius: 10, overflow: 'hidden', display: 'flex', gap: 3}}>
          {Array.from({length: 16}).map((_, j) => (
            <div key={j} style={{flex: 1, background: `linear-gradient(135deg, hsl(${20 + ((j * 23) % 40)}, 18%, ${20 + ((j * 7) % 10)}%), hsl(200, 10%, ${14 + ((j * 5) % 8)}%))`}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 100, height: 40, display: 'flex', alignItems: 'center', gap: 3}}>
          {Array.from({length: 90}).map((_, j) => (
            <div key={j} style={{flex: 1, height: `${20 + 78 * Math.abs(Math.sin(j * 0.9) * Math.cos(j * 0.31))}%`, borderRadius: 2, background: alfa(C.acento, 0.4)}} />
          ))}
        </div>
        {SEGS.map((s, j) => {
          const on = p(f, cutAt(j) - 6, 6);
          const hole = f >= LIFT + j * 4;
          return (
            <div
              key={j}
              style={{
                position: 'absolute',
                left: s.pos * TW,
                width: SEG_W * TW,
                top: SEG_Y - 384,
                height: SEG_H,
                borderRadius: 8,
                border: `3px solid ${alfa(C.acento, on)}`,
                background: hole ? '#0e0d0b' : alfa(C.acento, 0.35 * on),
              }}
            />
          );
        })}
        <div style={{position: 'absolute', left: sweep * TW - 2, top: 22, width: 4, height: 128, background: C.acento, opacity: 1 - p(f, LIFT - 4, 6)}}>
          <div style={{position: 'absolute', left: -11, top: -14, width: 26, height: 24, background: C.acento, clipPath: 'polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%)'}} />
        </div>
      </div>
    </div>
  );
};

/*
 * The 3D laptop arrives whole and closed, turns into place and opens its lid; the screen lights up as
 * the lid passes 55°. For the editor it squares up to the camera (lid frontal), then sinks away.
 */
const ABRE = 98;
// The laptop's size at rest. Its keyboard's front edge, nearest the lens, is its widest part: at this
// size it keeps about 110 px each side, like the other cards (at 0.84 it kept 60).
const LAP_S = 0.74;
const LAP_RY = 0; // and its turn
const CENTRO = 340;
const aCentro = (rx: number, ry: number, s: number) => {
  const a = (rx * Math.PI) / 180;
  const b = (ry * Math.PI) / 180;
  return {x: CENTRO * s * Math.sin(b), y: -CENTRO * s * Math.cos(b) * Math.sin(a), z: CENTRO * s * Math.cos(b) * Math.cos(a)};
};
const lapEstado = (f: number): PortatilEstado | null => {
  if (f < LAP_IN || f > LIFT + 30) {
    return null;
  }
  const e = sp(f, LAP_IN, 20, 90, 1);
  const ce = c01(e);
  // The lid opens once the laptop no longer leans towards the camera: opening it while tilted
  // swung the lid at the lens and the laptop grew wider than the frame (cut at its edge).
  const a = p(f, LAP_IN + 8, 24, E.io);
  const flat = p(f, EDIT - 10, 18, E.io);
  const gone = p(f, LIFT + 4, 20, E.io);
  const bisagra = LAP.cy + LAP.h / 2;
  // Never wider than at rest, and at rest inside the side margins like every other card:
  // nearly square to the camera (a turned laptop brings one side, and its keyboard, closer).
  const rx = mix(-34, 6, e);
  const ry = mix(-18, LAP_RY, e);
  const s = LAP_S * mix(0.7, 1, ce);
  const fin = aCentro(6, LAP_RY, LAP_S);
  const centro = {x: mix(LAP.cx, LAP.cx + fin.x, ce), y: mix(1300, bisagra + fin.y, ce), z: mix(-1700, fin.z, ce)};
  const o = aCentro(rx, ry, s);
  return {
    pose: {
      x: centro.x - o.x,
      y: centro.y - o.y + gone * 120,
      z: centro.z - o.z - gone * 1400,
      rx: mix(rx, -(ABRE - 90), flat),
      ry: mix(ry + 1.2 * Math.sin(f / 50) * ce, 0, flat),
      s,
      o: 1 - p(f, LIFT + 16, 10),
    },
    abre: mix(3, ABRE, a),
  };
};

const Portatil: React.FC<{f: number}> = ({f}) => {
  const l = lapEstado(f);
  if (!l || l.pose.o <= 0.002) {
    return null;
  }
  const on = c01((l.abre - 55) / 38);
  if (on <= 0) {
    return null;
  }
  const brillo = 1 - p(f, LAP_IN + 26, 14);
  return (
    <Mapped quad={quadPantalla(l)} w={LAPTOP.pantalla.w} h={LAPTOP.pantalla.h} radius={10} opacity={l.pose.o * on * (1 - p(f, LIFT + 5, 7))}>
      <div style={{position: 'relative', width: '100%', height: '100%', background: C.blanco}}>
        <Brief f={f} />
        <Editor f={f} />
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(${115 + l.pose.ry * 2}deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) ${30 + l.pose.ry}%, rgba(255,255,255,0) 46%)`}} />
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: '#0b0a09', opacity: (1 - on) * 0.9}} />
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)', opacity: brillo * on * 0.6}} />
      </div>
    </Mapped>
  );
};

/* ---------- 4. the three pieces jump into the phones ---------- */

const MOVILES = [
  {cx: 214, cy: 1150, ry: 20, z: -140},
  {cx: 540, cy: 1120, ry: 0, z: 0},
  {cx: 866, cy: 1150, ry: -20, z: -140},
].map((m, j) => ({...m, handle: A.cuentas[j], caption: A.moviles.textos[j], subs: A.moviles.subtitulos[j]}));
const POSTED = [PH_IN + 14, PH_IN + 8, PH_IN + 20];

/* ---------- 5. the hero: tilt, racing feed, wow, flip, payout ---------- */

/** 0 → 1 over the flip; the spin and the straightening share it. */
const giroT = (f: number) => p(f, GIRO, 24, E.io);
/** The hero drops out of frame from here; it is gone by REV - 1. */
const SALIDA = REV - 13;
const TUMBADO = {x: 556, y: 1195, z: 60, rx: 36, ry: 12, rz: -14, s: 1.38};
const DERECHO = {x: 540, y: 1105, z: 120, rx: 4, ry: 0, rz: 0, s: 1.2};

const heroPose = (f: number, base: Pose): Pose => {
  const t = sp(f, HERO, 18, 110, 1);
  const g = giroT(f);
  const flota = {ry: 3 * Math.sin(f / 24), y: 6 * Math.sin(f / 20)};
  const wow = f >= ASOMBRO ? Math.sin(Math.PI * c01((f - ASOMBRO) / 10)) : 0;
  const pre = p(f, GIRO - 7, 7, E.io) * (1 - g);
  const tumb: Pose = {
    x: mix(base.x, TUMBADO.x, t),
    y: mix(base.y, TUMBADO.y, t) + flota.y * c01(t),
    z: mix(base.z, TUMBADO.z, t),
    rx: mix(base.rx, TUMBADO.rx, t),
    ry: mix(base.ry, TUMBADO.ry, t) + flota.ry * c01(t) - 14 * pre,
    rz: mix(0, TUMBADO.rz, t),
    s: mix(1, TUMBADO.s, t) * (1 + 0.06 * wow),
    o: base.o,
  };
  if (g <= 0) {
    return tumb;
  }
  const dineroK = f >= DINERO ? Math.sin(Math.PI * c01((f - DINERO) / 8)) : 0;
  // Exit: a small hop, then it drops out of frame with the money, whole and lit (no fading in place).
  const salto = Math.sin(Math.PI * p(f, SALIDA - 6, 10, E.io));
  const salida = p(f, SALIDA, 12, E.in);
  return {
    x: mix(tumb.x, DERECHO.x, g),
    y: mix(tumb.y, DERECHO.y + flota.y, g) - 34 * salto + 1550 * salida,
    z: mix(tumb.z, DERECHO.z, g),
    rx: mix(tumb.rx, DERECHO.rx, g) + 26 * salida,
    ry: mix(tumb.ry, DERECHO.ry + flota.ry, g) + 360 * g,
    rz: mix(tumb.rz ?? 0, DERECHO.rz, g) + 9 * salida,
    s: mix(tumb.s, DERECHO.s, g) * (1 + 0.1 * Math.sin(Math.PI * g)) * (1 - 0.05 * dineroK),
    o: 1,
  };
};

/** Pose of each 3D phone: pops up from below and floats; the side ones fly off when the middle one becomes the hero. */
const movilPose = (j: number, f: number): Pose | null => {
  if (f < LIFT + 6 || f > REV + 4) {
    return null;
  }
  const m = MOVILES[j];
  const ent = sp(f, LIFT + 8 + j * 3, 16, 150, 0.9);
  const base: Pose = {
    x: m.cx,
    y: m.cy + Math.sin(f / 22 + j) * 7 + (1 - ent) * 420,
    z: m.z,
    rx: (1 - c01(ent)) * 28,
    ry: m.ry + 2.5 * Math.sin(f / 30 + j),
    s: 1,
    o: c01(ent * 5),
  };
  if (j === 1) {
    return heroPose(f, base);
  }
  const x = p(f, HERO - 2, 16, E.in);
  if (x >= 1) {
    return null;
  }
  const lado = j === 0 ? -1 : 1;
  return {...base, x: base.x + lado * 620 * x, z: base.z - 260 * x, ry: base.ry - lado * 40 * x, rz: lado * 12 * x};
};

/** A point of the laptop's screen, in its own px (916 × 576), where that screen is in the world at f. */
const enPantalla = (f: number, x: number, y: number) => {
  const l = lapEstado(f);
  if (!l) {
    return {x: IN.l + x, y: IN.t + y, k: 1};
  }
  const [a, b, c, d] = quadPantalla(l);
  const u = x / LAPTOP.pantalla.w;
  const v = y / LAPTOP.pantalla.h;
  const arriba = [mix(a[0], b[0], u), mix(a[1], b[1], u)];
  const abajo = [mix(d[0], c[0], u), mix(d[1], c[1], u)];
  return {x: mix(arriba[0], abajo[0], v), y: mix(arriba[1], abajo[1], v), k: Math.hypot(b[0] - a[0], b[1] - a[1]) / LAPTOP.pantalla.w};
};

const cajaDe = (q: [number, number][]) => {
  const xs = q.map((c) => c[0]);
  const ys = q.map((c) => c[1]);
  return {x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys)};
};

const Piezas3D: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
    {SEGS.map((s, j) => {
      const a = LIFT + j * 4;
      if (f < a - 1 || f > a + 28) {
        return null;
      }
      const l = p(f, a, 22, E.io);
      const arc = Math.sin(Math.PI * l);
      // It always aims at its phone's screen where that phone is now (still 420 px low before it rises),
      // so piece and phone meet as they land and it never trails behind as a second copy.
      const final = movilPose(j, Math.max(f, LIFT + 6));
      // It lifts off its segment on the editor's timeline, wherever the laptop's screen is.
      const o = enPantalla(a, 20 + s.pos * TW, SEG_Y);
      const from = {x: o.x, y: o.y, w: SEG_W * TW * o.k, h: SEG_H * o.k};
      const to = final ? cajaDe(quadDe(final, MOVIL.pantalla.w, MOVIL.pantalla.h, MOVIL.frente)) : from;
      return (
        <div
          key={j}
          style={{
            position: 'absolute',
            left: mix(from.x, to.x, l),
            top: mix(from.y, to.y, l) - arc * 160,
            width: mix(from.w, to.w, l),
            height: mix(from.h, to.h, l),
            borderRadius: mix(8, 46, l),
            overflow: 'hidden',
            border: `3px solid ${alfa(C.acento, 1 - l)}`,
            transform: `translateZ(${arc * 240}px) rotateX(${arc * -16}deg) rotateY(${arc * (j - 1) * 18}deg)`,
            boxShadow: `0 ${40 * arc}px ${100 * arc}px rgba(40,25,10,0.35)`,
            opacity: 1 - p(f, a + 22, 4),
          }}
        >
          <Escena f={f} vertical seed={j} />
        </div>
      );
    })}
  </div>
);

const Icono: React.FC<{d: string}> = ({d}) => (
  <svg width={38} height={38} viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}}>
    <path d={d} fill={C.blanco} />
  </svg>
);
const ICONOS = [
  'M12 21s-7.4-4.6-9.5-9.2A5.4 5.4 0 0 1 12 6.1a5.4 5.4 0 0 1 9.5 5.7C19.4 16.4 12 21 12 21z',
  'M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H10l-5.5 4v-4H4A1.5 1.5 0 0 1 2.5 16V6A1.5 1.5 0 0 1 4 4.5z',
  'M14 4l8 7.5-8 7.5v-4.5c-6 0-9.5 2-12 5.5 1-6.5 4.5-10.5 12-11.5z',
  'M6 3h12v18l-6-4.5L6 21z',
];

const Estado: React.FC<{oscuro?: boolean}> = ({oscuro}) => {
  const c = oscuro ? C.tinta : C.blanco;
  return (
    <div style={{position: 'absolute', left: 26, right: 22, top: 14, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 3}}>
      <span style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 17, color: c}}>9:41</span>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 5}}>
        {[6, 9, 12, 15].map((h) => (
          <div key={h} style={{width: 3.5, height: h, borderRadius: 1, background: c}} />
        ))}
        <div style={{width: 26, height: 13, borderRadius: 4, border: `1.6px solid ${c}`, marginLeft: 6, padding: 1.5}}>
          <div style={{width: '72%', height: '100%', borderRadius: 2, background: c}} />
        </div>
      </div>
    </div>
  );
};
const Isla: React.FC = () => <div style={{position: 'absolute', left: '50%', top: 12, width: 92, height: 28, marginLeft: -46, borderRadius: 14, background: '#050404', zIndex: 4}} />;

/** A generic vertical-video app, drawn in full on the phone's screen: status bar, captions, rail, handle, optional label, progress. A capture in ajustes.capturas.moviles replaces it. */
const PantallaMovil: React.FC<{f: number; j: number; ui: number; ry: number}> = ({f, j, ui, ry}) => {
  const m = MOVILES[j];
  const captura = A.capturas.moviles[j];
  if (captura) {
    return (
      <div style={{position: 'relative', width: '100%', height: '100%', background: '#050404'}}>
        <Captura src={captura} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${120 + ry}deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0) 44%)`}} />
      </div>
    );
  }
  const posted = POSTED[j];
  const n = sp(f, posted, 14, 170, 0.8) * (1 - p(f, posted + 30, 8, E.in));
  const subs = m.subs.map((t, k) => ({t, f: PH_IN + 4 + k * 8 + j * 3}));
  const prog = c01((f - PH_IN) / 140);
  const pub = sp(f, PH_IN + 30 + j * 4, 12, 200, 0.7);
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', background: '#050404'}}>
      <Escena f={f} vertical seed={j} subs={subs} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)', opacity: ui}} />
      <div style={{opacity: ui}}>
        <Estado />
      </div>
      <Isla />
      {/* The app, named in plain text: nobody's logo. */}
      <div style={{position: 'absolute', left: 18, top: 50, opacity: ui * (1 - c01(n * 1.4)), fontFamily: TEXTO, fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', color: C.blanco, textShadow: '0 1px 6px rgba(0,0,0,0.5)'}}>{A.moviles.app}</div>
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          top: 52,
          zIndex: 2,
          transform: `translateY(${(1 - n) * -120}px)`,
          opacity: c01(n * 1.4),
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 18,
          background: 'rgba(248,246,241,0.94)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{width: 30, height: 30, borderRadius: 9, background: C.tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Tick size={22} draw={p(f, posted + 4, 8)} color={C.blanco} stroke={3.4} />
        </div>
        <div>
          <div style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 17, color: C.tinta}}>{A.moviles.aviso}</div>
          <div style={{fontFamily: TEXTO, fontSize: 14, color: C.grisPapel}}>{m.handle} · {A.moviles.app}</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 12, bottom: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: ui}}>
        <div style={{width: 46, height: 46, borderRadius: 23, border: `2px solid ${C.blanco}`, background: `linear-gradient(135deg, hsl(${20 + j * 90}, 70%, 60%), hsl(${j * 90}, 60%, 35%))`}} />
        {ICONOS.map((d, k) => (
          <Icono key={k} d={d} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 16, right: 72, bottom: 30, opacity: ui}}>
        <span style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 19, color: C.blanco}}>{m.handle}</span>
        <span style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 13, color: C.blanco, border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px', marginLeft: 8, verticalAlign: 'middle'}}>{A.moviles.seguir}</span>
        {A.moviles.etiqueta ? (
          <div style={{marginTop: 8, transform: `scale(${c01(pub) * 0.2 + 0.8})`, transformOrigin: '0 50%', opacity: c01(pub * 1.5)}}>
            <span style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.92)', color: C.tinta, padding: '4px 9px', borderRadius: 6}}>{A.moviles.etiqueta}</span>
          </div>
        ) : null}
        <div style={{fontFamily: TEXTO, fontSize: 16, color: C.blanco, marginTop: 8, lineHeight: 1.25}}>
          {m.caption}
        </div>
        <div style={{fontFamily: TEXTO, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6}}>{A.moviles.sonido}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(255,255,255,0.25)', opacity: ui}}>
        <div style={{width: `${prog * 100}%`, height: '100%', background: C.blanco}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${120 + ry}deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0) 44%)`}} />
    </div>
  );
};

/* The feed: many different pieces from many accounts, scrolling faster and faster. A tall capture in ajustes.capturas.feed replaces it. */
const TIPOS = ['cara', 'juego', 'charla', 'texto'] as const;
const FRASES = A.feed.frases;
const TILE = {w: 140, h: 228, gap: 8};
const PASO = TILE.h + TILE.gap;
const scrollFeed = (f: number) => {
  const t = Math.max(0, f - FEED);
  const T = ASOMBRO - FEED;
  const a = 2600 / Math.pow(T, 2.6);
  if (t <= T) {
    return a * Math.pow(t, 2.6);
  }
  const v = 2.6 * a * Math.pow(T, 1.6);
  return a * Math.pow(T, 2.6) + v * 0.55 * (t - T);
};
const velFeed = (f: number) => scrollFeed(f + 0.5) - scrollFeed(f - 0.5);

const Mosaico: React.FC<{k: number; f: number}> = ({k, f}) => {
  const hue = (k * 47 + 15) % 360;
  const tipo = TIPOS[(k * 3 + (k >> 2)) % 4];
  const frase = FRASES[(k * 5) % FRASES.length];
  const sil = 'rgba(255,255,255,0.28)';
  return (
    <div style={{position: 'relative', width: TILE.w, height: TILE.h, borderRadius: 14, overflow: 'hidden', background: `linear-gradient(160deg, hsl(${hue}, 46%, 58%) 0%, hsl(${(hue + 40) % 360}, 38%, 26%) 100%)`}}>
      {tipo === 'cara' ? (
        <>
          <div style={{position: 'absolute', left: 46, top: 62, width: 48, height: 48, borderRadius: 24, background: sil, transform: `translateY(${Math.sin(f / 8 + k) * 2}px)`}} />
          <div style={{position: 'absolute', left: 26, top: 116, width: 88, height: 80, borderRadius: '44px 44px 0 0', background: sil}} />
        </>
      ) : null}
      {tipo === 'juego' ? (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{position: 'absolute', left: -20 + i * 44, top: 40 + ((i * 37) % 60), width: 30, height: 150, borderRadius: 8, background: 'rgba(255,255,255,0.16)', transform: 'skewX(-14deg)'}} />
          ))}
          <div style={{position: 'absolute', left: 56, top: 124, width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.75)', transform: `rotate(${f * 6 + k * 20}deg)`}} />
        </>
      ) : null}
      {tipo === 'charla' ? (
        <>
          <div style={{position: 'absolute', left: 18, top: 78, width: 42, height: 42, borderRadius: 21, background: sil}} />
          <div style={{position: 'absolute', left: 80, top: 78, width: 42, height: 42, borderRadius: 21, background: sil}} />
          <div style={{position: 'absolute', left: 10, top: 126, width: 120, height: 60, borderRadius: '30px 30px 0 0', background: sil}} />
          <div style={{position: 'absolute', left: 64, top: 104, width: 12, height: 40, borderRadius: 6, background: 'rgba(17,16,14,0.45)'}} />
        </>
      ) : null}
      {tipo === 'texto' ? (
        <div style={{position: 'absolute', left: 12, right: 12, top: 70, ...DISPLAY, fontSize: 22, lineHeight: 1.08, color: C.blanco, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.35)'}}>{frase}</div>
      ) : null}
      {A.moviles.etiqueta ? (
        <div style={{position: 'absolute', left: 8, top: 8, fontFamily: TEXTO, fontWeight: 700, fontSize: 9, padding: '2px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.92)', color: C.tinta}}>{A.moviles.etiqueta}</div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55))'}} />
      {tipo !== 'texto' ? <div style={{position: 'absolute', left: 9, right: 9, bottom: 24, fontFamily: TEXTO, fontWeight: 700, fontSize: 13, lineHeight: 1.15, color: C.blanco}}>{frase}</div> : null}
      <div style={{position: 'absolute', left: 9, bottom: 8, fontFamily: TEXTO, fontSize: 10, color: 'rgba(255,255,255,0.85)'}}>{A.cuentas[k % A.cuentas.length]}</div>
    </div>
  );
};

const Feed: React.FC<{f: number}> = ({f}) => {
  const off = scrollFeed(f);
  const v = Math.abs(velFeed(f));
  const zoom = 1 + 1.05 * (1 - p(f, FEED - 2, 14, E.io));
  const r0 = Math.max(0, Math.floor(off / PASO) - 1);
  const filas = Array.from({length: 5}, (_, i) => r0 + i);
  const blur = Math.min(5, v * 0.05);
  const flash = f >= ASOMBRO ? 1 - p(f, ASOMBRO, 12) : 0;
  if (A.capturas.feed) {
    // The capture repeats downwards, so any height covers the whole scroll (about 3,600 px).
    const src = A.capturas.feed;
    return (
      <div style={{position: 'absolute', inset: 0, background: '#f3f0eb', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: -off, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
            {Array.from({length: 8}, (_, i) => (
              <Img key={i} src={staticFile(src)} style={{display: 'block', width: '100%'}} />
            ))}
          </div>
        </div>
        <Isla />
        <div style={{position: 'absolute', inset: 0, background: '#fffaf0', opacity: flash * 0.9, zIndex: 5}} />
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f3f0eb', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}>
        <div style={{position: 'absolute', left: 8, right: 8, top: 104, bottom: 0, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
          {filas.map((r) =>
            [0, 1].map((c) => {
              const k = r * 2 + c;
              const y = r * PASO - off + (c === 1 ? PASO * 0.42 : 0);
              if (y < -PASO * 1.5 || y > 760) {
                return null;
              }
              return (
                <div key={k} style={{position: 'absolute', left: c * (TILE.w + TILE.gap), top: y}}>
                  <Mosaico k={k} f={f} />
                </div>
              );
            }),
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 100, background: 'linear-gradient(180deg, #f3f0eb 70%, rgba(243,240,235,0))', zIndex: 2}}>
        <div style={{position: 'absolute', left: 18, right: 18, top: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{...DISPLAY, fontSize: 24, color: C.tinta}}>{A.feed.titulo}</span>
          <span style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 13, color: GRIS}}>{A.feed.pestanas}</span>
        </div>
      </div>
      <Estado oscuro />
      <Isla />
      <div style={{position: 'absolute', inset: 0, background: '#fffaf0', opacity: flash * 0.9, zIndex: 5}} />
    </div>
  );
};

/** After the flip: the result, one row per account. No amounts. */
const PAGADOS = [
  {h: A.cuentas[0], hue: 20},
  {h: A.cuentas[2], hue: 200},
  {h: A.cuentas[4], hue: 300},
];
/** The result screen fills in as soon as its front faces the camera again after the flip. */
const PAGO_UI = GIRO + 15;
const PantallaPago: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'relative', width: '100%', height: '100%', background: '#f1eee8', fontFamily: TEXTO}}>
    <Estado oscuro />
    <Isla />
    <div style={{position: 'absolute', left: 22, right: 22, top: 64}}>
      <div style={{fontSize: 13, fontWeight: 600, color: GRIS}}>
        {A.marca.nombre} · {A.resultado.seccion}
      </div>
      <div style={{...DISPLAY, fontSize: 29, color: C.tinta, marginTop: 4, lineHeight: 1.08}}>
        {A.resultado.titulo}
      </div>
    </div>
    <div style={{position: 'absolute', left: 152 - 52, top: 168, width: 104, height: 104, ...pumStyle(f, PAGO_UI + 1)}}>
      <div style={{width: 104, height: 104, borderRadius: 52, background: '#f6f3ee', boxShadow: '8px 8px 18px rgba(160,146,126,0.45), -8px -8px 18px rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={56} height={56} viewBox="0 0 24 24">
          <path d="M12 2.5 L20 5.5 V11.5 C20 16.2 16.6 20.1 12 21.5 C7.4 20.1 4 16.2 4 11.5 V5.5 Z" fill={C.tinta} />
          <path d="M8.2 12 L11 14.8 L16 9.2" fill="none" stroke={C.blanco} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={12} strokeDashoffset={12 * (1 - p(f, PAGO_UI + 4, 8))} />
        </svg>
      </div>
    </div>
    {PAGADOS.map((r, i) => {
      const a = PAGO_UI + 6 + i * 4;
      return (
        <div
          key={r.h}
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 300 + i * 74,
            height: 62,
            borderRadius: 18,
            background: '#f6f3ee',
            boxShadow: '5px 5px 12px rgba(160,146,126,0.38), -5px -5px 12px rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 12px',
            ...pumStyle(f, a, '50% 50%'),
          }}
        >
          <div style={{width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg, hsl(${r.hue}, 70%, 62%), hsl(${r.hue}, 55%, 36%))`, flexShrink: 0}} />
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 14, fontWeight: 700, color: C.tinta}}>{r.h}</div>
            <div style={{fontSize: 11, color: GRIS, marginTop: 2}}>{A.resultado.detalle}</div>
          </div>
          <div style={{...pumStyle(f, a + 8, '100% 50%')}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 999, background: C.tinta, color: C.blanco, fontSize: 11, fontWeight: 700}}>
              <Tick size={13} draw={p(f, a + 10, 6)} color={C.blanco} stroke={3.4} />
              {A.resultado.estado}
            </div>
          </div>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 22, right: 22, top: 566, height: 58, ...pumStyle(f, DINERO - 2)}}>
      <div style={{width: '100%', height: '100%', borderRadius: 999, background: C.tinta, color: C.blanco, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 17, fontWeight: 700, boxShadow: '0 10px 24px rgba(17,16,14,0.3)'}}>
        <Tick size={20} draw={p(f, DINERO + 2, 8)} color={C.blanco} stroke={3} />
        {A.resultado.boton}
      </div>
    </div>
  </div>
);

const PantallaHero: React.FC<{f: number; ry: number}> = ({f, ry}) => {
  if (giroT(f) > 0.5) {
    return A.capturas.resultado ? <Captura src={A.capturas.resultado} /> : <PantallaPago f={f} />;
  }
  const feed = p(f, FEED - 2, 8);
  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      {feed < 1 ? <PantallaMovil f={f} j={1} ui={p(f, LIFT + 22, 8)} ry={ry} /> : null}
      {feed > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: feed}}>
          <Feed f={f} />
        </div>
      ) : null}
    </div>
  );
};

/* Floating badges that pop out around the tilted phone while the feed races. */
type Insignia = InsigniaAjuste & {at: number; x: number; y: number; hue: number};
const INSIGNIAS: Insignia[] = [
  // One path for the eye: caption top left, then down the right side, then the wow in the middle.
  {...A.insignias[0], at: FEED + 22, x: 760, y: 880, hue: 30},
  {...A.insignias[1], at: FEED + 34, x: 780, y: 1150, hue: 90},
  {...A.insignias[2], at: FEED + 46, x: 770, y: 1420, hue: 150},
];

const Insignias: React.FC<{f: number}> = ({f}) => {
  if (f < FEED || f > GIRO + 14) return null;
  const x = p(f, GIRO - 2, 12, E.in);
  return (
    <>
      {INSIGNIAS.map((b, i) => {
        if (f < b.at - 1) return null;
        const dx = (b.x - 540) * 0.9 * x;
        const dy = (b.y - 1150) * 0.6 * x;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y + 8 * Math.sin(f / 18 + i * 1.7),
                transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
                opacity: 1 - x,
                filter: x > 0.05 ? `blur(${x * 10}px)` : undefined,
              }}
            >
              <div style={pumStyle(f, b.at)}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px 16px 16px', borderRadius: 30, background: 'rgba(246,243,238,0.96)', boxShadow: '14px 14px 34px rgba(150,130,105,0.38), -10px -10px 26px rgba(255,255,255,0.9)', whiteSpace: 'nowrap'}}>
                  {b.icono === 'avatar' ? (
                    <div style={{width: 54, height: 54, borderRadius: 27, background: `linear-gradient(135deg, hsl(${b.hue}, 70%, 62%), hsl(${b.hue}, 55%, 34%))`, flexShrink: 0}} />
                  ) : b.icono === 'sigla' ? (
                    <div style={{width: 54, height: 54, borderRadius: 16, background: C.blanco, boxShadow: 'inset 0 0 0 2px rgba(17,16,14,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TEXTO, fontWeight: 800, fontSize: 13, color: C.tinta, flexShrink: 0}}>
                      {b.sigla}
                    </div>
                  ) : (
                    <div style={{width: 54, height: 54, borderRadius: 27, background: C.tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                      <Tick size={30} draw={p(f, b.at + 4, 8)} color={C.blanco} stroke={3.2} />
                    </div>
                  )}
                  <div>
                    <div style={{fontFamily: TEXTO, fontWeight: 700, fontSize: 27, letterSpacing: '-0.02em', color: C.tinta}}>{b.titulo}</div>
                    <div style={{fontFamily: TEXTO, fontSize: 20, color: GRIS, marginTop: 2}}>{b.sub}</div>
                  </div>
                </div>
              </div>
            </div>
            <Destello f={f} at={b.at} x={b.x} y={b.y} r={120} seed={i} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const Moviles: React.FC<{f: number}> = ({f}) => {
  if (f < LIFT + 6 || f > REV + 4) {
    return null;
  }
  return (
    <>
      {[0, 2, 1].map((j) => {
        const pose = movilPose(j, f);
        if (!pose || pose.o <= 0.002) {
          return null;
        }
        const q = quadDe(pose, MOVIL.pantalla.w, MOVIL.pantalla.h, MOVIL.frente);
        // Seen from behind (the flip) the screen is hidden; edge-on it fades so the homography never explodes.
        const ref = MOVIL.pantalla.w * MOVIL.pantalla.h * pose.s * pose.s * 0.5;
        const cara = c01((area(q) / ref - 0.03) / 0.12);
        if (cara <= 0) {
          return null;
        }
        return (
          <Mapped key={j} quad={q} w={MOVIL.pantalla.w} h={MOVIL.pantalla.h} radius={46} opacity={pose.o * cara}>
            {j === 1 ? <PantallaHero f={f} ry={pose.ry} /> : <PantallaMovil f={f} j={j} ui={p(f, LIFT + j * 4 + 18, 8)} ry={pose.ry} />}
          </Mapped>
        );
      })}
      <Destello f={f} at={ASOMBRO} x={540} y={1150} r={420} seed={5} />
      <Destello f={f} at={DINERO} x={540} y={1250} r={260} seed={7} />
    </>
  );
};

/** The canvas where the 3D laptop and phones are drawn, one render per frame. */
const Mundo3D: React.FC<{f: number}> = ({f}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mundo = useRef<Mundo | null>(null);
  const [listo, setListo] = useState(false);
  const [boot] = useState(() => delayRender('mundo 3D'));
  // The boot hold is released only after the first frame is drawn: releasing it on creation left a
  // gap before the first draw, and a tab's first screenshot could catch the canvas empty.
  const arrancado = useRef(false);
  useEffect(() => {
    if (canvas.current && !mundo.current) {
      mundo.current = new Mundo(canvas.current);
      setListo(true);
    }
    // Mounted only while its scenes run (see the tree): give the GPU memory back when it leaves.
    return () => {
      mundo.current?.r.dispose();
      mundo.current?.r.forceContextLoss();
      mundo.current = null;
    };
  }, [boot]);
  useLayoutEffect(() => {
    if (!listo || !mundo.current) {
      return;
    }
    const h = delayRender('dibujar 3D');
    mundo.current.render(
      lapEstado(f),
      [0, 1, 2].map((j) => movilPose(j, f)),
    );
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        continueRender(h);
        if (!arrancado.current) {
          arrancado.current = true;
          continueRender(boot);
        }
      }),
    );
  }, [f, listo, boot]);
  // Fades as a whole picture (the canvas), never mesh by mesh, so insides never show through.
  const o = f < LIFT ? p(f, LAP_IN + 1, 5) : 1 - p(f, REV, 3);
  return <canvas ref={canvas} style={{position: 'absolute', left: -MARGEN.l, top: -MARGEN.t, width: CW, height: CH, opacity: o}} />;
};

/*
 * The payout: ten big coins come out of the phone one after another, going round it clockwise
 * (the eye follows the round), and float around it like a product shot. Those behind the phone
 * are drawn in a canvas under the 3D world, so the phone hides them; those in front never cross
 * its screen. They drop out of frame with the phone. Projection centre: (540, 960), D = 2400.
 */
type Hueco = {x: number; y: number; z: number; s: number; delante: boolean};
const HALO: Hueco[] = [
  {x: 770, y: 700, z: -120, s: 0.95, delante: false},
  {x: 900, y: 1000, z: 300, s: 1.35, delante: true},
  {x: 780, y: 1460, z: -90, s: 0.95, delante: false},
  {x: 900, y: 1560, z: 240, s: 1.25, delante: true},
  {x: 660, y: 1700, z: 360, s: 1.45, delante: true},
  {x: 400, y: 1650, z: 300, s: 1.3, delante: true},
  {x: 175, y: 1450, z: 330, s: 1.45, delante: true},
  {x: 195, y: 930, z: 280, s: 1.3, delante: true},
  {x: 315, y: 720, z: -100, s: 0.95, delante: false},
  {x: 545, y: 655, z: -170, s: 0.85, delante: false},
];
const MOVIL_C = {x: 540, y: 1105, z: 120};
const monedaPose = (i: number, f: number): Pose | null => {
  const h = HALO[i];
  if (!h) return null;
  const t0 = DINERO + Math.round(i * 1.5);
  if (f < t0) return null;
  const a = sp(f, t0, 13, 120, 0.8);
  const ac = c01(a);
  // Behind: from the phone's centre, hidden by it. In front: from the nearest point of its edge.
  const desde = h.delante
    ? {x: Math.min(720, Math.max(360, h.x)), y: Math.min(1500, Math.max(700, h.y)), z: MOVIL_C.z + 20}
    : {x: MOVIL_C.x, y: MOVIL_C.y, z: h.z};
  const vida = f - t0;
  const flota = 9 * Math.sin(vida / 15 + i * 1.3);
  const cae = p(f, SALIDA + (i % 4), 13, E.in);
  return {
    x: mix(desde.x, h.x, a) + cae * (h.x - 540) * 0.25,
    y: mix(desde.y, h.y, a) - 70 * Math.sin(Math.PI * Math.min(1, ac)) * (1 - ac) + flota * ac + cae * (1500 + 120 * (i % 3)),
    z: mix(desde.z, h.z, a),
    // The coin mesh faces the camera at rx 0: tilt it a little so the face catches the light,
    // and let a fast spin about the vertical settle into a slow sway; it shows the symbol's face (ajustes.moneda).
    rx: 16 + 9 * Math.sin(vida / 22 + i),
    ry: (1 - ac) * 540 + 26 * Math.sin(vida / 19 + i * 0.7) + 220 * cae,
    rz: 10 * Math.sin(vida / 27 + i),
    s: h.s * 1.22 * (0.3 + 0.7 * a),
    o: 1,
  };
};
const billetePose = (): Pose | null => null;

const Lluvia3D: React.FC<{f: number; delante: boolean}> = ({f, delante}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dinero = useRef<Dinero | null>(null);
  const [listo, setListo] = useState(false);
  const [boot] = useState(() => delayRender('dinero 3D'));
  const arrancado = useRef(false); // released after the first draw, as in Mundo3D
  useEffect(() => {
    if (canvas.current && !dinero.current) {
      dinero.current = new Dinero(canvas.current, A.moneda);
      setListo(true);
    }
    return () => {
      dinero.current?.r.dispose();
      dinero.current?.r.forceContextLoss();
      dinero.current = null;
    };
  }, [boot]);
  const activo = f >= DINERO - 1 && f <= REV + 4;
  useLayoutEffect(() => {
    if (!listo || !dinero.current) {
      return;
    }
    const h = delayRender('dibujar dinero');
    dinero.current.render(
      Array.from({length: MONEDAS}, (_, i) => (activo && HALO[i] && HALO[i].delante === delante ? monedaPose(i, f) : null)),
      Array.from({length: BILLETES}, () => billetePose()),
    );
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        continueRender(h);
        if (!arrancado.current) {
          arrancado.current = true;
          continueRender(boot);
        }
      }),
    );
  }, [f, listo, activo, delante, boot]);
  return <canvas ref={canvas} style={{position: 'absolute', left: -MARGEN.l, top: -MARGEN.t, width: CW, height: CH, opacity: 1 - p(f, REV + 1, 3)}} />;
};

/* ---------- 6. review ---------- */

const FILAS_REV = SEGS.map((s, j) => ({h: A.cuentas[j], c: `${A.editor.pieza} 0${j + 1}`, t: `${s.tc} · ${s.d}`, ok: j !== 1}));

const Revision: React.FC<{f: number}> = ({f}) => {
  if (f < REV - 2 || f > CTA0 + 4) return null;
  const m = pum(f, REV);
  const back = p(f, INF, 16, E.io);
  const spin = (f * 14) % 360;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 2000, perspectiveOrigin: '50% 40%'}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1110,
          width: 860,
          borderRadius: 40,
          background: NEU.alto,
          boxShadow: NEU.sombra,
          padding: '34px 38px 22px',
          opacity: (m.on ? m.o : 0) * (1 - back),
          filter: back > 0.01 || m.blur > 0.4 ? `blur(${Math.max(back * 6, m.blur)}px)` : undefined,
          transform: `translate(-50%, -50%) translateY(${-back * 260}px) translateZ(${-back * 320}px) scale(${0.35 + 0.65 * m.s}) rotateX(${4 - back * 2}deg) rotateY(${-3 + 1.5 * Math.sin(f / 40)}deg)`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1.5px solid rgba(17,16,14,0.08)'}}>
          <div style={{...DISPLAY, fontSize: 40, color: C.tinta}}>{A.revision.titulo}</div>
          <Pastilla size={18}>{A.revision.plazo}</Pastilla>
        </div>
        {FILAS_REV.map((r, j) => {
          const d = p(f, R[j], 8, E.snap);
          const abre = r.ok ? 0 : p(f, R[j] + 4, 12, E.io);
          return (
            <div key={j} style={{borderBottom: j < 2 ? '1.5px solid rgba(17,16,14,0.07)' : 'none', padding: '16px 0'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                <div style={{position: 'relative', width: 60, height: 106, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '6px 6px 14px rgba(160,146,126,0.45), -5px -5px 12px rgba(255,255,255,0.9)'}}>
                  <Escena f={f} vertical seed={j} />
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontFamily: TEXTO, fontSize: 29, fontWeight: 700, letterSpacing: '-0.02em', color: C.tinta}}>{r.h}</div>
                  <div style={{fontFamily: TEXTO, fontSize: 20, color: GRIS, marginTop: 4}}>
                    {r.c} · {r.t}
                  </div>
                </div>
                <div style={{position: 'relative', width: 240, height: 54}}>
                  <div style={{position: 'absolute', right: 0, top: 0, opacity: 1 - d}}>
                    <Pastilla size={19}>
                      <svg width={22} height={22} viewBox="0 0 24 24" style={{transform: `rotate(${spin}deg)`}}>
                        <circle cx={12} cy={12} r={9} fill="none" stroke="rgba(17,16,14,0.12)" strokeWidth={3} />
                        <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={C.tinta} strokeWidth={3} strokeLinecap="round" />
                      </svg>
                      {A.revision.enCurso}
                    </Pastilla>
                  </div>
                  {f >= R[j] - 1 ? (
                    <div style={{position: 'absolute', right: 0, top: 0, ...pumStyle(f, R[j], '100% 50%')}}>
                      <Pastilla tone={r.ok ? 'tinta' : 'error'} size={19}>
                        {r.ok ? <Tick size={22} draw={d} color={C.blanco} /> : <Cruz size={22} draw={d} />}
                        {r.ok ? A.revision.aprobado : A.revision.rechazado}
                      </Pastilla>
                    </div>
                  ) : null}
                </div>
              </div>
              {r.ok ? null : (
                <div style={{height: 108 * abre, overflow: 'hidden'}}>
                  <div style={{marginTop: 14, marginLeft: 80, padding: '14px 20px', borderRadius: 18, background: NEU.fondo, boxShadow: NEU.hundido}}>
                    <div style={{fontFamily: TEXTO, fontSize: 24, color: C.tinta}}>
                      <b>{A.revision.motivo.etiqueta}</b> {A.revision.motivo.texto}
                    </div>
                    <div style={{fontFamily: TEXTO, fontSize: 19, color: GRIS, marginTop: 6}}>{A.revision.apelacion}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Destello f={f} at={REV} x={540} y={1110} r={340} seed={2} />
    </div>
  );
};

/* ---------- 7. the report ---------- */

/** Five fixed columns and the highlighted one, which gets its own well: 100 + 148 + 112 + 124 + 132 + 224 = 840, the card's inner width. */
const COLS = '100px 148px 112px 124px 132px 224px';
const COL_V = {left: 616, w: 224};
const INF_FILA = {cab: 52, h: 74};
const FILAS_INF = A.informe.filas.map((r) => ({c: r.pieza, pl: r.canal, pub: r.a, corte: r.b, fin: r.c, v: r.valor, ok: r.ok}));

const Informe: React.FC<{f: number}> = ({f}) => {
  if (f < INF - 2 || f > CTA0 + 6) return null;
  const e = sp(f, INF + 4, 16, 120, 1);
  const col = p(f, V.destacada - 4, 14, E.io);
  const exc = p(f, V.destacada + 14, 10);
  const fuera = p(f, CTA0 - 10, 10, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 2000, opacity: 1 - fuera, transform: `translateY(${fuera * 200}px)`}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1130,
          width: 920,
          borderRadius: 38,
          background: NEU.alto,
          boxShadow: NEU.sombra,
          padding: '34px 40px 28px',
          opacity: c01(e * 1.4),
          transform: `translate(-50%, -50%) translateY(${(1 - e) * 800}px) translateZ(40px) rotateX(${3 + (1 - e) * 30}deg) rotateY(${-2 + 1.5 * Math.sin(f / 44)}deg)`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 18, borderBottom: '1.5px solid rgba(17,16,14,0.08)'}}>
          <div>
            <div style={{...DISPLAY, fontSize: 38, color: C.tinta}}>{A.informe.titulo}</div>
            <div style={{fontFamily: TEXTO, fontSize: 19, color: GRIS, marginTop: 6}}>{A.informe.subtitulo}</div>
          </div>
          {f >= INF + 21 ? (
            <div style={{transform: 'rotate(-6deg)'}}>
              <div style={pumStyle(f, INF + 22)}>
                <div style={{fontFamily: TEXTO, fontWeight: 700, fontSize: 21, color: C.tinta, border: `3px solid ${C.tinta}`, borderRadius: 12, padding: '5px 14px'}}>
                  {A.informe.sello}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div style={{position: 'relative', marginTop: 14}}>
          <div style={{position: 'relative', display: 'grid', gridTemplateColumns: COLS, fontFamily: TEXTO, fontWeight: 600, fontSize: 16, color: GRIS, height: INF_FILA.cab, alignItems: 'center', lineHeight: 1.15}}>
            {A.informe.columnas.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
            <span />
          </div>
          {FILAS_INF.map((r, j) => (
            <div
              key={j}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: COLS,
                fontFamily: TEXTO,
                fontSize: 26,
                letterSpacing: '-0.01em',
                color: C.tinta,
                height: 74,
                alignItems: 'center',
                borderTop: '1.5px solid rgba(17,16,14,0.07)',
                background: !r.ok ? `rgba(163,29,11,${0.06 * exc})` : 'transparent',
              }}
            >
              <span style={{fontWeight: 700}}>{r.c}</span>
              <span>{r.pl}</span>
              <span style={{color: r.ok ? C.tinta : C.papelLinea}}>{r.pub}</span>
              <span style={{color: r.ok ? C.tinta : C.papelLinea}}>{r.corte}</span>
              <span style={{color: r.ok ? C.tinta : C.papelLinea}}>{r.fin}</span>
              <span />
            </div>
          ))}
          {/* The highlighted column: a sunken well laid exactly on its track, drawn over the row lines, with the values centred on top. */}
          <div
            style={{
              position: 'absolute',
              left: COL_V.left,
              width: COL_V.w,
              top: -8,
              // Rows are content-box: 74 px plus a 1.5 px top line each.
              height: (INF_FILA.cab + FILAS_INF.length * (INF_FILA.h + 1.5) + 16) * col,
              borderRadius: 18,
              background: NEU.fondo,
              boxShadow: NEU.hundido,
              opacity: c01(col * 3),
            }}
          />
          <div style={{position: 'absolute', left: COL_V.left, width: COL_V.w, top: 0, textAlign: 'center', fontFamily: TEXTO, fontWeight: 600}}>
            <div style={{height: INF_FILA.cab, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, lineHeight: 1.15, color: col > 0.2 ? C.tinta : GRIS}}>
              {A.informe.destacada}
            </div>
            {FILAS_INF.map((r, j) => (
              <div key={j} style={{position: 'relative', height: INF_FILA.h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: r.ok ? GRIS : C.error, borderTop: '1.5px solid transparent'}}>
                {r.ok ? null : <div style={{position: 'absolute', left: 10, right: 10, top: 8, bottom: 8, borderRadius: 12, background: `rgba(163,29,11,${0.08 * exc})`}} />}
                <span style={{position: 'relative'}}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{height: 46 * exc, overflow: 'hidden', fontFamily: TEXTO, fontWeight: 600, fontSize: 18, color: C.error, display: 'flex', alignItems: 'center'}}>
            {A.informe.nota}
          </div>
        </div>
      </div>
      <Destello f={f} at={INF + 22} x={872} y={810} r={110} seed={4} />
    </div>
  );
};

/* ---------- 8. the web's form ---------- */

const OPCIONES = A.formulario.opciones;
const BOTON_AT = CTA0 + 16;

const Formulario: React.FC<{f: number}> = ({f}) => {
  if (f < BOTON_AT - 2 || f > PLANE + 10) return null;
  const e = pum(f, BOTON_AT);
  const hover = p(f, CTA.press - 8, 6) * (1 - p(f, CTA.morph, 4));
  const press = f >= CTA.press - 2 && f <= CTA.press + 2 ? 1 : 0;
  const m = sp(f, CTA.morph, 18, 140, 1);
  const mc = c01(m);
  const fold = p(f, PLANE, 7, E.in);
  const w = mix(620, 860, m); // room for a short call to action (ajustes.formulario.boton)
  const h = mix(124, 900, m);
  const chip = p(f, CTA.chip, 6, E.snap);
  const chipHover = f >= CTA.chip - 9 && f < CTA.chip ? p(f, CTA.chip - 9, 4) : 0;
  const focus = p(f, CTA.field, 5);
  const typed = TECLAS.filter((k) => f >= k).length;
  const lastKey = typed > 0 ? TECLAS[typed - 1] : -99;
  const caret = focus > 0 && (f - lastKey < 8 || Math.floor((f - CTA.field) / 9) % 2 === 0);
  const sendHover = p(f, CTA.send - 8, 6);
  const sendPress = f >= CTA.send - 2 && f <= CTA.send + 2 ? 1 : 0;
  // The button becomes the form in layers, never two at once: its words leave, then its dark fill
  // fades into the light card, then the form comes in.
  const textoFuera = p(f, CTA.morph - 1, 4, E.in);
  const oscuro = 1 - p(f, CTA.morph + 1, 6, E.io);
  const formDentro = p(f, CTA.morph + 5, 6, E.out);
  // The dark button's drop shadow fades into NEU.sombra (same values, alphas scaled).
  const sombra = `0 24px 50px rgba(17,16,14,${(0.3 + 0.1 * hover) * oscuro}), 22px 22px 50px rgba(160,146,126,${0.42 * (1 - oscuro)}), -18px -18px 44px rgba(255,255,255,${0.95 * (1 - oscuro)})`;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 2000}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: mix(1060, 1080, mc),
          width: w,
          height: h,
          borderRadius: mix(62, 40, mc),
          background: oscuro >= 1 ? C.tinta : NEU.alto,
          boxShadow: sombra,
          transform: `translate(-50%, -50%) scale(${(0.35 + 0.65 * e.s) * (1 + 0.04 * hover - 0.06 * press) * (1 - 0.85 * fold)}) rotateX(${fold * 55}deg) rotateZ(${fold * -14}deg)`,
          opacity: (e.on ? e.o : 0) * (1 - p(f, PLANE + 4, 4)),
          filter: e.blur > 0.4 ? `blur(${e.blur}px)` : undefined,
          overflow: 'hidden',
        }}
      >
        {oscuro > 0 && oscuro < 1 ? <div style={{position: 'absolute', inset: 0, background: C.tinta, opacity: oscuro}} /> : null}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: 1 - textoFuera}}>
          <span style={{...DISPLAY, fontSize: 52, color: C.blanco, whiteSpace: 'nowrap'}}>{A.formulario.boton}</span>
          <svg width={44} height={44} viewBox="0 0 24 24">
            <path d="M5 12 H19 M13 6 L19 12 L13 18" fill="none" stroke={C.blanco} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: formDentro, padding: '52px 56px'}}>
          <div>
            <div style={{fontFamily: TEXTO, fontWeight: 600, fontSize: 22, color: GRIS}}>{A.formulario.antetitulo}</div>
            <div style={{...DISPLAY, fontSize: 74, color: C.tinta, marginTop: 6}}>{A.formulario.titulo}</div>
            <div style={{fontFamily: TEXTO, fontSize: 29, fontWeight: 700, letterSpacing: '-0.015em', color: C.tinta, marginTop: 36}}>
              {A.formulario.pregunta}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 18}}>
              {OPCIONES.map((o) => {
                const on = o === OPCIONES[0] ? chip : 0;
                const hv = o === OPCIONES[0] ? chipHover : 0;
                return (
                  <div
                    key={o}
                    style={{
                      fontFamily: TEXTO,
                      fontSize: 26,
                      fontWeight: 600,
                      padding: '14px 24px',
                      borderRadius: 999,
                      background: on > 0 ? C.tinta : NEU.alto,
                      boxShadow: on > 0 ? '0 10px 24px rgba(17,16,14,0.28)' : hv > 0 ? NEU.hundido : NEU.sombraS,
                      color: on > 0 ? C.blanco : C.tinta,
                      transform: `scale(${1 + 0.08 * Math.sin(Math.PI * on) + 0.03 * hv})`,
                    }}
                  >
                    {o}
                  </div>
                );
              })}
            </div>
            <div style={{fontFamily: TEXTO, fontSize: 29, fontWeight: 700, letterSpacing: '-0.015em', color: C.tinta, marginTop: 36}}>
              {A.formulario.campo}
            </div>
            <div
              style={{
                position: 'relative',
                marginTop: 14,
                height: 78,
                borderRadius: 18,
                boxShadow: `${NEU.hundido}, 0 0 0 ${5 * focus}px rgba(17,16,14,0.12)`,
                background: NEU.fondo,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px 0 78px',
                fontFamily: TEXTO,
                fontSize: 30,
                color: C.tinta,
              }}
            >
              <div style={{position: 'absolute', left: 24, top: 21}}>
                <Sobre size={36} color={focus > 0.5 ? C.tinta : '#a29d92'} />
              </div>
              {typed === 0 ? <span style={{position: 'absolute', left: 81, color: '#a29d92'}}>{A.formulario.ejemplo}</span> : null}
              <Tecleado f={f} text={CORREO} keys={TECLAS} />
              <Caret on={caret} h={36} />
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 56,
              right: 56,
              // Placed from the top of the full-size card, so while the card grows it is clipped below
              // instead of riding up over the e-mail field.
              top: 900 - 52 - 100,
              height: 100,
              borderRadius: 999,
              background: C.tinta,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${1 + 0.03 * sendHover - 0.05 * sendPress})`,
              boxShadow: `0 ${14 + 8 * sendHover}px ${30 + 10 * sendHover}px rgba(17,16,14,0.3)`,
            }}
          >
            <span style={{...DISPLAY, fontSize: 40, color: C.blanco}}>{A.formulario.enviar}</span>
          </div>
        </div>
      </div>
      <Destello f={f} at={BOTON_AT} x={540} y={1060} r={220} seed={6} />
    </div>
  );
};

const bez = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

const Avion: React.FC<{f: number}> = ({f}) => {
  if (f < PLANE + 2 || f > PLANE + 40) return null;
  const t = p(f, PLANE + 3, 20, E.io);
  const appear = p(f, PLANE + 2, 5);
  const P = {x: [540, 260, 1240], y: [1080, 700, 160]};
  const x = bez(t, P.x[0], P.x[1], P.x[2]);
  const y = bez(t, P.y[0], P.y[1], P.y[2]);
  const t2 = Math.min(1, t + 0.02);
  const ang = (Math.atan2(bez(t2, P.y[0], P.y[1], P.y[2]) - y, bez(t2, P.x[0], P.x[1], P.x[2]) - x) * 180) / Math.PI;
  const pts = Array.from({length: 24}, (_, j) => {
    const s = (t * j) / 23;
    return `${bez(s, P.x[0], P.x[1], P.x[2]).toFixed(1)},${bez(s, P.y[0], P.y[1], P.y[2]).toFixed(1)}`;
  }).join(' ');
  const size = 150 * (1 - 0.35 * t);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.3 * (1 - p(f, PLANE + 24, 12))}}>
        <polyline points={pts} fill="none" stroke={C.tinta} strokeWidth={4} strokeDasharray="14 14" strokeLinecap="round" />
      </svg>
      <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `rotate(${ang + 45}deg) scale(${appear})`, filter: 'drop-shadow(0 18px 24px rgba(40,25,10,0.3))'}}>
        <path d="M22 2 L2 10.5 L9.5 13 Z" fill="#ffffff" />
        <path d="M22 2 L9.5 13 L12 21 Z" fill="#e6e1d8" />
        <path d="M9.5 13 L12 21 L13.4 15.2 Z" fill="#c9c3b8" />
      </svg>
    </AbsoluteFill>
  );
};

/** A plain envelope: the mail icon everyone knows, no brand. */
const Sobre: React.FC<{size: number; color: string; fondo?: string}> = ({size, color, fondo = 'none'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x={3} y={5.5} width={18} height={13} rx={2.4} fill={fondo} stroke={color} strokeWidth={1.9} />
    <path d="M4 7.2 L12 13 L20 7.2" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Aviso: React.FC<{f: number}> = ({f}) => {
  if (f < TOAST - 2 || f > FIN + 10) return null;
  const x = sale(f, FIN - 8, 12);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 980, opacity: 1 - x, transform: `translateY(${-x * 140}px)`, filter: x > 0 ? `blur(${x * 8}px)` : undefined}}>
      <div style={{borderRadius: 34, ...VIDRIO_OSCURO, padding: '36px 40px', display: 'flex', gap: 28, alignItems: 'center', ...pumStyle(f, TOAST)}}>
        <div style={{position: 'relative', width: 84, height: 84, borderRadius: 42, background: C.blanco, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Sobre size={50} color={C.tinta} />
          <div style={{position: 'absolute', right: -8, top: -8, width: 36, height: 36, borderRadius: 18, background: VERDE, boxShadow: '0 0 0 4px rgba(30,28,25,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...pumStyle(f, TOAST + 6)}}>
            <Tick size={22} draw={p(f, TOAST + 8, 8)} color={C.blanco} stroke={3.6} />
          </div>
        </div>
        <div>
          <div style={{...DISPLAY, fontSize: 40, color: C.papel}}>{A.aviso.titulo}</div>
          <div style={{fontFamily: TEXTO, fontSize: 28, color: C.grisSala, marginTop: 8, lineHeight: 1.3}}>
            {A.aviso.texto}
          </div>
        </div>
      </div>
    </div>
  );
};

const Final: React.FC<{f: number}> = ({f}) => {
  if (f < FIN - 6) return null;
  return <Lockup f={f} at={FIN - 4} lema={A.marca.lemaFinal} glifoAt={FIN + 6} />;
};

/* ---------- sound: every effect on the frame of the thing that makes it ---------- */

const SFX: Record<string, {vol: number; desfase: number}> = {
  'ui-click': {vol: 0.4, desfase: -3},
  slice: {vol: 0.3, desfase: -4},
  'card-in': {vol: 0.2, desfase: -8},
  zoom: {vol: 0.24, desfase: -12},
  pop: {vol: 0.26, desfase: 0},
  success: {vol: 0.3, desfase: 0},
  'paper-plane': {vol: 0.34, desfase: -13},
  'logo-hit': {vol: 0.48, desfase: 0},
  transicion: {vol: 0.22, desfase: -9},
  publicado: {vol: 0.24, desfase: 0},
  enviar: {vol: 0.34, desfase: 0},
  rechazo: {vol: 0.3, desfase: 0},
  sello: {vol: 0.42, desfase: -1},
  soltar: {vol: 0.32, desfase: 0},
  magia: {vol: 0.16, desfase: -2},
  monedas: {vol: 0.38, desfase: -1},
  giro: {vol: 0.34, desfase: -4},
  scroll: {vol: 0.3, desfase: 0},
  asombro: {vol: 0.5, desfase: 0},
  ...Object.fromEntries(Array.from({length: 8}, (_, i) => [`tecla${i}`, {vol: 0.3, desfase: 0}])),
};

type Cue = {f: number; k: string; v?: number};
const teclas = (ks: number[], seed: number, vol: number): Cue[] => ks.map((f, i) => ({f, k: `tecla${(i * 3 + seed) % 8}`, v: vol + 0.06 * Math.sin(i * 2.3 + seed)}));
const CUES: Cue[] = [
  {f: 0, k: 'card-in', v: 0.18},
  {f: ADJ, k: 'soltar'},
  {f: ADJ + 1, k: 'pop', v: 0.2},
  ...teclas(MSG_KEYS, 2, 0.22),
  {f: SEND, k: 'tecla1', v: 0.34},
  {f: SEND + 1, k: 'enviar'},
  {f: DOTS, k: 'pop', v: 0.14},
  {f: REPLY, k: 'publicado', v: 0.28},
  {f: REPLY, k: 'magia', v: 0.2},
  {f: FLY + 2, k: 'card-in', v: 0.2},
  {f: CUT, k: 'slice'},
  {f: MARCA_AT, k: 'logo-hit'},
  {f: MARCA_AT + 1, k: 'magia', v: 0.18},
  {f: CAPAS[1].from, k: 'transicion'},
  {f: LAP_IN + 4, k: 'card-in'},
  {f: V.recibido, k: 'pop', v: 0.22},
  ...[0, 1, 2, 3, 4].map((j) => ({f: ROW0 + j * ROW_GAP, k: 'pop', v: 0.2})),
  {f: STAMP, k: 'sello'},
  {f: EDIT - 6, k: 'card-in', v: 0.16},
  ...[0, 1, 2].map((j) => ({f: cutAt(j), k: 'slice', v: 0.16})),
  {f: LIFT, k: 'zoom'},
  ...[0, 1, 2].map((j) => ({f: LIFT + 10 + j * 3, k: 'pop', v: 0.2})),
  ...POSTED.map((f) => ({f, k: 'publicado'})),
  ...[0, 1, 2].map((j) => ({f: PH_IN + 30 + j * 4, k: 'pop', v: 0.18})),
  {f: CAPAS[2].from, k: 'transicion', v: 0.2},
  {f: HERO, k: 'zoom', v: 0.22},
  {f: FEED, k: 'scroll'},
  ...INSIGNIAS.map((b, i) => ({f: b.at, k: 'pop', v: 0.2 - i * 0.01})),
  ...INSIGNIAS.filter((_, i) => i % 2 === 0).map((b) => ({f: b.at, k: 'magia', v: 0.1})),
  {f: ASOMBRO, k: 'asombro'},
  {f: ASOMBRO, k: 'magia', v: 0.22},
  {f: GIRO, k: 'giro'},
  {f: PAGO_UI + 1, k: 'pop', v: 0.22},
  ...PAGADOS.map((_, i) => ({f: PAGO_UI + 6 + i * 4, k: 'pop', v: 0.16})),
  {f: DINERO - 2, k: 'success', v: 0.24},
  {f: DINERO, k: 'monedas'},
  {f: DINERO + 1, k: 'magia', v: 0.16},
  {f: SALIDA + 8, k: 'zoom', v: 0.18},
  {f: CAPAS[3].from, k: 'transicion'},
  {f: REV, k: 'card-in'},
  {f: REV, k: 'magia', v: 0.14},
  {f: R[0], k: 'success', v: 0.24},
  {f: R[1], k: 'rechazo'},
  {f: R[1] + 5, k: 'card-in', v: 0.14},
  {f: R[2], k: 'success', v: 0.2},
  {f: CAPAS[4].from, k: 'transicion', v: 0.18},
  {f: INF + 6, k: 'card-in'},
  {f: INF + 22, k: 'sello', v: 0.3},
  {f: V.destacada - 4, k: 'pop', v: 0.22},
  {f: V.destacada + 14, k: 'pop', v: 0.16},
  {f: CAPAS[5].from, k: 'transicion', v: 0.2},
  {f: BOTON_AT, k: 'pop'},
  {f: BOTON_AT, k: 'magia', v: 0.12},
  {f: CTA.press, k: 'ui-click'},
  {f: CTA.morph, k: 'card-in'},
  {f: CTA.chip, k: 'ui-click'},
  {f: CTA.field, k: 'ui-click', v: 0.3},
  ...teclas(TECLAS, 5, 0.28),
  {f: CTA.send, k: 'ui-click'},
  {f: PLANE, k: 'paper-plane'},
  {f: TOAST + 4, k: 'success'},
  {f: FIN - 4, k: 'magia', v: 0.18},
  {f: FIN, k: 'logo-hit'},
  {f: FIN + 12, k: 'pop', v: 0.16},
  {f: FIN + 18, k: 'pop', v: 0.14},
];

/*
 * Music (ajustes.sonido.musica, levelled by nivelar_musica.py): no voice, so it plays at one level
 * from frame 0, builds under the racing feed, opens on the wow and lands on the closing brand.
 */
const musicaVol = (fr: number) => p(fr, 0, 4) * (1 - p(fr, FRAMES - 5, 4));
const Musica: React.FC = () =>
  A.sonido.musica ? (
    <Sequence from={0} layout="none" name="música">
      <Html5Audio src={staticFile(A.sonido.musica)} volume={musicaVol} />
    </Sequence>
  ) : null;

const Efectos: React.FC = () => {
  const carpeta = A.sonido.efectos;
  if (!carpeta) return null;
  return (
  <>
    {CUES.map((c, i) => {
      const fx = SFX[c.k];
      if (!fx) return null;
      return (
        <Sequence key={i} from={Math.max(0, c.f + fx.desfase)} layout="none">
          <Html5Audio src={staticFile(`${carpeta}/${c.k}.wav`)} volume={c.v ?? fx.vol} />
        </Sequence>
      );
    })}
  </>
  );
};

/*
 * Every caption, where its object is. The chat has none: the message being typed is the text.
 * Laptop: above its lid, rising from behind it, then rolling to the next line in the same place.
 * Phones: under them. Hero: top left, out of the phone. Result: above the phone, once the coins
 * have landed. Review: under the card, its grey line on the rejection. Report: above the card.
 * All of them inside the safe zone (ZONA): one line where a second would reach the covered strip.
 */
const RT = A.rotulos;
// The open lid's top edge, world px: the screen's top edge at rest plus the bezel above it.
const TAPA = (() => {
  const l = lapEstado(ROW0);
  const q = l ? quadPantalla(l) : null;
  return q ? Math.min(q[0][1], q[1][1]) - ((LAPTOP.h - LAPTOP.pantalla.h) / 2) * LAP_S : 868;
})();
const Rotulos: React.FC<{f: number}> = ({f}) => (
  <>
    {/* Relay in one place: the next caption starts only once the last one has sunk out (11 frames). */}
    <Rotulo f={f} at={LAP_IN + 26} out={ROW0 - 12} t={RT.recibe.t} sub={RT.recibe.sub} x={LAP.cx} y={TAPA - 70} entrada="detras" borde={70} size={74} />
    <Rotulo f={f} at={ROW0 + 1} out={EDIT - 8} t={RT.pasos.t} x={LAP.cx} y={TAPA - 70} size={74} />
    <Rotulo f={f} at={EDIT - 4} out={LIFT - 4} t={RT.trabajo.t} x={LAP.cx} y={TAPA - 70} size={74} />
    {/* Out before HERO: the hero phone tilts down over this line from HERO on. */}
    <Rotulo f={f} at={PH_IN - 4} out={HERO - 12} t={RT.llega.t} x={540} y={1520} ancla="arriba" w={1000} size={62} />
    <Rotulo f={f} at={HERO + 16} out={ASOMBRO - 6} t={RT.ritmo.t} x={96} y={740} align="left" w={600} entrada="lado" size={78} />
    <Rotulo f={f} at={DINERO + 12} out={REV - 5} t={RT.resultado.t} x={540} y={630} w={860} size={68} />
    <Rotulo f={f} at={REV + 6} out={INF - 8} t={RT.revision.t} sub={RT.revision.sub} subAt={R[1] + 2} x={540} y={1450} ancla="arriba" w={1000} size={60} />
    <Rotulo f={f} at={INF + 14} out={CTA0 - 12} t={RT.informe.t} x={540} y={862} entrada="detras" borde={18} size={74} />
  </>
);
// The closing question sits under the form: the card grows over it while its words slide out,
// so the question and the form's own title are never read on top of each other.
const Pregunta: React.FC<{f: number}> = ({f}) => (
  <Rotulo f={f} at={CTA0 + 2} out={CTA.morph} t={RT.pregunta.t} x={540} y={952} w={900} size={94} />
);

export const Plantilla: React.FC<Props> = (props) => {
  const f = useCurrentFrame();
  const cam = camara(f);
  return (
    <AbsoluteFill style={{background: NEU.fondo, overflow: 'hidden'}}>
      <Fondo f={f} cam={cam} />
      <Camara cam={cam}>
        {/* WebGL canvases exist only while their scene runs: three big ones all the time ran
            Chrome out of memory and left frames blank. */}
        {f >= DINERO - 2 && f <= REV + 6 ? <Lluvia3D f={f} delante={false} /> : null}
        {f >= LAP_IN - 2 && f <= REV + 6 ? <Mundo3D f={f} /> : null}
        <Chat f={f} />
        <Vuelo f={f} />
        <MarcaInicio f={f} />
        <Portatil f={f} />
        <Piezas3D f={f} />
        <Moviles f={f} />
        <Insignias f={f} />
        {f >= DINERO - 2 && f <= REV + 6 ? <Lluvia3D f={f} delante /> : null}
        <Revision f={f} />
        <Informe f={f} />
        <Pregunta f={f} />
        <Formulario f={f} />
        <Avion f={f} />
        <Aviso f={f} />
        <Final f={f} />
        <Rotulos f={f} />
        <Cuchilla f={f} />
        <Cursor
          f={f}
          ks={[
            {f: CTA0 + 20, x: 1010, y: 1720},
            {f: CTA.press - 5, x: 560, y: 1075},
            {f: CTA.press + 3, x: 562, y: 1077},
            {f: CTA.chip - 6, x: 236, y: 924},
            {f: CTA.chip + 3, x: 238, y: 926},
            {f: CTA.field - 6, x: 380, y: 1142},
            {f: CTA.field + 3, x: 382, y: 1144},
            {f: TECLAS[0] + 8, x: 410, y: 1196},
            {f: TECLAS[TECLAS.length - 1], x: 412, y: 1198},
            {f: CTA.send - 6, x: 560, y: 1428},
            {f: CTA.send + 3, x: 562, y: 1430},
            {f: CTA.send + 18, x: 720, y: 1580},
          ]}
          clicks={[CTA.press, CTA.chip, CTA.field, CTA.send]}
          to={CTA.send + 8}
        />
      </Camara>


      <Musica />
      <Efectos />
      {props.zonas ? <ZonaSegura /> : null}
    </AbsoluteFill>
  );
};

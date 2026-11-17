import React from 'react';
import {AbsoluteFill, Html5Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {enfoque, Foto} from './estilo';
import {
  Anillos,
  Barras,
  BotonEstado,
  brilloTexto,
  c01,
  Calendario,
  COLOR,
  Confeti,
  Contador,
  DeslizadorGrueso,
  E,
  Franjas,
  Insignia,
  Interruptor,
  Isla,
  Logo,
  Marco,
  mix,
  p,
  pap,
  Pila,
  pulso,
  SANS,
  Segmentado,
  Sello,
  serif,
  sp,
  texto,
  Toque,
  vidrio,
  type Aviso,
} from './ui';

/*
 * «Interfaces que se sienten» (13 nov 2026). Un muestrario en vídeo del kit de elementos UI (ui.tsx):
 * cinco negocios, cada uno con su foto, su color y los controles que lo cuentan. Un solo toque conduce todo: enciende
 * la luz del salón, abre la música, reserva la mesa, abre la actividad y cambia el gráfico de la tienda. El marco de
 * una herramienta de diseño nombra cada componente. Cierre: las escenas vuelven como un bento, que se inclina hacia
 * atrás como un suelo bajo el titular y la marca (MARCA, abajo: cámbiala por la tuya).
 * Música: una pista con bombo cada 15 fotogramas (120 bpm) y el golpe final en f600.
 * Sin voz. Sin fundidos. Función pura del fotograma.
 */

const W = 1080;
const H = 1920;
const AX = 476;
const AY = 768;
const CX = 476;

/* ---------- guion: bombo cada 15 fotogramas desde f0 (la música empieza en un bombo) ---------- */

const B = (n: number) => 15 * n;
// 1 · casa
// r1: el titular ya se lee en f0, que es la portada que suele elegir la red
const T1 = [-8, 0, 8];
const APRIETA1 = 49;
const ON = 56;
const LUZ = B(4);
const MARCO_INT = 62;
const TIT_SALE = 66;
const CRECE = 80;
const MARCO_DES = 94;
const ARRASTRA = 102;
const SUELTA = 128;
// 2 · música
const ISLA_IN = 132;
const MARCO_ISLA = 146;
const APRIETA_ISLA = 170;
const ABRE = 177;
const CONCIERTO = B(12);
const CIERRA = 226;
// 3 · restaurante
const MESA = B(16);
const MARCO_CAL = 262;
const APRIETA_14 = 270;
const PLIEGA = 288;
const APRIETA_21 = 298;
const MARCO_BTN = 306;
const APRIETA_BTN = 316;
const MORF = 321;
const EXITO = 344;
const VUELVE = 354;
const AVISOS_AT = [362, 376, 390];
const MARCO_AV = 398;
const APRIETA_AV = 408;
// 4 · deporte
const PISTA = B(28);
const ANILLOS_AT = 426;
const MARCO_ANI = 440;
const APRIETA_PASOS = 466;
// 5 · tienda
const TIENDA = B(32);
const MARCO_SEG = 484;
const APRIETA_SEG = 490;
const SEG_AT = 494;
const BARRAS_AT = 498;
const MARCO_BAR = 514;
// 6 · bento y cierre
const BENTO = B(36);
const FIN = B(40);
export const FRAMES = 690;

if (FIN !== 600) throw new Error(`FIN f${FIN}: el golpe de la música (public/ui/musica.wav) cae en f600`);

/* ---------- fotos (Unsplash, licencia Unsplash; bajadas el 13 nov 2026 a 2600 px de alto) ---------- */

const MARCA = {nombre: 'Tu marca', web: 'tumarca.com'};

const FOTO = {
  salon: staticFile('ui/fondos/salon.jpg'), // f8tOIicRXKU · salón con ventanas azules al anochecer
  musica: staticFile('ui/fondos/musica.jpg'), // kr0n21UM8KI · escenario con focos violetas
  restaurante: staticFile('ui/fondos/restaurante.jpg'), // G7QDRtECrec · mesa con vela junto a pared de ladrillo
  pista: staticFile('ui/fondos/pista.jpg'), // aeA2qXYHBqI · pista de atletismo naranja desde arriba
  tienda: staticFile('ui/fondos/tienda.jpg'), // vFcfeKAKGlg · tienda de ropa luminosa
};

/* ---------- cámara (pantalla, anclada en el centro de la zona segura) ---------- */

type Cam = {x: number; y: number; k: number};
const GOLPES: [number, number][] = [
  [LUZ, 0.04],
  [CONCIERTO, 0.035],
  [MESA, 0.02],
  [EXITO, 0.02],
  [PISTA, 0.03],
  [TIENDA, 0.025],
  [BENTO, 0.02],
  [FIN, 0.05],
];
const camara = (f: number): Cam => {
  const golpe = GOLPES.reduce((acc, [a, amt]) => acc + amt * Math.sin(Math.PI * c01((f - a) / 8)), 0);
  // empuje lento dentro de cada escena
  const escenas = [0, CONCIERTO, MESA, PISTA, TIENDA, BENTO, FIN];
  const i = escenas.filter((a) => f >= a).length - 1;
  const a = escenas[i];
  const b = escenas[i + 1] ?? FRAMES;
  const empuje = 0.035 * p(f, a, b - a, E.lin);
  return {x: AX + 4 * Math.sin(f / 41) + 2 * Math.sin(f / 17), y: AY + 3 * Math.cos(f / 37), k: (1 + empuje) * (1 + golpe)};
};
const Camara: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <AbsoluteFill style={{transform: `translate(${AX}px, ${AY}px) scale(${cam.k}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>
);
/** Plano de fondo a profundidad d (0 quieto, 1 como el primer plano). */
const Plano: React.FC<{cam: Cam; d: number; children: React.ReactNode}> = ({cam, d, children}) => (
  <AbsoluteFill style={{transform: `translate(${AX}px, ${AY}px) scale(${1 + d * (cam.k - 1)}) translate(${-AX - d * (cam.x - AX)}px, ${-AY - d * (cam.y - AY)}px)`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>
);
const enPantalla = (cam: Cam, x: number, y: number) => ({x: AX + (x - cam.x) * cam.k, y: AY + (y - cam.y) * cam.k});

/** Revelado circular desde un punto (en pantalla), con un anillo de luz que adelgaza. */
const DUR_REV = 12;
const Revela: React.FC<{f: number; at: number; x: number; y: number; anillo?: string; children: React.ReactNode}> = ({f, at, x, y, anillo = 'rgba(255,255,255,0.7)', children}) => {
  const t = c01((f - at) / DUR_REV);
  const R = 2400 * Easing3(t);
  if (f < at) return null;
  if (t >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <>
      <AbsoluteFill style={{clipPath: `circle(${Math.max(0, R)}px at ${x}px ${y}px)`}}>{children}</AbsoluteFill>
      <div style={{position: 'absolute', left: x - R, top: y - R, width: 2 * R, height: 2 * R, borderRadius: '50%', border: `${14 * (1 - t)}px solid ${anillo}`, boxSizing: 'border-box'}} />
    </>
  );
};
const Easing3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) * 0.35 + E.in(t) * 0.65;

/* ---------- 1 · casa: interruptor y deslizador ---------- */

const CASA = {w: 820, pad: 34, filaA: 130, gap: 24, slider: 116};
const crece = (f: number) => sp(f, CRECE, 16, 120, 0.9);
const casaAlto = (g: number) => 2 * CASA.pad + CASA.filaA + g * (CASA.gap + CASA.slider);
const casaCentro = (g: number) => mix(1010, 768, g);
const casaTop = (f: number) => {
  const g = crece(f);
  return casaCentro(g) - casaAlto(g) / 2;
};
const INT_W = 210;
const intC = (f: number) => ({x: CX + CASA.w / 2 - CASA.pad - INT_W / 2, y: casaTop(f) + CASA.pad + CASA.filaA / 2});
const SLIDER = {x: CX - CASA.w / 2 + CASA.pad, w: CASA.w - 2 * CASA.pad};
const sliderTop = (f: number) => casaTop(f) + CASA.pad + CASA.filaA + CASA.gap;
const valor = (f: number) => mix(0.4, 0.86, p(f, ARRASTRA + 2, SUELTA - ARRASTRA - 4, E.io));
const pomoX = (v: number) => SLIDER.x + mix(CASA.slider, SLIDER.w, v) - CASA.slider * 0.5 - 8;
const onDe = (f: number) => sp(f, ON, 14, 180, 0.8);

const Casa: React.FC<{f: number}> = ({f}) => {
  const g = crece(f);
  const on = onDe(f);
  const pres = pulso(f, APRIETA1, 9);
  const act = c01(p(f, ARRASTRA, 5) - p(f, SUELTA, 6));
  const alto = casaAlto(g);
  return (
    <div style={{position: 'relative', width: CASA.w, height: alto, ...vidrio('oscuro', 52), overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: CASA.pad, top: CASA.pad, height: CASA.filaA, display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={{transform: `scale(${1 + 0.08 * pulso(f, ON + 2, 10)})`}}>
          <Insignia n="bombilla" color={on > 0.5 ? COLOR.casa : '#4a4c5c'} size={96} />
        </div>
        <div>
          <div style={texto(48, '#f4f4f7', 650, -0.03)}>Luces del salón</div>
          <div style={{...texto(31, 'rgba(235,236,245,0.6)', 500, -0.01), marginTop: 6}}>{on > 0.5 ? 'Encendidas · 3 lámparas' : 'Apagadas · 3 lámparas'}</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: CASA.pad, top: CASA.pad + (CASA.filaA - INT_W * 0.6) / 2}}>
        <Interruptor on={on} presion={pres} color={COLOR.casa} w={INT_W} tono="oscuro" />
      </div>
      <div style={{position: 'absolute', left: CASA.pad, top: CASA.pad + CASA.filaA + CASA.gap, transform: `scale(${0.9 + 0.1 * g})`, transformOrigin: '50% 0', filter: g < 0.9 ? `blur(${(1 - g) * 14}px)` : undefined}}>
        <DeslizadorGrueso valor={valor(f)} activo={act} color={COLOR.casa} w={SLIDER.w} h={CASA.slider} icono="sol" />
      </div>
    </div>
  );
};

/* ---------- 2 · música: la isla ---------- */

const ISLA_ESC = 0.94;
const ISLA_Y = 336;
const abreDe = (f: number) => sp(f, ABRE, 16, 120, 1) * (1 - sp(f, CIERRA, 18, 150, 1));
const islaY = (f: number) => mix(ISLA_Y, 760, c01(abreDe(f)));
const golpeMusica = (f: number) => Math.max(0, 1 - (((f % 15) + 15) % 15) / 6);
const islaRect = (f: number) => {
  const a = abreDe(f);
  const w = mix(260, 860, c01(a * 1.18)) * ISLA_ESC;
  const h = mix(76, 380, c01((a - 0.06) / 0.94)) * ISLA_ESC;
  return {x: CX - w / 2, y: islaY(f) - h / 2, w, h};
};

/* ---------- 3 · restaurante: calendario, franjas, botón y avisos ---------- */

const MESA_C = {w: 820, pad: 36, top: 384, cab: 100};
const CAL_W = MESA_C.w - 2 * MESA_C.pad;
const CAL_X = CX - CAL_W / 2;
const CAL_TOP = MESA_C.top + MESA_C.pad + MESA_C.cab + 20;
const CELDA = CAL_W / 7;
const FILA = CELDA * 0.86;
const REJILLA_TOP = CAL_TOP + 51.5 + 18 + 29.1 + 10;
const pliegaDe = (f: number) => p(f, PLIEGA, 14, E.io);
const calAlto = (f: number) => REJILLA_TOP - CAL_TOP + FILA * mix(6, 1, pliegaDe(f)) + 10;
const chipsTop = (f: number) => CAL_TOP + calAlto(f) + 20;
const CHIP_H = 83;
const btnTop = (f: number) => chipsTop(f) + CHIP_H + 24;
const BTN_H = 120;
const HORAS = ['20:30', '21:00', '21:30', '22:00'];
const AVISOS: Aviso[] = [
  {icono: 'plato', color: COLOR.restaurante, app: 'Reservas', hora: 'ahora', titulo: 'Mesa para 2 confirmada', texto: 'Sáb 14 nov · 21:00'},
  {icono: 'reloj', color: COLOR.musica, app: 'Recordatorio', hora: 'ahora', titulo: 'Te avisamos 1 h antes', texto: 'Sáb 14 nov · 20:00'},
  {icono: 'pasos', color: '#2fbf71', app: 'Actividad', hora: 'ahora', titulo: 'Te quedan 1.568 pasos', texto: 'Meta diaria: 10.000'},
];
const AVISOS_TOP = 410;
const llegan = (f: number) => AVISOS_AT.map((a) => sp(f, a, 13, 150, 0.9));

const Mesa: React.FC<{f: number}> = ({f}) => {
  const pl = pliegaDe(f);
  const chips = sp(f, PLIEGA + 6, 15, 150, 0.9);
  const boton = sp(f, PLIEGA + 10, 15, 150, 0.9);
  const morf = sp(f, MORF, 16, 170, 0.9);
  return (
    <div style={{width: MESA_C.w, ...vidrio('claro', 54), padding: MESA_C.pad, overflow: 'hidden'}}>
      <div style={{height: MESA_C.cab, display: 'flex', alignItems: 'center', gap: 24}}>
        <Insignia n="plato" color={COLOR.restaurante} size={92} />
        <div style={{flex: 1}}>
          <div style={texto(46, COLOR.tinta, 650, -0.03)}>Reservar mesa</div>
          <div style={{...texto(30, '#6b7080', 500, -0.01), marginTop: 6}}>{pl > 0.5 ? 'Sáb 14 nov · 2 personas' : 'Para 2 personas'}</div>
        </div>
        <Sello />
      </div>
      <div style={{height: 20}} />
      <Calendario mes="Noviembre" primerDia={6} dias={30} sel={14} selT={pap(f, APRIETA_14 + 4)} filas={mix(0, 6, p(f, MESA + 6, 16, E.lin))} pliega={pl} color={COLOR.restaurante} w={CAL_W} />
      <div style={{height: 20}} />
      <div style={{height: CHIP_H * chips, transform: `scale(${0.9 + 0.1 * chips})`, transformOrigin: '50% 0', display: 'flex', justifyContent: 'center', overflow: 'visible'}}>
        {chips > 0.02 ? <Franjas opciones={HORAS} sel={1} t={pap(f, APRIETA_21 + 4)} color={COLOR.restaurante} size={38} /> : null}
      </div>
      <div style={{height: 24 * boton}} />
      <div style={{height: BTN_H * boton, transform: `scale(${0.9 + 0.1 * boton})`, transformOrigin: '50% 0'}}>
        {boton > 0.02 ? (
          <BotonEstado
            texto="Reservar mesa"
            hecho="Reservada"
            color={COLOR.restaurante}
            w={CAL_W}
            h={BTN_H}
            presion={pulso(f, APRIETA_BTN, 8)}
            morf={morf}
            giro={(f - MORF) * 15}
            exito={p(f, EXITO, 10, E.out)}
            vuelve={sp(f, VUELVE, 15, 150, 0.9)}
          />
        ) : null}
      </div>
    </div>
  );
};

/* ---------- 4 · deporte: anillos y contador ---------- */

const DEP = {w: 820, pad: 36, cab: 100, aro: 360};
const DEP_TOP = 768 - (2 * DEP.pad + DEP.cab + 24 + DEP.aro) / 2;
const anillosDe = (f: number) => [p(f, ANILLOS_AT, 34, E.out) * 0.84, p(f, ANILLOS_AT + 4, 34, E.out) * 0.62, p(f, ANILLOS_AT + 8, 34, E.out) * 1.0];
const pasosDe = (f: number) => 8432 * p(f, ANILLOS_AT + 2, 34, E.out);
const Leyenda: React.FC<{color: string; t: string; v: string}> = ({color, t, v}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
    <div style={{width: 18, height: 18, borderRadius: 9, background: color}} />
    <div style={{...texto(28, '#6b7080', 550, -0.01), flex: 1}}>{t}</div>
    <div style={{...texto(28, COLOR.tinta, 650, -0.01), fontVariantNumeric: 'tabular-nums'}}>{v}</div>
  </div>
);
const Deporte: React.FC<{f: number}> = ({f}) => {
  const a = anillosDe(f);
  return (
    <div style={{width: DEP.w, ...vidrio('claro', 54), padding: DEP.pad}}>
      <div style={{height: DEP.cab, display: 'flex', alignItems: 'center', gap: 24}}>
        <Insignia n="pasos" color="#2fbf71" size={92} />
        <div style={{flex: 1}}>
          <div style={texto(46, COLOR.tinta, 650, -0.03)}>Actividad</div>
          <div style={{...texto(30, '#6b7080', 500, -0.01), marginTop: 6}}>Hoy</div>
        </div>
        <Sello />
      </div>
      <div style={{height: 24}} />
      <div style={{display: 'flex', gap: 34, alignItems: 'center'}}>
        <Anillos valores={a} colores={[COLOR.rosa, COLOR.lima, COLOR.cian]} size={DEP.aro} grosor={46} fondo="claro" />
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
          <div style={texto(30, '#6b7080', 550, -0.01)}>Pasos</div>
          <Contador valor={pasosDe(f)} cifras={4} size={104} color={COLOR.tinta} />
          <div style={{...texto(28, '#6b7080', 500, -0.01), marginBottom: 18}}>de 10.000</div>
          <Leyenda color={COLOR.rosa} t="Moverse" v={`${Math.round(a[0] * 100)} %`} />
          <Leyenda color={COLOR.lima} t="Ejercicio" v={`${Math.round(a[1] * 100)} %`} />
          <Leyenda color={COLOR.cian} t="De pie" v={`${Math.round(a[2] * 100)} %`} />
        </div>
      </div>
    </div>
  );
};

/* ---------- 5 · tienda: segmentado, contador y barras ---------- */

const TIE = {w: 820, pad: 36, cab: 100, seg: 84, cont: 110, bar: 250};
const TIE_ALTO = 2 * TIE.pad + TIE.cab + 20 + TIE.seg + 18 + TIE.cont + 18 + TIE.bar + 50;
const TIE_TOP = 768 - TIE_ALTO / 2;
const SEMANA = [42, 55, 48, 70, 64, 92, 58];
const segDe = (f: number) => sp(f, SEG_AT, 16, 160, 0.9);
const Tienda: React.FC<{f: number}> = ({f}) => {
  const crece = SEMANA.map((_, i) => sp(f, BARRAS_AT + 2 * i, 11, 150, 0.8));
  const pedidos = 1284 * p(f, BARRAS_AT, 26, E.out);
  return (
    <div style={{width: TIE.w, ...vidrio('claro', 54), padding: TIE.pad}}>
      <div style={{height: TIE.cab, display: 'flex', alignItems: 'center', gap: 24}}>
        <Insignia n="bolsa" color={COLOR.tienda} size={92} />
        <div style={{flex: 1}}>
          <div style={texto(46, COLOR.tinta, 650, -0.03)}>Pedidos</div>
          <div style={{...texto(30, '#6b7080', 500, -0.01), marginTop: 6}}>Tienda online</div>
        </div>
        <Sello />
      </div>
      <div style={{height: 20}} />
      <Segmentado opciones={['Día', 'Semana', 'Mes']} pos={segDe(f)} w={TIE.w - 2 * TIE.pad} h={TIE.seg} />
      <div style={{height: 18}} />
      <div style={{height: TIE.cont, display: 'flex', alignItems: 'center', gap: 22}}>
        <Contador valor={pedidos} cifras={4} size={92} color={COLOR.tinta} />
        <div style={{...texto(28, '#168a4a', 650, -0.01), padding: '8px 16px', borderRadius: 999, background: 'rgba(34,197,94,0.14)', transform: `scale(${pap(f, BARRAS_AT + 20)})`}}>+24 % esta semana</div>
      </div>
      <div style={{height: 18}} />
      <Barras valores={SEMANA} etiquetas={['L', 'M', 'X', 'J', 'V', 'S', 'D']} crece={crece} destaca={5} etiqueta="92 pedidos" etiquetaT={pap(f, BARRAS_AT + 16)} color={COLOR.tienda} w={TIE.w - 2 * TIE.pad} h={TIE.bar} />
    </div>
  );
};

/* ---------- piezas en el espacio: una tarjeta que entra inclinada y se hunde al irse ---------- */

const Pieza: React.FC<{x: number; y: number; entra: number; sale?: number; children: React.ReactNode; ry?: number}> = ({x, y, entra, sale = 0, children, ry = 0}) => {
  if (entra <= 0.001 || sale >= 0.999) return null;
  const z = -900 * (1 - entra) - 1400 * sale;
  const rx = 28 * (1 - entra) - 24 * sale;
  const dy = 260 * (1 - entra) + 520 * sale;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y + dy}px) perspective(2400px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry * (1 - entra)}deg) translate(-50%, -50%)`, transformOrigin: '0 0'}}>
      {children}
    </div>
  );
};

/* ---------- el toque (conductor) ---------- */

type Kf = {f: number; x: number; y: number};
const TOQUE_KF: Kf[] = [
  {f: 26, x: 900, y: 1560},
  {f: 45, ...intC(45)},
  {f: 76, ...intC(76)},
  {f: 98, x: pomoX(0.4), y: sliderTop(98) + CASA.slider / 2},
  {f: ARRASTRA, x: pomoX(0.4), y: sliderTop(ARRASTRA) + CASA.slider / 2},
  {f: SUELTA, x: pomoX(valor(SUELTA)), y: sliderTop(SUELTA) + CASA.slider / 2},
  {f: 140, x: pomoX(valor(SUELTA)), y: sliderTop(140) + CASA.slider / 2},
  {f: 166, x: CX, y: ISLA_Y},
  {f: 184, x: CX, y: ISLA_Y},
  {f: 208, x: 840, y: 1190},
  {f: 252, x: 840, y: 1190},
  {f: 268, x: CAL_X + 5.5 * CELDA, y: REJILLA_TOP + 2.5 * FILA},
  {f: 286, x: CAL_X + 5.5 * CELDA, y: REJILLA_TOP + 2.5 * FILA},
  {f: 297, x: CX - 84, y: chipsTop(297) + CHIP_H / 2},
  {f: 306, x: CX - 84, y: chipsTop(306) + CHIP_H / 2},
  {f: 315, x: CX + 120, y: btnTop(315) + BTN_H / 2},
  {f: 340, x: CX + 120, y: btnTop(340) + BTN_H / 2},
  {f: 360, x: 860, y: 1190},
  {f: 394, x: 860, y: 1190},
  {f: 406, x: CX + 60, y: AVISOS_TOP + 82},
  {f: 420, x: CX + 60, y: AVISOS_TOP + 82},
  {f: 462, x: CX + 210, y: DEP_TOP + DEP.pad + DEP.cab + 24 + 96},
  {f: 474, x: CX + 210, y: DEP_TOP + DEP.pad + DEP.cab + 24 + 96},
  {f: 489, x: CX, y: TIE_TOP + TIE.pad + TIE.cab + 20 + TIE.seg / 2},
  {f: 504, x: CX, y: TIE_TOP + TIE.pad + TIE.cab + 20 + TIE.seg / 2},
  {f: 530, x: 900, y: 1500},
];
const APRIETES = [APRIETA1, APRIETA_ISLA, APRIETA_14, APRIETA_21, APRIETA_BTN, APRIETA_AV, APRIETA_PASOS, APRIETA_SEG];
const toque = (f: number) => {
  const kf = TOQUE_KF;
  let pos = {x: kf[0].x, y: kf[0].y};
  if (f >= ARRASTRA && f <= SUELTA) {
    pos = {x: pomoX(valor(f)), y: sliderTop(f) + CASA.slider / 2};
  } else {
    const i = Math.max(0, kf.findIndex((k) => k.f > f) - 1);
    const a = kf[Math.min(i, kf.length - 1)];
    const b = kf[Math.min(i + 1, kf.length - 1)];
    const t = f <= a.f ? 0 : E.io(c01((f - a.f) / Math.max(1, b.f - a.f)));
    pos = {x: mix(a.x, b.x, t), y: mix(a.y, b.y, t)};
  }
  const presion = APRIETES.reduce((s, a) => s + pulso(f, a, 8), 0) + c01(p(f, ARRASTRA - 2, 4) - p(f, SUELTA, 5)) * 0.6;
  const onda = APRIETES.map((a) => (f - (a + 5)) / 16).find((v) => v > 0 && v < 1) ?? 0;
  const s = sp(f, 26, 14, 160, 0.8) * (1 - sp(f, 524, 14, 160, 0.8));
  return {...pos, presion, onda, s};
};

/* ---------- marcos con el nombre de cada componente ---------- */

type Rect = {x: number; y: number; w: number; h: number};
const pad = (r: Rect, m: number): Rect => ({x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m});
// la etiqueta va donde no pisa texto: debajo del componente, o a la derecha si debajo hay algo
const MARCOS: {a: number; sale: number; nombre: string; rect: (f: number) => Rect; r?: number; lado?: 'arriba' | 'abajo'; alinea?: 'izq' | 'der'}[] = [
  {a: MARCO_INT, sale: CRECE - 4, nombre: 'Interruptor', rect: (f) => pad({x: intC(f).x - INT_W / 2, y: intC(f).y - INT_W * 0.3, w: INT_W, h: INT_W * 0.6}, 14), r: 80},
  {a: MARCO_DES, sale: SUELTA + 6, nombre: 'Deslizador', rect: (f) => pad({x: SLIDER.x, y: sliderTop(f), w: SLIDER.w, h: CASA.slider}, 12), r: 70, lado: 'abajo'},
  {a: MARCO_ISLA, sale: CIERRA - 4, nombre: 'Isla dinámica', rect: (f) => pad(islaRect(f), 12), r: 50, lado: 'abajo'},
  {a: MARCO_CAL, sale: PLIEGA - 2, nombre: 'Calendario', rect: () => pad({x: CAL_X, y: CAL_TOP, w: CAL_W, h: REJILLA_TOP - CAL_TOP + 6 * FILA + 10}, 10), r: 20, lado: 'abajo'},
  {a: MARCO_BTN, sale: VUELVE + 8, nombre: 'Botón con estados', rect: (f) => pad({x: CAL_X, y: btnTop(f), w: CAL_W, h: BTN_H}, 12), r: 72, lado: 'abajo'},
  {a: MARCO_AV, sale: APRIETA_AV + 6, nombre: 'Notificaciones', rect: () => pad({x: CX - 410, y: AVISOS_TOP - 60, w: 820, h: 225}, 12), r: 56, lado: 'abajo', alinea: 'der'},
  {a: MARCO_ANI, sale: APRIETA_PASOS - 2, nombre: 'Anillos de progreso', rect: () => pad({x: CX - DEP.w / 2 + DEP.pad, y: DEP_TOP + DEP.pad + DEP.cab + 24, w: DEP.aro, h: DEP.aro}, 12), r: 200, lado: 'abajo'},
  {a: MARCO_SEG, sale: SEG_AT + 10, nombre: 'Control segmentado', rect: () => pad({x: CX - TIE.w / 2 + TIE.pad, y: TIE_TOP + TIE.pad + TIE.cab + 20, w: TIE.w - 2 * TIE.pad, h: TIE.seg}, 12), r: 56, lado: 'abajo', alinea: 'der'},
  {a: MARCO_BAR, sale: BENTO - 4, nombre: 'Gráfico de barras', rect: () => pad({x: CX - TIE.w / 2 + TIE.pad, y: TIE_TOP + TIE_ALTO - TIE.pad - TIE.bar - 50, w: TIE.w - 2 * TIE.pad, h: TIE.bar + 50}, 12), r: 24, lado: 'abajo'},
];
const Marcos: React.FC<{f: number}> = ({f}) => (
  <>
    {MARCOS.map((m, i) => {
      if (f < m.a || f > m.sale + 8) return null;
      const fuera = p(f, m.sale, 7, E.in);
      const r = m.rect(f);
      return <Marco key={i} {...r} t={sp(f, m.a, 14, 190, 0.8) * (1 - fuera)} asas={pap(f, m.a + 3) * (1 - fuera)} nombreT={pap(f, m.a + 5) * (1 - fuera)} nombre={m.nombre} r={m.r} lado={m.lado} alinea={m.alinea} />;
    })}
  </>
);

/* ---------- texto ---------- */

const Pal: React.FC<{f: number; a: number; sale?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, a, sale = Infinity, style, children}) => <span style={{...enfoque(f, a, sale), ...style}}>{children}</span>;

const Titulo: React.FC<{f: number}> = ({f}) => {
  if (f > TIT_SALE + 12) return null;
  const sombra = '0 6px 30px rgba(0,0,0,0.45)';
  return (
    <div style={{position: 'absolute', left: 100, top: 318, textShadow: sombra}}>
      <div style={texto(118, '#f6f4f0', 700, -0.045)}>
        <Pal f={f} a={T1[0]} sale={TIT_SALE}>
          Interfaces
        </Pal>
      </div>
      <div style={texto(118, '#f6f4f0', 700, -0.045)}>
        <Pal f={f} a={T1[1]} sale={TIT_SALE + 2}>
          que se
        </Pal>
      </div>
      <div style={{...serif(176, '#ffd9b8'), marginTop: 4}}>
        <Pal f={f} a={T1[2]} sale={TIT_SALE + 4} style={{...brilloTexto(-30 + 5 * (f - T1[2]), '#ffd9b8', '#ffffff'), textShadow: 'none', filter: `${enfoque(f, T1[2], TIT_SALE + 4).filter ?? ''} drop-shadow(0 6px 24px rgba(0,0,0,0.4))`}}>
          sienten.
        </Pal>
      </div>
    </div>
  );
};

/* ---------- 6 · bento y cierre ---------- */

const TESELA = {w: 400, h: 300};
const TESELAS = [
  {x: 66, y: 300, foto: 'salon', foco: [50, 60]},
  {x: 486, y: 300, foto: 'musica', foco: [50, 40]},
  {x: 66, y: 620, foto: 'restaurante', foco: [60, 50]},
  {x: 486, y: 620, foto: 'restaurante', foco: [20, 30]},
  {x: 66, y: 940, foto: 'pista', foco: [50, 50]},
  {x: 486, y: 940, foto: 'tienda', foco: [50, 50]},
] as const;
const ultima = TESELAS[5];
const llegaTesela = (f: number, i: number) => sp(f, BENTO + 4 + i * 3, 15, 130, 0.9);
const suelo = (f: number) => sp(f, FIN, 18, 70, 1.1);

/** Lo que va dentro de cada tesela: la tarjeta de su escena en su estado final, en pequeño. */
const Mini: React.FC<{i: number}> = ({i}) => {
  const k = 0.44;
  const caja = (w: number, h: number, nodo: React.ReactNode) => (
    <div style={{position: 'absolute', left: TESELA.w / 2, top: TESELA.h / 2, width: w, height: h, transform: `translate(-50%, -50%) scale(${k})`}}>{nodo}</div>
  );
  if (i === 0) return caja(CASA.w, casaAlto(1), <Casa f={SUELTA + 20} />);
  if (i === 1)
    return (
      <div style={{position: 'absolute', left: TESELA.w / 2, top: TESELA.h / 2, transform: `translate(-50%, -50%) scale(0.43)`}}>
        <Isla abre={1} f={CONCIERTO + 30} color={COLOR.musica} titulo="Noche en casa" sub="Lista de ejemplo" progreso={0.42} escala={1} />
      </div>
    );
  if (i === 2)
    return (
      <div style={{position: 'absolute', left: TESELA.w / 2, top: TESELA.h / 2, transform: `translate(-50%, -50%) scale(0.42)`}}>
        <Mesa f={VUELVE + 30} />
      </div>
    );
  if (i === 3)
    return (
      <div style={{position: 'absolute', left: TESELA.w / 2, top: TESELA.h / 2 - 30, transform: `translate(-50%, -50%) scale(0.42)`}}>
        <Pila avisos={AVISOS} llegan={[1, 1, 1]} w={820} />
      </div>
    );
  return (
    <div style={{position: 'absolute', left: TESELA.w / 2, top: TESELA.h / 2, transform: `translate(-50%, -50%) scale(0.42)`}}>
      <Deporte f={ANILLOS_AT + 60} />
    </div>
  );
};

const Bento: React.FC<{f: number}> = ({f}) => {
  if (f < BENTO) return null;
  const s = suelo(f);
  return (
    <AbsoluteFill style={{transform: `translateY(${600 * s}px) perspective(1700px) rotateX(${56 * s}deg) scale(${1 + 0.28 * s})`, transformOrigin: '476px 768px'}}>
      {TESELAS.slice(0, 5).map((t, i) => {
        const l = llegaTesela(f, i);
        if (l <= 0.001) return null;
        // cada escena vuelve desde fuera del cuadro, del lado donde está su casilla
        const dx = (t.x < 400 ? -700 : 700) * (1 - l);
        const dy = (t.y - 768) * 0.6 * (1 - l);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y,
              width: TESELA.w,
              height: TESELA.h,
              borderRadius: 40,
              overflow: 'hidden',
              transform: `translate(${dx}px, ${dy}px) perspective(1600px) rotateY(${(t.x < 400 ? 35 : -35) * (1 - l)}deg) scale(${0.8 + 0.2 * l})`,
              boxShadow: '0 30px 70px rgba(0,0,0,0.45), inset 0 0 0 1.5px rgba(255,255,255,0.18)',
            }}
          >
            <Img src={FOTO[t.foto]} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${t.foco[0]}% ${t.foco[1]}%`, filter: i === 0 ? 'brightness(0.95) saturate(1.08)' : i === 3 ? 'brightness(0.7) blur(3px)' : 'blur(1px)'}} />
            <Mini i={i} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** La tienda a pantalla completa se recoge en su casilla del bento (la última). */
const recoge = (f: number) => sp(f, BENTO, 17, 110, 1);
const ClipTienda: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
  if (f < BENTO) return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = recoge(f);
  const s = suelo(f);
  const top = mix(0, ultima.y, r);
  const left = mix(0, ultima.x, r);
  const right = mix(0, W - ultima.x - TESELA.w, r);
  const bottom = mix(0, H - ultima.y - TESELA.h, r);
  // dentro, todo se escala para que la tarjeta de la tienda quepa en la casilla
  const k = mix(1, 0.42, r);
  const cx = mix(CX, ultima.x + TESELA.w / 2, r);
  const cy = mix(768, ultima.y + TESELA.h / 2, r);
  return (
    <AbsoluteFill style={{transform: `translateY(${600 * s}px) perspective(1700px) rotateX(${56 * s}deg) scale(${1 + 0.28 * s})`, transformOrigin: '476px 768px'}}>
      <AbsoluteFill style={{clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round ${40 * r}px)`}}>
        <AbsoluteFill style={{transform: `translate(${cx}px, ${cy}px) scale(${k}) translate(${-CX}px, ${-768}px)`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const NOCHE = 'radial-gradient(120% 80% at 50% 28%, #23263a 0%, #0f1018 55%, #07080c 100%)';

const Cierre: React.FC<{f: number}> = ({f}) => {
  if (f < FIN) return null;
  const P = [FIN + 4, FIN + 9, FIN + 14, FIN + 19];
  const logo = pap(f, FIN + 26);
  return (
    <>
      <div style={{position: 'absolute', left: 0, width: 2 * CX, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <div style={texto(108, '#f6f4f0', 700, -0.045)}>
          <Pal f={f} a={P[0]}>Diseñamos</Pal>
        </div>
        <div style={texto(108, '#f6f4f0', 700, -0.045)}>
          <Pal f={f} a={P[1]}>interfaces</Pal>
        </div>
        <div style={{...serif(128, '#f6f4f0'), marginTop: 6}}>
          <Pal f={f} a={P[2]}>que se</Pal>{' '}
          <Pal f={f} a={P[3]} style={brilloTexto(-30 + 4 * (f - P[3]), '#cfd8ff', '#ffffff')}>
            sienten.
          </Pal>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, width: 2 * CX, top: 780, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${logo})`}}>
          <Logo size={104} color={COLOR.porcelana} punto={pap(f, FIN + 32)} />
          <div style={texto(70, COLOR.porcelana, 600, -0.035)}>{MARCA.nombre}</div>
        </div>
        <div
          style={{
            padding: '16px 34px',
            borderRadius: 999,
            background: 'linear-gradient(150deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))',
            border: '1.5px solid rgba(255,255,255,0.24)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            ...texto(34, COLOR.porcelana, 500, -0.015),
            transform: `scale(${pap(f, FIN + 38)})`,
          }}
        >
          {MARCA.web}
        </div>
      </div>
    </>
  );
};

/* ---------- fondos de cada escena ---------- */

const Fondos: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const knob = enPantalla(cam, intC(f).x + INT_W * 0.2, intC(f).y);
  const isla = enPantalla(cam, CX, ISLA_Y);
  // el concierto nace de donde está la isla al abrirse
  const islaAbre = enPantalla(cam, CX, islaY(CONCIERTO));
  const aviso = enPantalla(cam, CX + 60, AVISOS_TOP + 82);
  const pasos = enPantalla(cam, CX + 210, DEP_TOP + DEP.pad + DEP.cab + 120);
  const v = valor(f);
  const foco = (a: number) => 14 * (1 - p(f, a, 16, E.out));
  return (
    <AbsoluteFill style={{background: '#08090d'}}>
      {/* 1 · el salón a oscuras, y encendido desde el pomo con la entrada de la música */}
      {f < CONCIERTO + DUR_REV ? (
        <>
          <Plano cam={cam} d={0.3}>
            <Foto src={FOTO.salon} foco={[50, 62]} escala={1.12 + 0.04 * p(f, 0, 180, E.lin)} blur={2} filtro="brightness(0.3) saturate(0.55) contrast(1.08) hue-rotate(-10deg)" />
          </Plano>
          <Revela f={f} at={LUZ} x={knob.x} y={knob.y} anillo="rgba(255,190,130,0.75)">
            <Plano cam={cam} d={0.3}>
              <Foto src={FOTO.salon} foco={[50, 62]} escala={1.12 + 0.04 * p(f, 0, 180, E.lin)} blur={1.5} filtro={`brightness(${mix(0.62, 1.06, v)}) saturate(${mix(0.95, 1.15, v)})`} />
              {/* la luz cálida de las lámparas, que sube con el deslizador */}
              <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 62%, rgba(255,150,70,${0.1 + 0.25 * v}) 0%, rgba(255,150,70,0) 70%)`, mixBlendMode: 'screen'}} />
            </Plano>
          </Revela>
        </>
      ) : null}
      {/* 2 · el concierto, desde la isla */}
      {f >= CONCIERTO && f < MESA + DUR_REV ? (
        <Revela f={f} at={CONCIERTO} x={islaAbre.x} y={islaAbre.y} anillo="rgba(190,160,255,0.75)">
          <Plano cam={cam} d={0.3}>
            <Foto src={FOTO.musica} foco={[50, 40]} escala={1.1 + 0.05 * p(f, CONCIERTO, 60, E.lin)} blur={2 + foco(CONCIERTO)} filtro="brightness(0.85) saturate(1.1)" />
          </Plano>
        </Revela>
      ) : null}
      {/* 3 · el restaurante, desde la isla que vuelve arriba */}
      {f >= MESA && f < PISTA + DUR_REV ? (
        <Revela f={f} at={MESA} x={isla.x} y={isla.y} anillo="rgba(255,190,150,0.75)">
          <Plano cam={cam} d={0.3}>
            <Foto src={FOTO.restaurante} foco={[62, 55]} escala={1.12 + 0.05 * p(f, MESA, 180, E.lin)} blur={3 + foco(MESA)} filtro="brightness(0.92) saturate(1.05)" />
          </Plano>
        </Revela>
      ) : null}
      {/* 4 · la pista, desde el aviso de actividad */}
      {f >= PISTA && f < TIENDA + DUR_REV ? (
        <Revela f={f} at={PISTA} x={aviso.x} y={aviso.y} anillo="rgba(255,255,255,0.75)">
          <Plano cam={cam} d={0.3}>
            <Foto src={FOTO.pista} foco={[50, 50]} escala={1.1 + 0.05 * p(f, PISTA, 60, E.lin)} blur={2 + foco(PISTA)} filtro="saturate(1.05)" />
          </Plano>
        </Revela>
      ) : null}
      {/* 6 · la noche del cierre detrás del bento */}
      {f >= BENTO ? <AbsoluteFill style={{background: NOCHE}} /> : null}
      {/* 5 · la tienda, desde los pasos; en el cierre se recoge en su casilla con su tarjeta */}
      {f >= TIENDA ? (
        <Revela f={f} at={TIENDA} x={pasos.x} y={pasos.y} anillo="rgba(160,190,255,0.75)">
          <ClipTienda f={f}>
            <Plano cam={cam} d={0.3}>
              <Foto src={FOTO.tienda} foco={[50, 50]} escala={1.1 + 0.05 * p(f, TIENDA, 60, E.lin)} blur={3 + foco(TIENDA)} filtro="brightness(1.02)" />
            </Plano>
            {f >= BENTO ? (
              <Camara cam={cam}>
                <Pieza x={CX} y={768} entra={1}>
                  <Tienda f={f} />
                </Pieza>
              </Camara>
            ) : null}
          </ClipTienda>
        </Revela>
      ) : null}
    </AbsoluteFill>
  );
};

/** Grano fijo y suave contra las bandas de los degradados. */
const Grano: React.FC = () => (
  <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.3, pointerEvents: 'none'}}>
    <svg width={W} height={H}>
      <filter id="grano-ui">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grano-ui)" />
    </svg>
  </AbsoluteFill>
);

/* ---------- primer plano: tarjetas de cada escena ---------- */

const Escenas: React.FC<{f: number}> = ({f}) => {
  const isla = abreDe(f);
  const casaSale = p(f, APRIETA_ISLA + 2, 14, E.in);
  const mesaHunde = p(f, AVISOS_AT[0] - 4, 12, E.io);
  const aviSale = p(f, PISTA - 2, 12, E.in);
  return (
    <>
      {/* 1 · casa */}
      <Pieza x={CX} y={casaCentro(crece(f))} entra={f < 0 ? 0 : 1} sale={casaSale}>
        <Casa f={f} />
      </Pieza>
      {/* 3 · restaurante: entra inclinado; se hunde cuando llegan los avisos */}
      {f >= MESA ? (
        <Pieza x={CX} y={MESA_C.top} entra={sp(f, MESA + 2, 15, 120, 0.9)} sale={p(f, PISTA - 4, 12, E.in)}>
          <div style={{transform: `translate(0, 50%) translateY(${70 * mesaHunde}px) scale(${1 - 0.1 * mesaHunde})`, transformOrigin: '50% 0'}}>
            <Mesa f={f} />
          </div>
        </Pieza>
      ) : null}
      {f >= EXITO && f < EXITO + 50 ? <Confeti f={f} at={EXITO + 2} x={CX} y={btnTop(f) + BTN_H / 2} colores={[COLOR.restaurante, '#ffb36b', COLOR.exito, '#ffffff', COLOR.musica]} n={44} fuerza={0.9} seed={3} /> : null}
      {/* avisos */}
      {f >= AVISOS_AT[0] && aviSale < 1 ? (
        <div style={{position: 'absolute', left: CX - 410, top: AVISOS_TOP, transform: `translateY(${-500 * aviSale}px) scale(${1 - 0.2 * aviSale})`, transformOrigin: '50% 0'}}>
          <Pila avisos={AVISOS} llegan={llegan(f)} w={820} />
        </div>
      ) : null}
      {/* 4 · deporte */}
      {f >= PISTA ? (
        <Pieza x={CX} y={768} entra={sp(f, PISTA + 2, 15, 130, 0.9)} sale={p(f, APRIETA_PASOS + 6, 10, E.in)} ry={-20}>
          <Deporte f={f} />
        </Pieza>
      ) : null}
      {/* 5 · tienda (en el cierre pasa al fondo, dentro de su casilla) */}
      {f >= TIENDA && f < BENTO ? (
        <Pieza x={CX} y={768} entra={sp(f, TIENDA + 2, 15, 130, 0.9)} ry={20}>
          <Tienda f={f} />
        </Pieza>
      ) : null}
      {/* 2 · la isla: compacta arriba desde que la música suena; se abre con el toque y vuelve arriba */}
      {f >= ISLA_IN && f < BENTO + 14 ? (
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: islaY(f),
            transform: `translate(-50%, -50%) scale(${pap(f, ISLA_IN) * (1 - p(f, BENTO, 14, E.in))})`,
          }}
        >
          <Isla abre={isla} f={f} color={COLOR.musica} titulo="Noche en casa" sub="Lista de ejemplo" progreso={0.3 + (f - ISLA_IN) / 1400} beat={golpeMusica} escala={ISLA_ESC} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- sonido: la música (golpe en f600) y el paquete de efectos de la skill ---------- */

const MEZCLA = 1.33;
const FX_GANA = 1.8;
const MUSICA_VOL = 0.62;
const SFX: Record<string, {vol: number; desfase: number}> = {
  toque: {vol: 0.14, desfase: -1},
  'ui-click': {vol: 0.22, desfase: -4},
  deslizar: {vol: 0.14, desfase: -13},
  pop: {vol: 0.2, desfase: 0},
  'card-in': {vol: 0.18, desfase: -8},
  transicion: {vol: 0.16, desfase: -9},
  magia: {vol: 0.12, desfase: -10},
  success: {vol: 0.22, desfase: -1},
  publicado: {vol: 0.2, desfase: 0},
  contador: {vol: 0.16, desfase: -6},
  sello: {vol: 0.18, desfase: -2},
  boton: {vol: 0.2, desfase: 0},
  rodar: {vol: 0.1, desfase: -16},
  zoom: {vol: 0.16, desfase: -12},
  golpe: {vol: 0.16, desfase: -1},
  'logo-hit': {vol: 0.24, desfase: 0},
  tinta: {vol: 0.18, desfase: -16},
  slice: {vol: 0.1, desfase: -4},
  giro: {vol: 0.14, desfase: -9},
  vibra: {vol: 0.12, desfase: -3},
  soltar: {vol: 0.14, desfase: 0},
};
type Cue = {f: number; k: string; v?: number; tono?: number};
const ESCALA = [1, 1.122, 1.26, 1.335, 1.498, 1.682, 2];
const CUES: Cue[] = [
  // 1 · casa
  ...T1.map((f, i): Cue => ({f: f + 2, k: 'pop', v: 0.15, tono: ESCALA[i]})),
  {f: 26, k: 'soltar', v: 0.1},
  {f: APRIETA1, k: 'toque'},
  {f: ON + 1, k: 'ui-click', v: 0.26},
  {f: LUZ, k: 'magia', v: 0.1},
  {f: LUZ, k: 'tinta', v: 0.11},
  {f: MARCO_INT + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: CRECE, k: 'card-in', v: 0.16},
  {f: MARCO_DES + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: ARRASTRA, k: 'toque', v: 0.12},
  {f: ARRASTRA + 2, k: 'deslizar', v: 0.12},
  // háptica: toques suaves mientras se arrastra, más agudos cuanto más luz
  ...Array.from({length: 6}, (_, i): Cue => ({f: ARRASTRA + 4 + i * 4, k: 'toque', v: 0.07, tono: 1 + i * 0.08})),
  {f: SUELTA, k: 'soltar', v: 0.12},
  // 2 · música
  {f: ISLA_IN, k: 'pop', v: 0.18, tono: 0.9},
  {f: MARCO_ISLA + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_ISLA, k: 'toque'},
  {f: ABRE, k: 'boton', v: 0.16},
  {f: CONCIERTO, k: 'transicion', v: 0.16},
  {f: CONCIERTO, k: 'magia', v: 0.1},
  {f: CIERRA, k: 'slice', v: 0.12},
  // 3 · restaurante
  {f: MESA, k: 'transicion', v: 0.14},
  {f: MESA + 2, k: 'card-in'},
  {f: MARCO_CAL + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_14, k: 'toque'},
  {f: APRIETA_14 + 4, k: 'ui-click', v: 0.2},
  {f: PLIEGA, k: 'slice', v: 0.12},
  {f: APRIETA_21, k: 'toque'},
  {f: APRIETA_21 + 4, k: 'ui-click', v: 0.2, tono: 1.122},
  {f: MARCO_BTN + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_BTN, k: 'boton', v: 0.2},
  {f: MORF + 4, k: 'rodar', v: 0.1},
  {f: EXITO, k: 'success'},
  {f: EXITO + 2, k: 'pop', v: 0.14, tono: 1.26},
  ...AVISOS_AT.map((f, i): Cue => ({f, k: 'publicado', v: 0.18, tono: ESCALA[i * 2]})),
  {f: AVISOS_AT[0], k: 'vibra', v: 0.1},
  {f: MARCO_AV + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_AV, k: 'toque'},
  // 4 · deporte
  {f: PISTA, k: 'transicion', v: 0.16},
  {f: PISTA + 2, k: 'card-in'},
  {f: ANILLOS_AT, k: 'contador', v: 0.18},
  {f: ANILLOS_AT + 30, k: 'sello', v: 0.16},
  {f: MARCO_ANI + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_PASOS, k: 'toque'},
  // 5 · tienda
  {f: TIENDA, k: 'transicion', v: 0.14},
  {f: TIENDA + 2, k: 'card-in'},
  {f: MARCO_SEG + 3, k: 'pop', v: 0.12, tono: 1.5},
  {f: APRIETA_SEG, k: 'toque'},
  {f: SEG_AT, k: 'ui-click', v: 0.2},
  {f: SEG_AT, k: 'deslizar', v: 0.08},
  ...[0, 1, 2, 3, 4, 5, 6].map((i): Cue => ({f: BARRAS_AT + 2 * i + 2, k: 'pop', v: 0.1, tono: ESCALA[i]})),
  {f: BARRAS_AT, k: 'contador', v: 0.12},
  {f: MARCO_BAR + 3, k: 'pop', v: 0.12, tono: 1.5},
  // 6 · bento y cierre
  {f: BENTO, k: 'zoom', v: 0.18},
  ...[0, 1, 2, 3, 4].map((i): Cue => ({f: BENTO + 6 + i * 3, k: 'card-in', v: 0.1})),
  {f: FIN, k: 'logo-hit', v: 0.16},
  {f: FIN, k: 'golpe', v: 0.1},
  {f: FIN + 2, k: 'giro', v: 0.1},
  ...[0, 1, 2, 3].map((i): Cue => ({f: FIN + 6 + i * 5, k: 'pop', v: 0.16, tono: ESCALA[i]})),
  {f: FIN + 26, k: 'pop', v: 0.2, tono: 1.122},
  {f: FIN + 38, k: 'pop', v: 0.16, tono: 1.335},
];
const Efectos: React.FC = () => (
  <>
    {CUES.map((c, i) => {
      const fx = SFX[c.k];
      return (
        <Sequence key={i} from={Math.max(0, c.f + fx.desfase)} layout="none">
          <Html5Audio src={staticFile(`ui/sfx/${c.k}.wav`)} volume={(c.v ?? fx.vol) * MEZCLA * FX_GANA} toneFrequency={c.tono ?? 1} />
        </Sequence>
      );
    })}
  </>
);
const Sonido: React.FC = () => (
  <>
    <Sequence from={0} layout="none" name="música">
      <Html5Audio src={staticFile('ui/musica.wav')} volume={(fr: number) => MUSICA_VOL * MEZCLA * (1 - p(fr, FRAMES - 8, 7))} />
    </Sequence>
    <Sequence from={0} layout="none" name="aire">
      {/* el aire sostiene la cola tras el último golpe, cuando la música se apaga sola */}
      <Html5Audio src={staticFile('ui/sfx/aire.wav')} loop volume={(fr: number) => MEZCLA * FX_GANA * (0.03 + 0.1 * p(fr, FIN + 20, 30)) * (1 - p(fr, FRAMES - 6, 5))} />
    </Sequence>
    <Efectos />
  </>
);

/* ---------- composición ---------- */

export const Interfaces: React.FC<{cuadro?: number; sinSonido?: boolean}> = ({cuadro, sinSonido = false}) => {
  const actual = useCurrentFrame();
  const f = cuadro ?? actual;
  const cam = camara(f);
  const t = toque(f);
  const tq = enPantalla(cam, t.x, t.y);
  return (
    <AbsoluteFill style={{background: '#08090d', overflow: 'hidden', fontFamily: SANS}}>
      <Fondos f={f} cam={cam} />
      <Bento f={f} />
      <Camara cam={cam}>
        <Titulo f={f} />
        {f < BENTO + 14 ? <Escenas f={f} /> : null}
        <Marcos f={f} />
        <Cierre f={f} />
      </Camara>
      <Toque x={tq.x} y={tq.y} s={t.s * cam.k} presion={t.presion} onda={t.onda} />
      <Grano />
      {sinSonido ? null : <Sonido />}
    </AbsoluteFill>
  );
};


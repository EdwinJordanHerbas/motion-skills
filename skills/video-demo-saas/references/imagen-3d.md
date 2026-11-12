# Dispositivos 3D, pantallas nítidas y cámara

Código: `assets/codigo/mundo3d.ts` (mundo three.js), `assets/codigo/projection.tsx` (homografía) y, en `assets/codigo/Plantilla.tsx`, las partes `lapEstado`, `Portatil`, `movilPose`, `Moviles`, `Piezas3D`, `Mundo3D` y `camara`.

## Por qué modelados en código

El portátil y los móviles están hechos en three.js con geometría simple: losas redondeadas, instancias para las teclas y cilindros para la bisagra. Así no hay licencias de terceros, logotipos de fabricantes ni descargas, y se controla cada pieza: la tapa gira, la sombra se apaga, cada móvil se funde por separado. Hay modelos gratuitos (CC0, por ejemplo), pero descargar uno exige preguntar antes y apuntar su licencia. En el vídeo de referencia no hizo falta.

## Montaje

- **Un único lienzo WebGL** con fondo transparente (`alpha: true`, `setClearColor(0x000000, 0)`, `preserveDrawingBuffer: true`). Dibuja a 1,2× (`PR`) porque la cámara se acerca, y se muestra a 1080×1920 por encima del fondo y por debajo de la interfaz DOM.
- **Unidades = píxeles de la composición.** La cámara está a `D = 2400` con `FOV = 2·atan(H/2/D)`, así que el plano z = 0 cae 1:1 sobre los 1080×1920. Un objeto en z = 0 mide en pantalla lo que mide en el mundo, y la interfaz encaja sin cálculos.
- **Poses con el convenio de CSS:** `{x, y, z, rx, ry, s, o}`, con y hacia abajo y los ángulos en grados. En three.js: `position (x, -y, z)` y `Euler(-rx, ry, 0, 'XYZ')`.
- **Luz:** `RoomEnvironment` por PMREM (intensidad 0,95), una luz cálida principal desde arriba a la izquierda (`#fff4e6`, 1,5) y un contraluz (`#ffd7b8`, 1,1). Tono `NeutralToneMapping` (exposición 1,02) y salida sRGB.
- **Materiales:**

  | Pieza | Material |
  |---|---|
  | Aluminio | `MeshPhysicalMaterial` `#d3d0c9`, metalness 1, roughness 0,34, clearcoat 0,25 |
  | Aluminio oscuro (pozo del teclado, bisagra) | `#9d998f`, roughness 0,42 |
  | Cristal del bisel | `#060505`, roughness 0,1, clearcoat 1 |
  | Teclas | `MeshStandardMaterial` `#22201e`, roughness 0,62 |
  | Trackpad | `#c7c3bb`, metalness 0,85, clearcoat 0,6 |
  | Titanio de los móviles | Igual que el aluminio, con su propio material por móvil para fundirlo por separado |

- **Sombras falsas:** planos con un degradado radial en `CanvasTexture`, sin `depthWrite`. Son baratas y suaves, mejores que las sombras reales para este estilo.
- **Losas:** `ExtrudeGeometry` de un rectángulo redondeado con bisel de 5 segmentos (`losa(w, h, radio, grosor, bisel)`).
- **Teclado:** `InstancedMesh` de `RoundedBoxGeometry` con una distribución real de seis filas. Todas suman 15 unidades de ancho (fila de funciones de 14 teclas, espacio de 5,5 unidades) y van centradas en un pozo hundido, con un trackpad de 480×240 enmarcado. **Reserva capacidad de sobra** (100 instancias): si escribes más instancias que las reservadas, las últimas teclas desaparecen sin error. Ese fue el «teclado cortado».

## Puente con Remotion

```tsx
const Mundo3D: React.FC<{f: number}> = ({f}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mundo = useRef<Mundo | null>(null);
  const [listo, setListo] = useState(false);
  const [boot] = useState(() => delayRender('mundo 3D'));
  useEffect(() => {
    if (canvas.current && !mundo.current) { mundo.current = new Mundo(canvas.current); setListo(true); }
    continueRender(boot);
  }, [boot]);
  useLayoutEffect(() => {
    if (!listo || !mundo.current) return;
    const h = delayRender('dibujar 3D');
    mundo.current.render(lapEstado(f), [0, 1, 2].map((j) => movilPose(j, f)));
    requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h)));  // espera a que se pinte
  }, [f, listo]);
  return <canvas ref={canvas} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}} />;
};
```

Va dentro de la cámara 2D, igual que la interfaz, para que el 3D y el DOM se muevan juntos. `remotion.config.ts`: `Config.setChromiumOpenGlRenderer('angle')`.

## Pantallas nítidas: interfaz DOM proyectada

La interfaz es HTML normal: tablas, chips, tipografías. Se pega al cuadrilátero de la pantalla 3D con una homografía (`Mapped` y `toMatrix3d`, en `projection.tsx`), y por eso el texto sale nítido y no como una textura borrosa.

```tsx
<Mapped quad={quadPantalla(estado)} w={916} h={576} radius={10} opacity={o}>
  <Brief f={f} /><Editor f={f} />
</Mapped>
```

- `quadDe(pose, w, h, z)` proyecta un rectángulo del plano local z de un objeto (la cara del móvil), y `quadPantalla(l)` la pantalla del portátil, siguiendo el giro de la tapa.
- La interfaz encima lleva un brillo en diagonal que depende del giro (`linear-gradient(115 + ry·2 deg, …)`), para que parezca cristal.
- **Orden de capas:** el DOM va por encima del lienzo. Si un objeto 3D tiene que pasar por delante de una tarjeta DOM (los móviles posándose en la revisión), esa tarjeta se pone **antes** del lienzo en el árbol. Si una pantalla DOM no debe tapar a un objeto 3D que pasa delante, se apaga antes de que se crucen.
- **Si tienen que verse los dos a la vez** (un móvil delante de la pantalla encendida del portátil), recorta la pantalla DOM con la silueta del objeto. En una intro de marca 3D, la pantalla del portátil tapaba el cuerpo del móvil que tenía delante: se veía sin marco arriba y a la izquierda. `siluetaMovil(pose)` (en `mundo3d.ts`) proyecta las esquinas redondeadas de la cara y de la trasera del móvil y devuelve su envolvente convexa; la pantalla se recorta restándola con `clip-path: path(evenodd, …)`. Con la cara sola no basta: al girar, el canto asoma por fuera. Compruébalo en los fotogramas en que se cruzan.
  ```tsx
  const RecorteMovil = ({m, children}: {m?: Pose; children: React.ReactNode}) => {
    if (!m) return <>{children}</>;
    const sil = siluetaMovil(m).map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L');
    const d = `M-10 -10H${W + 10}V${H + 10}H-10Z M${sil} Z`; // todo el cuadro menos el móvil
    return <div style={{position: 'absolute', inset: 0, clipPath: `path(evenodd, "${d}")`}}>{children}</div>;
  };
  // <RecorteMovil m={movilDelante ? poseMovil : undefined}><Mapped quad={quadPantalla(estado)} …>…</Mapped></RecorteMovil>
  ```
  Si cambias el radio de las esquinas o el grosor del cuerpo del móvil, pásalos también a `siluetaMovil(pose, radio, grosor)`.

## Entrada del portátil (la que no se ve cortada)

Fallo real: subía desde 1.100 px por debajo del encuadre e inclinado hacia fuera. Los primeros fotogramas enseñaban media base desde abajo («medio cortado, como si fuese un vídeo»). Cómo se hace bien (`lapEstado`):

1. **Llega cerrado, entero y de frente, visto desde arriba:** `rx` de −34° a 6°, `ry` de −18° a 0°, escala 0,7 → 1 (sobre su tamaño en reposo) y z −1.700. Con `rx` negativo se ve la cara de arriba y con positivo la de abajo, así que comprueba el signo. No lo dejes girado en reposo: el giro acerca un lado y su teclado a la cámara, y ese lado se sale del cuadro.
2. **Gira sobre el centro de la base, no sobre la bisagra:** se interpola el centro y se calcula la bisagra con `bisagra = centro − R·(0, 0, 340)·s` (`aCentro`). Al terminar, la pose cae exactamente en la de reposo.
3. **Abre la tapa cuando ya no se inclina hacia la cámara:** de 3° a 98° en 24 fotogramas, empezando 8 después de la entrada. Si la abres mientras se inclina hacia la cámara, la tapa barre hacia el objetivo y el portátil se hace más ancho que el cuadro durante unos fotogramas. La pantalla DOM no existe hasta que la tapa pasa de 55°, sale oscura y se enciende con un destello blanco radial.
4. **Aparece de una vez:** se funde la opacidad del lienzo entero (5 fotogramas), no la de los materiales. Si fundes los materiales, todos son transparentes y se ve el teclado a través de la tapa.
5. **La sombra de la tapa solo existe con la tapa levantada.** Está en el plano de detrás de la tapa: con la tapa cerrada flotaría 160 px por encima del portátil.
6. **Sale hacia el fondo:** primero se apaga la pantalla (7 fotogramas), después retrocede 1.400 en z y se funde al final, mientras suben los móviles por delante.
7. **Mismo margen que el resto de tarjetas.** El borde delantero del teclado es la parte más ancha del portátil. Elige la escala para que, con el empuje de cámara más cercano, deje unos 110-130 px a cada lado (en la plantilla, `LAP_S = 0.74`: 830 px de ancho como mucho). Un portátil que roza el borde parece un vídeo pegado encima («como si te pega un vídeo y pum»), y un cliente pidió cambiarlo.
8. **Centra en el cuadro el objeto más ancho, no en la zona segura.** Con la cámara anclada en el centro de la zona segura, un objeto casi tan ancho como el cuadro queda más cerca de un borde que del otro. Mueve el objeto, no la cámara: `LAP.cx = 540 + (540 − AX) / (G · z)`. Su pantalla y sus rótulos siguen dentro de la zona. Con la cámara desplazada en horizontal, Chrome dejó de pintar el lienzo 3D a partir de un fotograma concreto, y todos los fotogramas siguientes salieron en blanco.
9. **Lo que depende del tamaño del portátil se calcula desde su pose 3D:** la línea de la tapa de la que salen los rótulos (`TAPA`, desde `quadPantalla` en reposo más el marco) y el punto del editor del que despegan las piezas (`enPantalla`, interpolando en el cuadrilátero de la pantalla). Con números fijos, al cambiar la escala, el rótulo sale del aire y las piezas despegan fuera de la pantalla.
10. **Comprueba el encuadre** antes de renderizar, con `scripts/caja.py` sobre una vista previa: da el ancho y el centro del objeto oscuro en cada fotograma y avisa si toca el borde o sale de 65-1015. `assets/codigo/encuadre_portatil.py` proyecta las esquinas con la misma cámara, sin renderizar.

## Móviles

- Cuerpo de titanio (`losa(330, 700, 58, 26, 4)`), cristal frontal, tres botones y una sombra. Pantalla de 304×674 en el plano z = 13,4.
- Entran con un muelle desde 420 px más abajo, inclinados 28° hacia atrás, uno detrás de otro (cada 3 fotogramas). Son opacos casi desde el principio (`opacidad = c01(ent · 5)`), para no verse como fantasmas.
- Flotan: `y + sin(f/22 + j)·7` y `ry + 2,5·sin(f/30 + j)`. Los de los lados giran ±20° y están 140 más atrás.
- La app vertical (`PantallaMovil`) es genérica, sin la marca de ninguna plataforma. Lleva subtítulos quemados, iconos, el usuario, una etiqueta opcional (por ejemplo «Publicidad») y la notificación de «publicado». En la plantilla, una captura en `ajustes.capturas.moviles` la sustituye.

## Cámara 2D

Una sola transformación sobre todo el escenario (`Camara`): `translate(AX, AY) rotate(r) scale(z) translate(−x, −y)`, con `AX = 496`, `AY = 790` y el mundo al 86 % (`G`): el centro de la zona segura, no el del cuadro (`references/atencion-ojo.md`).

- **Fotogramas clave** `{f, x, y, z}` interpolados con `E.io`, colgados de los mismos momentos que la animación.
- **Cámara en mano:** `x + 5·sin(f/43) + 2·sin(f/17)`, `y + 4·cos(f/37) + 1,5·sin(f/13)` y un giro de 0,2°·sin(f/57).
- **Golpes:** en cada momento fuerte (enviar, corte, sello, clic), el zoom sube un 1,4 % durante 6 fotogramas.
- **Fondo con paralaje:** el fondo se mueve un 18 % de lo que se mueve la cámara y escala un 25 % de su zoom.
- **Acercamientos:** de 0,92 a 1,2. Acércate cuando hay texto que leer y aléjate cuando entra algo grande.

## Lienzos con margen

Cuando la cámara 2D aleja o sube el plano (por ejemplo, para centrarlo en la zona segura), el borde del mundo de 1080 × 1920 queda dentro del cuadro. Lo que sale del mundo, como el móvil que cae o las monedas, se corta en el borde del lienzo. La solución es que el lienzo cubra un margen alrededor del mundo:

```ts
export const MARGEN = {l: 140, r: 140, t: 60, b: 760}; // solo lo necesario
export const CW = W + MARGEN.l + MARGEN.r, CH = H + MARGEN.t + MARGEN.b;
// misma proyección, ventana más grande: el píxel (x + l, y + t) del lienzo es el píxel (x, y) del mundo
cam.setViewOffset(W, H, -MARGEN.l, -MARGEN.t, CW, CH);
renderer.setSize(CW * PR, CH * PR, false);
// y en el DOM: <canvas style={{left: -MARGEN.l, top: -MARGEN.t, width: CW, height: CH}} />
```

El proyector que sitúa las pantallas del DOM (`aPantalla`) se queda sin margen, porque trabaja en coordenadas del mundo. Si el plano se ve más pequeño, baja `PR` (en la plantilla, de 1,5 a 1,2) y el lienzo, aunque es mayor, pesa más o menos lo mismo.

**Memoria.** Tres lienzos WebGL grandes con antialias y `preserveDrawingBuffer`, por cuatro pestañas de render, llenan la memoria de Chrome. Se nota en fotogramas en blanco o en el error «Chrome ran out of memory». Hay tres medidas:

- el margen justo, solo donde algo sale del mundo;
- montar cada lienzo solo mientras su escena está en pantalla, con `dispose()` y `forceContextLoss()` al desmontar;
- soltar el `delayRender` de arranque después del primer dibujo, no al crear el mundo, porque si no la primera captura de una pestaña puede salir con el lienzo vacío.

## Halo de monedas

Una lluvia de 32 monedas y 10 billetes saliendo por los costados (la sección siguiente) no convenció al cliente: era mucho movimiento sin dirección. La sustituyó un plano de producto:

- **Diez monedas grandes con €**, sin billetes. Salen una tras otra cada 1,5 fotogramas, en el sentido de las agujas del reloj alrededor del móvil, con un muelle `(13, 120, 0.8)` y un pequeño arco. El ojo sigue la vuelta.
- **Dos capas.** Las de detrás (z −70 a −170, escala 0,85-1) van en un lienzo `Dinero` colocado **antes** del lienzo del mundo 3D: el móvil las tapa y solo asoman por sus bordes. Las de delante (z 220-360, escala 1,2-1,45 × 1,22) van en otro lienzo después de las pantallas, nacen en el borde más cercano del móvil y nunca cruzan su pantalla. `Lluvia3D` recibe `delante` y pinta solo su capa.
- **Que se vea la cara.** La moneda (`CylinderGeometry` con `rotateX(π/2)`) ya mira a cámara con `rx = 0`. Inclínala solo de 10 a 25°. Con `rx` de 62°, que era lo que hacía falta antes de ese giro, se ven casi de canto y oscuras. El giro rápido sobre la vertical (`ry` de 540° a 0) se asienta en un vaivén lento.
- **Que brille.** De frente, el metal refleja la habitación oscura que hay detrás de la cámara: en la cara, metal 0,55, rugosidad 0,34 y exposición del lienzo a 1,2.
- **Que no se ensucie.** Una moneda de detrás que cae bajo la sombra semitransparente del móvil sale lavada: quítala o escóndela del todo.
- **Salida.** Al final caen con el móvil, cada una con un desfase de 0 a 3 fotogramas.

## Móvil estrella: inclinado, feed, asombro, giro y dinero

El momento de emoción de la plantilla. `heroPose`, `Feed`, `PantallaPago` y `Lluvia3D` están en `assets/codigo/Plantilla.tsx`, y `Dinero` en `assets/codigo/mundo3d.ts`.

- **La pose admite `rz`** (giro en el plano, como `rotateZ` de CSS): `Euler(-rx, ry, -rz, 'XYZ')`. Con ese orden el móvil primero se tuerce en su plano, luego gira y después se tumba: es la postura «isométrica» de las demos.
- **Inclinación**: con un muelle de `(18, 110, 1)` el móvil va de su sitio a `rx 36, ry 12, rz −14, escala 1,38`, y flota (`ry ± 3`, `y ± 6`). Los dos laterales salen volando hacia fuera (±620 px, girando 40° y 12°) en 16 fotogramas.
- **Feed que acelera**: dos columnas de mosaicos (140×228, separados 8, la segunda desplazada un 42 %) con piezas variadas: cara, formas abstractas, charla y frase. Todas llevan un @usuario y, si hace falta, una etiqueta como «Publicidad». En la plantilla, una captura larga en `ajustes.capturas.feed` sustituye a los mosaicos y se desplaza igual. Desplazamiento `2600·t^2,6` px en 72 fotogramas y después al 55 % de la velocidad alcanzada; desenfoque `min(5, velocidad·0,05)` px. Entra con un zoom de 2,05 a 1 desde el clip que ya se veía. Solo se pintan las 5 filas visibles.
- **Asombro**: fogonazo crema en la pantalla (90 % que se apaga en 12 fotogramas), un `Destello` de radio 420, un golpe de cámara cuatro veces mayor que el normal, temblor de 6 px durante 10 fotogramas y el halo del fondo encendido.
- **Giro**: `giroT = p(f, GIRO, 24, E.io)`. Mientras gira 360° en `ry`, el móvil se endereza (`rx 4, rz 0`), se centra y baja a escala 1,2, con un pequeño amago hacia atrás de 14° justo antes. **El contenido cambia a mitad de giro** (`giroT > 0,5`), cuando el móvil está de espaldas. **La trasera existe**: cristal mate, meseta con tres cámaras y sin logotipos.
- **Pantalla de espaldas**: `area(quad)` (área con signo del cuadrilátero proyectado) es positiva si la pantalla mira a cámara. La interfaz DOM se funde según `c01((area/ref − 0,03)/0,12)`: de espaldas no se pinta y de canto se apaga antes de que la homografía se dispare.
- **Dinero**: 32 monedas (`CylinderGeometry` con caras de oro y € en una textura de lienzo) y 10 billetes genéricos (plano curvado, verde menta con €, **sin imitar billetes reales**), con `InstancedMesh`. **Salen por los costados del móvil, nunca por el centro de la pantalla**: la primera versión las lanzaba desde el centro y tapaban justo la pantalla de pagos y el rótulo. Cada pieza nace en un borde (x = 540 ± 205), vuela hacia fuera y cae, con trayectorias balísticas deterministas: monedas `vx ±420-1140, vy 480-1120 px/s`, gravedad 2.600; billetes `vx ±300-680, vy 300-540`, gravedad 1.350, con vaivén y aleteo. **Calcula el vértice** (`vy² / 2g`) para que nada suba hasta el rótulo. Una de cada cuatro monedas vuela hacia cámara (`vz` hasta 950) y crece: da profundidad sin cruzar la pantalla, porque ya está fuera de ella. Primero sale un golpe de 10 monedas con la pulsación y después un chorro corto de 18 fotogramas. Las semillas salen de `hash(i, k)`, nunca de `Math.random()`.
- **Segundo lienzo**: el DOM se pinta encima del lienzo 3D, así que lo que sale **delante** de una pantalla DOM necesita su propio lienzo, colocado después de esa pantalla en el árbol (`Lluvia3D` va después de `Moviles`). Es un `WebGLRenderer` aparte con la misma cámara.
- **Salida**: el móvil da un saltito (34 px) y cae entero fuera de cuadro con el dinero (`y +1550`, `rx +26`, `rz +9`, 15 fotogramas con `E.in`), con un «whoosh». La pantalla no se apaga: baja pegada al móvil y el lienzo se oculta cuando ya está fuera. **No lo funda en el sitio**: alejarlo y apagarlo deja una losa gris translúcida (la pantalla 3D sin interfaz) y, si pantalla y lienzo se apagan a la vez, un círculo blanco suelto. El cambio de fondo a la escena siguiente nace con la tarjeta que llega (2 fotogramas antes y desde su centro), no en un cuadro vacío.

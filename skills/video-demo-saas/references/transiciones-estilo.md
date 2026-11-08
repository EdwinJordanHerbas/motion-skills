# Rótulos, transiciones conectadas y acabado corporativo

Casi todos los componentes que se citan aquí (`pum`, `Destello`, `NEU`, `VIDRIO_OSCURO`, `Chat`, `Vuelo`, `Lockup`, `Cuchilla`, `Feed`, `Insignias`, `PantallaPago`, `Lluvia3D`, `Tecleado`, `CAPAS`, `Fondo`, `Cursor` y `Piezas3D`) están en la plantilla, `assets/codigo/Plantilla.tsx`. `Titular`, `VIDRIO`, `Aurora`, `Burbuja` y `miniatura` son de la versión con voz del vídeo de referencia y no vienen en la plantilla: lo que hay aquí basta para construirlos.

## Curvas y utilidades

```ts
const E = {
  out: Easing.bezier(0.2, 0.7, 0.2, 1),  // entradas: frenan al llegar
  io: Easing.bezier(0.65, 0, 0.2, 1),    // desplazamientos y cámara
  in: Easing.bezier(0.5, 0, 0.75, 0),    // salidas: aceleran al irse
  snap: Easing.bezier(0.3, 0, 0, 1),     // cambios de estado (aprobado, rechazado)
};
const p = (f, a, d = 14, e = E.out) => interpolate(f, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a, b, t) => a + (b - a) * t;
const c01 = (x) => Math.min(1, Math.max(0, x));
const sp = (f, a, damping = 15, stiffness = 140, mass = 0.9) => spring({frame: f - a, fps: 30, config: {damping, stiffness, mass}});
```

- **Pop de aparición:** `scale(0.7 + 0.3·sp(f, a, 10, 220, 0.6))` con opacidad `c01(e·1.4)`. Cada pop lleva su sonido `pop`.
- **Tarjetas que llegan:** muelle `sp(f, a, 16, 120, 1)`, con `translateY((1 − e)·60…700)` y un desenfoque que se va.
- **Tarjetas que se van al fondo:** `translateY(−260·back) translateZ(−320·back)`, desenfoque de 6 px y opacidad al 15 %. Así se ven detrás de la siguiente, como capas.

## Acabado: cristal y neumorfismo

Cristal esmerilado para los paneles: mensaje, desplegable, revisión, informe y formulario.

```ts
const VIDRIO = {
  background: 'linear-gradient(140deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.55) 100%)',
  backdropFilter: 'blur(28px) saturate(170%)',
  border: '1.5px solid rgba(255,255,255,0.92)',
  boxShadow: '0 50px 120px rgba(60,40,20,0.16), 0 10px 30px rgba(60,40,20,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(120,100,80,0.06)',
};
const VIDRIO_OSCURO = {  // avisos y chips oscuros
  background: 'linear-gradient(140deg, rgba(38,35,30,0.88) 0%, rgba(22,20,17,0.76) 100%)',
  backdropFilter: 'blur(24px) saturate(140%)',
  border: '1.5px solid rgba(255,255,255,0.14)',
  boxShadow: '0 40px 100px rgba(40,25,10,0.32), inset 0 1px 0 rgba(255,255,255,0.12)',
};
```

Neumorfismo suave para los controles: chips, adjunto, botón de enviar, opciones y campo de correo.

```ts
const NEU_FONDO = '#f2efe9';
const NEU_S  = '3px 3px 8px rgba(160,145,125,0.30), -3px -3px 8px rgba(255,255,255,0.95)';         // relieve
const NEU_IN = 'inset 4px 4px 10px rgba(160,145,125,0.30), inset -4px -4px 10px rgba(255,255,255,0.95)';  // hundido
```

- El estado activo rompe el neumorfismo: la opción elegida o el botón listo pasan al color de acento con sombra de color. El botón inactivo es neumórfico con una flecha gris, y el campo con foco suma un anillo de acento.
- **El cristal necesita algo que desenfocar.** Detrás va `Aurora`: tres manchas radiales que derivan despacio (naranja al 22 %, melocotón al 32 % y azul frío al 18 %). Se apaga en el gancho, para que la apertura quede limpia.
- **Fondos por acto (`CAPAS`):** estudio (degradado con suelo en perspectiva), puntos (rejilla que se desplaza) y piedra. Se cambian con un **revelado circular** (`clip-path: circle(R at x y)`, 16-18 fotogramas) desde el punto de la acción, con un anillo fino de acento que se apaga. Todo claro y con viñeta suave.

## Rótulos de producto: línea en tinta y línea gris

> Dónde y cuándo va cada rótulo lo decide `references/atencion-ojo.md` (componente `Rotulo`, junto a su objeto y dentro de la cámara). Lo de abajo es su aspecto. La franja fija de arriba (`Titular`) quedó atrás: el cliente la vio poco profesional y compite con la acción.

Así son en la versión final del vídeo de referencia. **No uses una palabra en color de acento con subrayado:** el cliente la vio en una versión anterior y dijo que «queda muy poco profesional». Tampoco la tipografía condensada en mayúsculas de la web: un vídeo demo pide la letra de una interfaz de producto.

- Una sola familia sans de producto (Instrument Sans, Inter o la del producto), peso 700, interletraje −0,035 em, interlineado 1,04, en minúscula normal.
- **Línea principal** en tinta a 84 px (120 px en la llamada a la acción); **línea secundaria** en gris cálido (`#8b867c`) a la mitad, peso 500. La principal dice el hecho y la gris lo matiza: «Sube tu factura.» / «En PDF o en foto.».
- `textWrap: 'balance'` en la principal: sin él, el navegador puede dejar la última palabra («clips.») sola en la segunda línea.
- Centrada en `top: 236`, con márgenes de 70 px.

```tsx
const DISPLAY = {fontFamily: TEXTO, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.04};
{ws.map((w, i) => {
  const a = sp(f, at + i * 3, 17, 170, 0.8);   // una palabra cada 3 fotogramas
  const x = p(f, out + i, 8, E.in);            // sale en cascada
  const bl = (1 - c01(a)) * 9 + x * 9;          // desenfoque al entrar y al salir
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.04em 0.03em 0.16em', margin: '0 0.11em -0.16em'}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - a) * 105 - x * 112}%)`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined}}>{w}</span>
    </span>
  );
})}
// La línea gris entra en at + 3·palabras + 3: sube 18 px y se enfoca; sale con la principal.
```

- **Relevos sin pisarse.** Un rótulo de n palabras termina de salir en `out + (n − 1) + 8`; el siguiente empieza unos 6-10 fotogramas después. Calcula los dos fotogramas a la vez.
- Con voz, cada palabra entra en su fotograma de voz − 5 (`palabras(id)`, ver `voz.md`). Sin voz, `at` es un fotograma del guion.
- Una frase larga se parte por sentido, no por longitud.

## Magia: aparecer de golpe («¡pum!»)

Para los elementos que deben sentirse especiales (la respuesta del chat, el icono de la marca, las insignias, una tarjeta nueva, el sello). Componentes: `pum`, `pumStyle` y `Destello`.

- **El elemento**: `spring({damping: 9, stiffness: 210, mass: 0.6})`, con escala `0.35 + 0.65·s` (se pasa de largo hasta 1,13 y vuelve), opacidad en 4 fotogramas y un desenfoque de 12 px que se va en 8.
- **El destello, detrás**: un fogonazo radial blanco-crema que crece de 0,3 a 1,4 y se apaga en 11 fotogramas; un anillo cálido (`rgba(255,183,100)`) que se abre en 17; y diez chispas de cuatro puntas (blanco, oro y naranja claro, con resplandor) que salen en estrella, giran y se apagan en unos 20 fotogramas. Todo determinista: ángulo y distancia salen del índice.
- **Sonido**: `pop` siempre, y `magia` (centelleo) solo en los importantes, bajo (0,10-0,22): en todos cansa.
- Úsalo con medida: uno cada segundo como mucho, salvo en una ráfaga buscada (las insignias del feed).

## Acabado neumórfico completo

Cuando el cliente pide «neumórfico», no basta con chips: el fondo y las tarjetas deben ser **del mismo color** para que la doble sombra se lea.

```ts
const NEU = {
  fondo: '#ece9e3',                 // el fondo de todo
  alto: '#f4f1ec',                  // superficies en relieve
  sombra: '22px 22px 50px rgba(160,146,126,0.42), -18px -18px 44px rgba(255,255,255,0.95)',   // tarjetas
  sombraS: '8px 8px 18px rgba(160,146,126,0.40), -7px -7px 16px rgba(255,255,255,0.95)',      // burbujas, chips
  hundido: 'inset 6px 6px 14px rgba(160,146,126,0.36), inset -6px -6px 14px rgba(255,255,255,0.92)',  // campos, casillas
};
```

- El estado activo pasa a **tinta con texto blanco** (casilla marcada, opción elegida, botón listo, «Aprobado»): se lee al instante y es más sobrio que el color de acento.
- Fondos por acto con el mismo revelado circular, pero con anillo blanco en vez de color. Para el acto estrella, un halo cálido detrás del objeto que se enciende en el momento de asombro.
- El cristal oscuro queda solo para avisos.

## Tecleado

- Letra a letra, con fotogramas de tecla propios: pausas de 2-4 fotogramas y más largas tras `.` y `,`, nunca regulares.
- **Agrupa por palabras** (`/\S+|\s+/g`, con cada palabra en un `inline-block`): sin esto, el navegador parte una palabra o deja «¿» solo al final de una línea. Fue un fallo real.
- Cada letra cae 6 px y aparece en 2-3 fotogramas. Detrás, un cursor de texto en tinta que parpadea.
- Cada letra lleva su sonido de tecla (ver `sonido.md`).

## Cursor

- Ruta por fotogramas clave con una curva suave (`bend = sin(π·t)·0,12`, alternando el sentido) y `E.io`.
- **Para antes de cada clic:** un clave a −5/−6 fotogramas y otro a +3 en casi el mismo punto. Así el cursor llega, se detiene, pulsa y sigue; antes clicaba en movimiento y no parecía una persona.
- Sobre algo clicable pasa a la mano (9 fotogramas antes y 5 después del clic). Al pulsar se encoge un 12-14 % y suelta un anillo de acento que crece hasta 144 px y se apaga en 18 fotogramas.

## Transiciones conectadas (de un acto al siguiente)

| Relevo | Cómo | Dónde |
|---|---|---|
| Mensaje → marca (con voz) | El cabezal (la línea de acento con punta) baja, corta la burbuja y se queda como el corte del logotipo de texto | `CAB`, `Burbuja`, `MarcaInicio` |
| Marca → portátil | La marca sube 240 px desenfocándose mientras el portátil llega cerrado por debajo, gira y abre la tapa | `MarcaInicio`, `lapEstado` |
| Brief → editor | La misma pantalla cambia de contenido con un fundido; el portátil pasa a estar de frente | `Brief`, `Editor`, `flat` |
| Editor → móviles | Cada pieza sale de su tramo en la regla, vuela en arco (`arc·160` px de altura, `translateZ`) y aterriza en la caja proyectada de la pantalla de su móvil | `Piezas3D`, `cajaDe(quadDe(…))` |
| Móviles → revisión (con voz) | Los móviles se encogen hasta la posición y el tamaño de las miniaturas de la tarjeta (`MINI`, con el mismo formato que la pantalla, 60×133), y la tarjeta se posa debajo. Las miniaturas aparecen mientras los móviles se funden | `movilPose` (`enc`), `miniatura`, `Revision` |
| Revisión → informe | La revisión se va al fondo (z −320, desenfoque) y el informe llega delante | `Revision` (`back`), `Informe` |
| Botón → formulario | El botón de la llamada a la acción se transforma en el formulario | `CTA.morph` |
| Enviar → aviso → marca | Avión de papel en curva con estela discontinua, aviso de cristal oscuro y el cabezal baja y firma | `Avion`, `Aviso`, `Final` |
| Chat → marca (sin voz) | La respuesta sale del chat al centro (el chat se desenfoca y baja), una barra del color de acento la corta en dos y encoge hasta ser el glifo del icono de la app, que aparece con destello | `Vuelo`, `CAB`, `Cuchilla`, `Lockup` |
| Tres móviles → móvil estrella (sin voz) | Los laterales salen volando hacia fuera girando; el central se inclina (rx 36, rz −14, ry 12) y su pantalla pasa de la pieza a un feed que arranca con un zoom desde 2,05 | `movilPose`, `heroPose`, `Feed` |
| Feed → asombro → giro → pago (sin voz) | El feed acelera (`2600·t^2,6` px) con desenfoque según la velocidad; en el asombro, fogonazo en la pantalla, destello grande, golpe de cámara y temblor de 10 fotogramas; el móvil se endereza mientras gira 360°, de espaldas se ve la trasera y al volver la pantalla ya es la de pagos | `scrollFeed`, `giroT`, `PantallaHero` |
| Pago → dinero → revisión (sin voz) | «Pagos enviados» y de la pantalla salen monedas y billetes 3D hacia la cámara; el móvil se aleja girando y la revisión aparece con destello delante | `monedaPose`, `billetePose`, `Revision` |

Regla general: **lo que sale se convierte en lo que entra**, o al menos se queda en el mismo sitio. Busca un elemento compartido (un clip, una pantalla, una línea) y anímalo de una posición a la otra.

## Tablas: resaltar una columna

Cuando el mensaje es una columna (por ejemplo, «Importe»), el resaltado tiene que encajar exacto o se nota enseguida (un cliente lo vio a la primera):

- Rejilla de anchos fijos que sumen el ancho interior de la tarjeta (`100 + 148 + 112 + 124 + 132 + 224 = 840`). Nada de `1fr` en la columna resaltada.
- El pozo hundido (`NEU.fondo` + `NEU.hundido`, radio 18) va exactamente sobre su pista: `left` = suma de las columnas anteriores y `width` = la suya. Sobresale 8 px arriba y abajo, nunca a los lados.
- Se pinta **encima** de las filas, para tapar sus líneas en esa columna. Los valores van en una capa aparte por encima, centrados, con la misma altura de fila. Sin reinicio `border-box`, cada fila mide su alto más su línea de 1,5 px: cuéntala.
- El estado malo («Excluido») lleva una pastilla roja suave dentro del pozo, con margen, en vez de teñir la celda hasta los bordes.
- El pozo crece de arriba abajo en 14 fotogramas y la cabecera pasa de gris a tinta.

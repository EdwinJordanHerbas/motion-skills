# Plantilla «Tu marca»

Un vídeo demo vertical completo, sin voz, de 988 fotogramas a 30 fps (32,9 s), en un solo plano continuo:

1. **Chat.** Un cliente escribe su mensaje con un archivo adjunto y llega la respuesta.
2. **Marca.** Una barra del color de acento corta la respuesta y se convierte en el icono de la marca.
3. **Portátil.** Llega cerrado, abre la tapa y enseña un panel con cinco pasos y un sello.
4. **Editor.** Una línea de tiempo se recorre y se corta en tres piezas.
5. **Móviles.** Las tres piezas saltan a tres móviles. El del centro se inclina, su feed se acelera, gira y suelta un halo de monedas.
6. **Revisión, informe y formulario.** Tres tarjetas: dos aprobados y un rechazo, un informe con su columna destacada y un formulario que se rellena y se envía.
7. **Cierre.** Vuelve la marca con su lema.

Como en una plantilla de After Effects, no hace falta tocar la animación: **todo lo que cambia de un vídeo a otro está en `ajustes.ts`**. Ahí van el nombre, el lema, el color de acento, la tipografía, los textos de cada escena, el símbolo de las monedas, las capturas para las pantallas y el sonido. La duración es fija, así que un texto más largo no descuadra nada (el tecleo se ajusta a su hueco). Lo que sí puede pasar es que no quepa: respeta los máximos que indica cada campo y revisa con fotogramas sueltos.

## Cómo usarla

1. Copia esta carpeta entera a tu proyecto, por ejemplo a `src/plantilla/`. Los archivos se importan entre sí con rutas relativas.
2. Instala lo que usa: `npm i three @remotion/fonts` y `npm i -D @types/three`. Se ha probado con Remotion 4.0.541 y three 0.181.
3. En `remotion.config.ts`, añade `Config.setChromiumOpenGlRenderer('angle');`. Sin eso, el 3D puede salir negro al renderizar.
4. Regístrala en `src/Root.tsx`:

   ```tsx
   import {defaultProps} from './plantilla/kit-plantilla';
   import {FRAMES, Plantilla} from './plantilla/Plantilla';

   <Composition id="Plantilla" component={Plantilla} durationInFrames={FRAMES} fps={30} width={1080} height={1920} defaultProps={defaultProps} />
   ```

5. Rellena `ajustes.ts` y mira el resultado con `npx remotion studio`. Para revisar, pon la prop `zonas` a `true`: se pinta en rojo lo que tapa la interfaz de la red.

## Los huecos de las pantallas

Cada pantalla trae una interfaz de muestra hecha en código. Para enseñar tu producto, pon una captura en `ajustes.capturas`. Las rutas son relativas a `public/`.

| Hueco | Dónde se ve | Tamaño |
|---|---|---|
| `panel` | Portátil, primera pantalla | 916 × 576 |
| `editor` | Portátil, segunda pantalla (las tres piezas siguen saliendo de su línea de tiempo) | 916 × 576 |
| `moviles[0..2]` | Los tres móviles | 304 × 674 |
| `feed` | El móvil inclinado. Se repite hacia abajo y se desplaza cada vez más rápido | 304 de ancho, tan alta como quieras |
| `resultado` | El móvil después del giro, con las monedas | 304 × 674 |

Sirven el doble de esos tamaños, para que se vean nítidas. Si prefieres una pantalla animada, sustituye el componente correspondiente de `Plantilla.tsx` (`Brief`, `Editor`, `PantallaMovil`, `Feed` o `PantallaPago`). Se pintan en DOM y se pegan a la pantalla 3D con `Mapped`.

## Sonido

La plantilla no tiene voz. La música y los efectos se activan en `ajustes.sonido`:

- **Efectos:** genéralos con tu clave de ElevenLabs, `uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<carpeta>`, y pon esa carpeta en `efectos`. Si prefieres tus propios sonidos, usa los mismos nombres (`pop.wav`, `slice.wav`…). Cada efecto ya está colocado en el fotograma de lo que lo produce (`CUES` en `Plantilla.tsx`).
- **Música:** `plan-musica.json` es el plan por tramos de esta plantilla para la música de ElevenLabs. Genera la música con `uv run scripts/elevenlabs.py musica plan-musica.json musica.mp3`, nivélala con `scripts/nivelar_musica.py` y pon el archivo en `musica`. Los tramos y el golpe final están en `timeline.json` (`music.sections` y `music.end`). La duración de la plantilla se comprueba contra `timeline.json` al cargar.

## Archivos

| Archivo | Qué es | Depende de |
|---|---|---|
| `Plantilla.tsx` | La composición: guion por constantes encadenadas, cámara anclada en la zona segura (`ZONA`, `AX`, `AY`, `G`), fondos que cambian de luz (`CAPAS`), `Rotulo` (texto junto a su objeto, con entradas `sube`, `detras` y `lado`), magia (`pum`, `Destello`), chat, vuelo de la respuesta, barra que corta (`Cuchilla`), portátil, móviles, `Feed`, `Insignias`, giro, halo de monedas (`HALO`, `Lluvia3D`), revisión, informe, formulario, cursor y sonido | todos los demás |
| `ajustes.ts` | Lo que se rellena: marca, color, tipografía, cuentas, textos, moneda, capturas y sonido | — |
| `kit-plantilla.tsx` | Colores `C`, tipografías `TEXTO` y `MONO`, curvas `E`, `p()`, `mix()` y `alfa()` | `ajustes.ts`, `@remotion/fonts` |
| `mundo3d.ts` | El mundo three.js: cámara 1:1 con la composición, portátil con tapa que se abre, móviles con trasera, `quadDe` y `quadPantalla` para proyectar pantallas, `area()` para saber si una pantalla mira a cámara, `siluetaMovil` para recortar una pantalla DOM por donde pasa un móvil por delante, la clase `Dinero` (monedas en `InstancedMesh`, en su propio lienzo) y lienzos con margen (`MARGEN`, `setViewOffset`) | `three`, `three/examples/jsm` (RoomEnvironment, RoundedBoxGeometry), `geometry.ts`, `projection.tsx` |
| `projection.tsx` | `Mapped` y `toMatrix3d`: pega un `div` a un cuadrilátero con una homografía CSS | `three` (solo para `makeProjector`), `motion.ts` |
| `geometry.ts` | `roundedRect` (rectángulo redondeado como `THREE.Shape`), tubo y texturas | `three`, `motion.ts` |
| `motion.ts` | Curvas y poses de cámara que usan `projection.tsx` y `geometry.ts` | `remotion`, `three` |
| `timeline.json` | Duración, tramos de música y momentos clave de la plantilla | — |
| `plan-musica.json` | El plan por tramos para la música de ElevenLabs | — |
| `encuadre_portatil.py` | Simula la entrada del portátil y comprueba que cabe en el encuadre | numpy (`uv run`) |

## Si cambias la historia

- Los momentos son constantes encadenadas al principio de `Plantilla.tsx` (`SEND`, `MARCA_AT`, `LAP_IN`, `GIRO = ASOMBRO + 8`…). Si cambias una, se mueve todo lo que va detrás, y también la duración: actualiza `timeline.json` y vuelve a hacer la música.
- La cámara (`CAM`), los fondos (`CAPAS`), los golpes de cámara (`KICKS`) y los efectos (`CUES`) cuelgan de esas constantes.
- Las posiciones de los rótulos están en `Rotulos`, al final del archivo, y todas caen dentro de la zona segura. Si mueves uno, compruébalo con `zonas: true` y con `scripts/zonas.py`.
- Lee `references/estructura.md` antes de cambiar los actos y `references/atencion-ojo.md` antes de mover rótulos.

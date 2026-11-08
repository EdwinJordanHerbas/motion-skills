---
name: video-demo-saas
description: Método para hacer vídeos demo verticales de un SaaS o servicio (1080×1920, 25-35 s) con aspecto de producto profesional, en Remotion y three.js. Dispositivos 3D modelados en código con la interfaz real y nítida, rótulos legibles sin sonido, neumorfismo, transiciones conectadas, apariciones «mágicas», un móvil que gira y suelta monedas 3D, voz opcional, y efectos y música de ElevenLabs sin silencios muertos. Incluye una plantilla completa sin voz que se rellena con un archivo de ajustes, la receta de 27 efectos de interfaz y scripts para generarlos, medir volumen y silencios, nivelar la música y cortar teclas. Úsala cuando el usuario pida un vídeo demo, un anuncio vertical, un reel o un short de su producto, una explicación animada de una app o una web, o un vídeo para captar clientes, aunque no diga «Remotion» ni «3D». También sirve para revisar uno o para hacer solo su sonido (voz, efectos o música).
license: Apache-2.0
compatibility: Proyecto Remotion 4 con three.js, Node.js, uv (Python 3.10+) y ffmpeg. El sonido con ElevenLabs es opcional y necesita red y una clave propia. Solo se ha probado en Windows.
metadata:
  version: "0.1.0"
---

# Vídeo demo SaaS vertical

Un vídeo de este tipo cuenta **un caso de uso real de principio a fin**, con la interfaz real del producto sobre dispositivos 3D. Todo va encadenado: cada elemento nace del anterior. Se entiende sin sonido, porque cada paso tiene su rótulo, y no tiene ni un segundo de aire muerto.

Las cifras de las referencias (fotogramas, volúmenes y tiempos) salen del vídeo con el que nació la skill: una versión de 32,6 s con voz y otra de 32,9 s sin voz, con el móvil que gira y suelta monedas. **La versión sin voz es la plantilla de `assets/codigo/`**: `Plantilla.tsx` cuenta la misma historia con los mismos movimientos para «Tu marca», y todo lo que cambia de un vídeo a otro está en `ajustes.ts` (nombre, color, tipografía, textos, capturas de las pantallas y sonido). Para un vídeo nuevo sin voz, parte de ella.

Lee la referencia de cada paso solo cuando llegues a él:

| Paso | Lee |
|---|---|
| Guion por actos, `timeline.json` y animación colgada de la voz | `references/estructura.md` |
| Portátil y móviles 3D, pantallas nítidas, cámara, móvil inclinado con feed, giro y dinero | `references/imagen-3d.md` |
| **Atención y recorrido del ojo**: un foco cada vez, rótulos junto a su objeto, iconos reconocibles sin logotipos ajenos | `references/atencion-ojo.md` |
| Rótulos de producto, magia («¡pum!»), neumorfismo, transiciones conectadas, cursor | `references/transiciones-estilo.md` |
| Voz: modelo, elección de voz, tomas, colocación y palabras a fotogramas | `references/voz.md` |
| Efectos, paquete de sonido, música, mezcla en Remotion y silencios | `references/sonido.md` |
| Render, medidas, hojas de contacto y lista de fallos ya vistos | `references/revision.md` |
| Cerrar con una lección y compartirla (opcional) | `references/lecciones.md` |

## Innegociables

1. **Datos reales.** Pantallas, textos, precios y flujos salen del producto real: su web, su repositorio o lo que aporte el usuario. Sin cifras inventadas, testimonios falsos ni promesas de resultados. Si hace falta un dato de ejemplo, lleva el sello «Ejemplo». Antes de escribir textos, lee las instrucciones del proyecto (`CLAUDE.md`, `AGENTS.md` o equivalente), porque suelen tener vetos de marca, de plataformas o de palabras.
2. **La voz es apoyo, no muleta, y puede no haberla.** El vídeo se entiende en silencio: cada paso se ve en pantalla y lo cuenta un rótulo (línea en tinta y línea gris). Si hay voz, cada frase tiene su rótulo.
3. **Sin aire muerto.** Ningún tramo de 0,3 s baja de -29 LUFS momentáneos. La música suena desde el fotograma 0, nivelada, y todo lo que aparece suena (teclas, pops, golpes). Silencio de voz al principio, sí; silencio de sonido, nunca.
4. **Todo conectado.** Nada aparece de la nada ni se va porque sí: el mensaje se corta y nace la marca, el portátil llega cerrado y se abre, los elementos saltan de una pantalla a otra y los móviles se convierten en las miniaturas de la escena siguiente.
5. **La animación cuelga de algo.** Con voz, cada momento es `fotograma de una palabra + n`. Sin voz, cada momento es una constante del guion encadenada a la anterior (`GIRO = ASOMBRO + 8`), y la duración se comprueba contra `timeline.json`. Nunca números sueltos repartidos por el código.
6. **Movimiento determinista.** Todo es función pura del fotograma: nada de `Math.random()`, `Date` ni estado entre fotogramas.
7. **Nada cortado ni fantasma.** Un objeto 3D entra entero en el encuadre y gira sobre su centro. Se funde como imagen completa, nunca pieza a pieza, porque entonces se ve por dentro. Revisa siempre los primeros fotogramas de cada entrada.
8. **Seguridad.** La clave de ElevenLabs solo vive en la variable de entorno `ELEVENLABS_API_KEY`: nunca en archivos, nunca en el chat, nunca impresa. No publiques, no compres, no descargues modelos ni librerías de sonido sin preguntar antes, y no hagas commit sin que el usuario lo pida. Al publicar, el vídeo se marca como hecho con IA en la plataforma.
9. **Aspecto de producto, no de anuncio.** Tipografía sans de interfaz en minúscula normal, sin palabras de color subrayadas: un cliente las rechazó por «poco profesionales». El estado activo va en tinta y el color de la marca solo en la marca. La emoción sale del movimiento (inclinar, acelerar, girar, aparecer de golpe), no de la tipografía.
10. **Un foco cada vez y el ojo guiado.** Nadie puede leer un rótulo arriba y mirar a la vez una animación abajo. El rótulo entra cuando su escena está quieta, va pegado a su objeto (dentro de la cámara, en un sitio distinto en cada escena) y la escena actúa cuando ya se ha leído. Lo nuevo nace donde ya está la mirada o lo trae algo en movimiento. Lee `references/atencion-ojo.md` antes del guion.
11. **Sin logotipos ajenos.** Para que se reconozcan las redes o el correo, usa el nombre en texto plano e iconos universales, no logotipos de marcas: suelen pedir permiso o prohibir que parezca un respaldo.
12. **Centrado en lo que se ve.** En el móvil, la red tapa la parte de arriba, la de abajo (el nombre, el texto de la publicación y el botón) y la columna de botones de la derecha. Todo lo que se lee va en la zona segura, **x 65-888, y 288-1248** (Meta y YouTube juntas), y la cámara se ancla en su centro, no en el del cuadro. Compruébalo con `scripts/zonas.py` antes de entregar. Las cifras y las fuentes están en `references/atencion-ojo.md`.
13. **Nada sale sin un sí.** La lección del último paso se guarda en local. Solo se comparte si el usuario dice que sí de forma explícita, después de ver exactamente lo que se va a enviar.

## Flujo

1. **Fuentes y guion.** Reúne pantallas, textos y colores reales. Escribe el guion por actos y las frases de voz (`references/estructura.md` y `references/voz.md`). Enséñale al usuario el guion y los actos antes de construir.
2. **Voz primero, si la hay.** Genera las tomas, elige y colócalas en `timeline.json`: con eso quedan fijos los fotogramas de cada palabra. Sin voz, fija las constantes del guion y genera la música con tramos en esos fotogramas.
3. **Imagen.** Parte de la plantilla en lugar de empezar de cero: copia `assets/codigo/` a tu proyecto, rellena `ajustes.ts` y pon las capturas reales en los huecos de las pantallas. Cambia los actos solo si la historia del producto lo pide (`references/estructura.md`).
4. **Sonido.** Efectos del paquete (o nuevos con los mismos prompts), música por tramos con el golpe final en la marca, nivelada y bajo la voz.
5. **Revisión medida.** Fotogramas sueltos de cada entrada y cada relevo, borrador a media resolución, hoja de contacto, volumen y silencios (`references/revision.md`). Arregla, vuelve a medir y entrega pronto. La perfección viene en la siguiente vuelta.
6. **Entrega.** MP4 final renderizado en PNG, con su volumen, su pico y su duración. Explica qué se ha medido, qué se ha visto y qué solo puede juzgar el usuario de oído o a ojo. Actualiza el README del vídeo.
7. **Cerrar con una lección.** Si en este vídeo algo falló y se arregló, escribe la lección en local con `assets/leccion.md` (`references/lecciones.md` dice dónde y cómo). Después pregunta si se quiere compartir. Con un sí explícito, ábrela como issue o PR con `gh`. Si no hay `gh`, da el enlace del formulario. Sin un sí, no se envía nada.

## Lo que hay en la skill

```
scripts/
  elevenlabs.py       voz con tiempos por palabra, efectos y música; caché para no pagar dos veces
  paquete_efectos.py  genera, criba y deja listos los efectos de la receta con tu clave
  nivelar_musica.py   curva de volumen de la música por fotogramas, para que nunca suene a silencio
  cortar_teclas.py    una toma de tecleo cortada en 8 teclas sueltas
  medir.py            LUFS, pico real, duración y hoja de contacto de un MP4
  silencios.py        tramos por debajo de un umbral (aire muerto)
  zonas.py            hoja de contacto con la zona segura de anuncios verticales dibujada encima
  caja.py             ancho y centro del objeto oscuro por fotograma; avisa si toca el borde del cuadro
  huecos.py           fotogramas rotos: fondo en blanco o un objeto 3D que falta un fotograma
  empalme.py          alarga un acto sin regenerar la música: repite un compás entero en el tiempo más parecido
  claridad.py         casting de voz: qué toma se entiende mejor bajo la música del vídeo y cuál tiene las eses afiladas
assets/sonidos/       receta.json: los 27 efectos de interfaz por generar (volúmenes en references/sonido.md)
assets/codigo/        la plantilla y sus piezas (ver LEEME.md)
  Plantilla.tsx       la composición completa sin voz: chat, marca, portátil, móviles, feed, giro con monedas, revisión, informe y formulario
  ajustes.ts          lo único que hay que rellenar: marca, color, tipografía, textos, capturas y sonido
  kit-plantilla.tsx   colores, tipografías, curvas y p()/mix()
  mundo3d.ts          portátil, móviles y monedas en three.js, con lienzos con margen
  timeline.json       duración y tramos de música de la plantilla; plan-musica.json, el plan para ElevenLabs
assets/leccion.md     plantilla de lección (la misma que lecciones/PLANTILLA.md del repositorio)
```

Los scripts se ejecutan con `uv run <script>`: llevan sus dependencias declaradas.

## Proyecto nuevo

- **Remotion 4** con `three` (0.18x). En `remotion.config.ts`: `Config.setChromiumOpenGlRenderer('angle')`. En Windows, usa rutas cortas: por encima de 260 caracteres Remotion falla.
- `scripts/elevenlabs.py` cubre la voz, los efectos y la música.
- Genera los efectos con `uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<proyecto>/sfx` y apunta `ajustes.sonido.efectos` a esa carpeta. Sin clave de ElevenLabs, pon tus propios sonidos con los mismos nombres.

## Cómo trabajar con el usuario

- Responde en el idioma del usuario, directo y práctico, con una recomendación y no con un menú.
- Avisa en una línea cuando algo vaya a tardar, como un render o una generación.
- Entrega una versión vista pronto y sigue mejorando.
- Cuando el usuario dice que algo «se ve cortado», «suena vacío» o «no está conectado», busca la causa en los fotogramas o en la medida antes de tocar nada. Después, explícasela en una frase.

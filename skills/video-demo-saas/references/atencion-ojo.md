# Atención y recorrido del ojo

En un vídeo vertical sin voz, el espectador solo puede mirar un sitio a la vez. Si el texto está arriba y la acción abajo, o lee o mira: no las dos cosas. Un cliente lo resumió así ante una versión con el rótulo arriba y la acción abajo: «o presto atención o leo eso». La plantilla (`assets/codigo/Plantilla.tsx`) aplica esta guía.

## Lo que dice la investigación

- **Atención dividida y contigüidad** (Mayer, teoría de la carga cognitiva). El texto en pantalla y la animación compiten por el mismo canal visual. Las palabras deben ir junto a la imagen que explican y mostrarse cuando corresponde, no lejos ni a destiempo ([Cambridge Handbook of Multimedia Learning, principios para reducir el procesamiento ajeno](https://cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning/F29A19FCD34C542806F736E0661C05F5)).
- **Sincronía atencional** (seguimiento ocular con películas, Tim Smith y colaboradores). Viendo cine, casi todos miran lo mismo en el mismo momento, y lo que más lo provoca es el movimiento: cuando solo se mueve una cosa, todos la miran ([Loschky, Larson, Magliano y Smith, 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC5698392)). Es la herramienta para guiar el ojo, y también la trampa: dos cosas que se mueven en sitios distintos parten la mirada.
- **El recorrido del ojo en el montaje.** Walter Murch lo incluye entre sus seis criterios del corte (*In the Blink of an Eye*, 1995): dónde está la mirada al final de un plano decide dónde debe empezar el siguiente.
- **Velocidad de lectura.** Netflix fija una velocidad de lectura por idioma en sus guías de subtítulos y limita la línea a 42 caracteres en español ([guía de español](https://backlothelp.netflix.com/hc/en-us/articles/217349997-Castilian-Latin-American-Spanish-Timed-Text-Style-Guide)). Las cifras de 17 a 20 caracteres por segundo que circulan para adultos son de terceros. Para un rótulo encima de una animación, deja unos **15 caracteres por segundo de calma**.

## Reglas

1. **Un foco cada vez.** El rótulo entra cuando su escena está quieta y la escena actúa cuando ya se ha leído. Dentro del rótulo, un movimiento pequeño y pegado a él (una casilla que se marca debajo) sí vale. Un objeto grande que llega a otro sitio, no.
2. **El texto vive junto a su objeto.** Los rótulos van dentro de la cámara, así que se acercan y se mueven con la escena. Mismo objeto, mismo sitio: los rótulos de una misma escena ruedan en su sitio. Objeto nuevo, sitio nuevo: encima de la tapa, debajo de los móviles, arriba a la izquierda del móvil inclinado, encima en el pago, debajo de la revisión. **No los dejes siempre en la misma franja de arriba**: el cliente lo vio poco profesional.
3. **Lo nuevo nace donde ya está la mirada o lo trae algo que se mueve.** La respuesta del chat vuela al centro, donde nace la marca. El rótulo del portátil sale de detrás de la tapa. Las monedas salen del móvil girando a su alrededor.
4. **Un recorrido legible por escena.** En Z (arriba a la izquierda, luego bajando por la derecha, luego el centro) o en círculo (las monedas, en el sentido de las agujas del reloj). Nada de saltos de un extremo a otro.
5. **Menos palabras.** Una línea de 4 a 6 palabras por momento. La línea gris solo si cabe en el tiempo, y mejor si llega con su evento (como «Si algo falla, te decimos por qué.» con el aviso de rechazo). Si la pantalla ya lo dice, el rótulo no lo repite, y al revés: si el rótulo explica cómo se paga, la pantalla de pagos se titula solo «Pagos».
6. **La cámara también guía.** En el chat no hay rótulo: el mensaje que se teclea es el texto, y la cámara se acerca a donde se escribe y se abre cuando la burbuja sube.
7. **Una entrada distinta según el contexto.**
   - `sube`: cada palabra sube por su máscara, y sirve para rodar de un rótulo a otro en el mismo sitio.
   - `detras`: el bloque sale de detrás de un borde real, como la tapa o el canto de la tarjeta.
   - `lado`: el bloque sale lateralmente desde el objeto.
8. **Quita lo que compite.** Una versión anterior tenía un segundo texto (una pastilla) debajo de los móviles con el rótulo arriba, cinco insignias por los dos lados y una tarjeta borrosa detrás del rótulo siguiente. Cada cosa de más es un foco más.

## Zona segura: centrar en lo que se ve, no en el cuadro

En el móvil, la red tapa parte del vídeo:

- arriba, la cabecera (en Reels, el título y la cámara);
- abajo, el nombre de la cuenta, el texto de la publicación, el audio y, en un anuncio, el botón de acción;
- a la derecha, la columna de me gusta, comentar, compartir y guardar.

Lo que caiga ahí no se lee. Por eso la composición se centra en la parte que sí se ve, no en el cuadro de 1080 × 1920.

| Red | Arriba | Abajo | Izquierda | Derecha | Fuente |
|---|---|---|---|---|---|
| Meta, anuncios de Reels | 14 % (269 px) | 35 % (672 px) | 6 % (65 px) | 6 % (65 px) | [Guía de anuncios de Reels de Instagram](https://www.facebook.com/business/ads-guide/update/video/instagram-reels) |
| YouTube, anuncios verticales | 288 px | 672 px | 48 px | 192 px | [Zonas seguras universales de YouTube (PDF)](https://services.google.com/fh/files/misc/universalsafezones-youtube.pdf) |
| TikTok, In-Feed | según el formato y la longitud del texto | | | | [Especificaciones de In-Feed](https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads): da plantillas descargables, no cifras |

Juntas, en 1080 × 1920: **x 65-888, y 288-1248**, con el centro en (476, 768). Las cifras son las de los anuncios, que son las más estrictas. En una publicación normal la interfaz tapa algo menos, pero se usan igual, porque el mismo vídeo suele acabar promocionado como anuncio. Para TikTok, las cifras que circulan (160 px arriba, 480 abajo, 120 a los lados) son de terceros y quedan dentro de esta zona.

Cómo aplicarla:

- **Ancla la cámara en el centro de la zona**, no en el del cuadro. En la plantilla, `AX = 496` y `AY = 790`, y el mundo se ve al 86 % (`G`).
  - Un fallo real: la cámara anclaba en y = 1060, por debajo del centro. Así, los rótulos de debajo de los objetos, el campo del chat, los botones y el lema caían en la franja del texto de la publicación.
- **Dentro de la zona va todo lo que se lee**: rótulos, botones, la marca y el lema, los estados («Aprobado», «Rechazado») y la columna clave de una tabla.
  - A la derecha, a partir de x 888, no pongas nada que haya que leer: es donde están los botones de la red. En aquel fallo quedaban ahí las insignias del móvil inclinado y la columna destacada del informe.
- **Lo que no se lee puede invadir los bordes**: el teclado del portátil, la parte baja de los móviles, las monedas que caen o el fondo. Así el cuadro no queda vacío.
- **Los objetos anchos** (tarjetas, informes, formularios) caben en 823 px de pantalla. Si no caben, baja el zoom de la cámara en esa escena; no achiques solo el texto.
- **El ángulo también sirve.** Un móvil inclinado o un portátil en perspectiva deben inclinarse hacia el centro de la zona, no hacia la columna de botones.
- **Si amplías o subes el plano, el lienzo 3D tiene que cubrir más que el mundo de 1080 × 1920.** Si no, lo que sale de cuadro se corta en el borde del lienzo, que ahora queda dentro de la imagen. En la plantilla se resuelve con `MARGEN` y `setViewOffset` en `mundo3d.ts`.
- **El texto de la pieza no repite lo que tapará la red.** El nombre de la cuenta y el texto de la publicación ya salen abajo; no hace falta un rótulo en esa franja.
- **Compruébalo:** la prop `zonas` de la plantilla pinta en rojo lo que tapa la red, y `scripts/zonas.py` dibuja la zona sobre una hoja de fotogramas del MP4.

## Componente `Rotulo`

Está en `assets/codigo/Plantilla.tsx`. Su interfaz:

```tsx
<Rotulo f={f} at={LAP_IN + 26} out={ROW0 - 10} t="Nos mandas tu archivo." sub="Tú no instalas nada."
  x={540} y={TAPA - 70} entrada="detras" borde={70} size={74} />
```

- `x` e `y` son coordenadas del mundo, dentro de `<Camara>`.
- `ancla` dice si `y` es el borde inferior (`'abajo'`, el rótulo queda encima) o el superior (`'arriba'`).
- `align` puede ser `'center'` o `'left'`.
- `subAt` hace que la línea gris llegue con un evento.
- Todos los rótulos de un vídeo van juntos en un componente `Rotulos`, para ver de un vistazo dónde cae cada uno. En la plantilla, sus textos salen de `ajustes.rotulos`.

## Iconos reconocibles sin logotipos ajenos

Que el espectador relacione lo que ve con lo que ya conoce ayuda, pero **no uses logotipos de redes ni de otras marcas** sin revisar antes el plan del proyecto y las normas de cada marca:

- Meta no deja usar la marca Instagram de forma que sugiera asociación, patrocinio o respaldo, y su glifo sirve sobre todo para enlazar a tu propia cuenta ([recursos de marca de Instagram](https://www.meta.com/brand/resources/instagram/instagram-brand/)).
- YouTube pide aprobación para usar su logo o su icono ([recursos de marca](https://brand.youtube) y [formulario de solicitud](https://support.google.com/youtube/contact/brand_request?hl=en)).
- TikTok remite a sus normas de marca y su política de anuncios vigila los logotipos ajenos que confunden sobre una relación comercial ([pautas de diseño para desarrolladores](https://developers.tiktok.com/doc/getting-started-design-guidelines)).

Revisa también las normas del propio proyecto: aparentar ser partner de una red suele estar vetado. Lo que sí funciona:

- el nombre de la red en texto plano y en la tipografía del vídeo («Instagram», «YouTube»), en la pantalla y en la notificación «@usuario · YouTube»;
- iconos universales sin dueño: corazón, comentario, compartir, guardar, «Seguir», «♪ Sonido original», campana, el sobre del correo (con un tic verde cuando llega) y el escudo con tic de verificado;
- patrones de interfaz conocidos: vídeo vertical con raíl de iconos a la derecha, barra de progreso, notificación que baja desde arriba, burbujas de chat.

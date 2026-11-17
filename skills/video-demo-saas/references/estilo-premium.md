# Estilo premium: fondos de verdad, tipografía en pareja y transiciones con oficio

Sale de dos referencias de motion designers (13 nov 2026): la intro «Ideas are static. Motion brings them to life» y el anuncio de una skill de Claude Code («Comment SKILL…»). Se probó por primera vez en una presentación personal en vertical; r3, r4 y r5 son sus revisiones. Su código está en `assets/codigo/estilo.tsx`.

**Cuándo usarlo.** Presentaciones, intros de marca, anuncios propios (de un estudio, de una persona o de una skill) y cualquier vídeo que deba parecer de estudio. En una demo de producto de un cliente que pidió aspecto de producto manda el innegociable 9 del `SKILL.md`: sin palabra en degradado ni cursiva de adorno, salvo que el cliente diga que sí.

## Qué lo abarata y qué lo hace caro

| Abarata («cara de IA») | Lo hace caro |
|---|---|
| Fondo de degradado plano de un color | Una foto de verdad (cielo, nubes, montaña) o un aura pastel hecha de nubes desenfocadas |
| Todo en el mismo plano | La foto en un plano lejano que sigue a la cámara solo en parte, cosas que llegan desenfocadas y se enfocan, nubes por delante del objeto |
| Una sola sans; palabras destapadas por barras de colores | Tres pisos: antetítulo gris pequeño, palabra gigante en degradado azul con un brillo que la cruza y una cursiva serif |
| Rótulos sueltos en el aire | Pastillas de cristal pegadas al borde de su objeto, montando sobre él |
| Formas de plástico de adorno (esferas, cubos, aros) | Objetos con sentido: el móvil, el portátil, tarjetas con trabajos reales |
| Círculo de color en el clic | Semitono: la escena nueva entra por una trama de puntos que crecen desde el botón |
| Negro con un resplandor | Noche con el arco encendido de un planeta azul y la palabra clave dentro de una caja azul |

## Fondos

**De dónde salen.** De Unsplash con el filtro «Gratis» (licencia Unsplash: uso comercial sin atribución obligatoria). Nada de `plus.unsplash.com`, que es de pago. La web tiene una comprobación anti‑bots: no se esquiva con `curl` ni con su API interna. Se busca con el navegador del usuario (Claude in Chrome). Las candidatas se ven en una hoja montada con JavaScript en la propia página, que lee el `src` de cada `figure`. La elegida se baja de su CDN:

```
https://images.unsplash.com/<photo-id>?h=2600&q=85&fm=jpg
```

2.600 px de alto bastan para 1.920 con margen para la cámara. Antes de descargar, el usuario tiene que haberlo autorizado. Si no lo ha hecho, se le pregunta qué se baja, de dónde y cuánto pesa. Las fotos van a `public/<proyecto>/fondos/` y su id de Unsplash se apunta en un comentario junto a la constante que las carga.

**Las cuatro que funcionan** (catálogo del 13 nov 2026; se pueden reutilizar):

| Uso | Archivo | Página (unsplash.com/photos/…) | photo-id | Tamaño |
|---|---|---|---|---|
| Abrir: picos encendidos por el sol sobre cielo azul | `montana.jpg` | `jgeihL8iUvI` | `photo-1599204723168-f0a03459a074` | 3900×2600, 1,3 MB |
| Que flote un objeto: cúmulo vertical | `cumulo.jpg` | `a9QDqIYtwBs` | `photo-1783180340813-1fb4efc59a76` | 1733×2600, 0,4 MB |
| Fondo del carrusel y nubes por delante (con la llave): azul profundo con nubes abajo | `cielo.jpg` | `lNxMcE8mvIM` | `photo-1531147646552-1eec68116469` | 3900×2600, 1,4 MB |
| Aura pastel de las escenas de texto: mar de nubes pálido | `mar.jpg` | `9BJRGlqoIUk` | `photo-1499346030926-9a72daac6c63` | 3900×2600, 0,6 MB |

**Cómo se usan** (componentes de `estilo.tsx`):

- `Foto`: a sangre con `objectFit: cover`. En vertical, una foto horizontal se encuadra con el foco x en % (la montaña va a `[28, 60]`).
- Profundidad: la foto va dentro de un plano de profundidad (un `Plano` de tu composición) con `d` entre 0,25 y 0,3. Escala y se desplaza un 25-30 % de lo que hace la cámara. Hay que darle escala ≥ 1,12 para que no se vean los bordes.
- Enfoque de arranque: la foto nace con `blur` 22 y un 16 % más grande, y se enfoca y asienta hasta el segundo golpe de la música.
- `Aura`: el mar de nubes con `blur(40px) brightness(1.14) saturate(0.72) hue-rotate(10deg)`, a escala 1,45, a la deriva. Encima lleva tres manchas: lavanda abajo a la izquierda, azul arriba a la derecha y blanco en el centro. Es el fondo de toda escena de texto. Nunca un `#f6efe4` plano.
- `LlaveCielo`: un filtro SVG con alfa = A + 2,6·(R − B), donde A es el alfa de la foto. Deja las nubes y quita el azul. Con un 1 fijo en lugar de A, el margen del filtro (vacío, negro) sale opaco y aparece una franja negra. Con `cielo.jpg` saca un banco de nubes que sube por delante del móvil 3D (en DOM, encima del lienzo) con `blur` 4.

## Tipografía

- **Fuentes.**
  - Geist (sans; 700 y tracking −0,045 em en titulares, 600 en antetítulos).
  - Instrument Serif Italic (OFL, del repositorio `google/fonts` en GitHub, 72 KB) en `public/fonts/`.
  - `estilo.tsx` carga las dos.
- **Los tres pisos.**
  - Antetítulo en gris `#7c8299`, Geist 600 a 64 px.
  - Palabra gigante: Geist 700 a 250 px, en `degradado(brillo)` (azul `#1f3cff` → `#3a66ff` → violeta `#7a5cff`), con una franja blanca que la cruza en 30 fotogramas.
  - Cursiva serif a 140-170 px, en tinta sobre claro o en blanco sobre noche.
  - Ejemplos: «Convierto / ideas / en imágenes.» y «Y las imágenes, / en movimiento.».
- **Medir antes de maquetar.** La zona segura tiene 823 px de ancho, y se mide con fontTools sobre la fuente real. En la r3:
  - «ideas» a 250 px: 608 px. «en imágenes.» en cursiva a 170 px: 776 px.
  - «en movimiento.» a 170 px: 946 px (no cabe), así que va a 140 px: 779 px.
- **Entrada con foco**, con `enfoque(f, a, sale)`. La palabra sube 0,34 em, pasa de `blur` 16 a 0 y de escala 1,05 a 1 en 11 fotogramas. La opacidad solo acompaña los 4 primeros: lo que se ve es un enfoque de cámara, no un fundido. Con `sale`, se va igual hacia arriba y se desenfoca. Una palabra por golpe o medio golpe.
- **Palabras que ondulan.** `background-clip: text` no sirve letra a letra, así que cada letra lleva su color de `rampa(i, n, brillo)`, que también hace pasar el brillo.
- **Caja de resalte.** `Resalte` es una caja azul `#2f5bff` con halo que se abre de izquierda a derecha detrás de la palabra clave del cierre, como texto seleccionado.

## Transiciones

- **Semitono** (`Semitono`): trama hexagonal de paso 40 y banda 440, el frente crece en 15 fotogramas y el recorte es un `clipPath` SVG de círculos. Va en el clic: nace del botón, sigue a la cámara mientras se aleja y suena con la tinta.
- **Círculo desde lo que se mira** (`radioRevela` y el `Circulo` del ejemplo): 9 fotogramas, con un anillo de luz que adelgaza mientras crece.
- **Recogida.** El fondo se cierra en círculo hacia el centro a la vez que su objeto encoge (`E.io`, 11 fotogramas). Las pastillas se van con él.
- Nada aparece ni se va solo por opacidad: lo lleva una trama, un círculo, un muelle o un movimiento con foco.

## Piezas

- **Pastilla de cristal** (`Pastilla`):
  - Aspecto: tinte azul grisáceo (`rgba(110,132,190,.5)` → `rgba(70,92,150,.34)`), `backdrop-filter: blur(16px) saturate(160%)`, borde blanco al 55 % y Geist 600 a 40 px en blanco.
  - Movimiento: nace con el muelle del «¡pap!», se enfoca en 8 fotogramas, flota ±9 px y se recoge con su objeto.
  - Colocación: una a cada lado y a distinta altura, montada sobre el borde del objeto.
  - Contenido: dice qué se ve («Intros 3D», «Anuncios», «Demos de app»).
- **Planeta** (`Planeta`): en vertical, radio 1.100 y cima en y ≈ 1.530. Sube con un muelle lento desde abajo dentro del círculo de la noche. Lleva un borde de 3 px azul claro y tres halos azules.
- **Interfaz**: el botón de enviar pasa a azul cuando el texto está escrito y se enciende con anillo en el clic. La caja de selección lleva asas blancas con borde azul y la medida en una pastilla azul.
- **3D**: luz fría (hemisférica `#ffffff`/`#c9d6ff` y contraluz `#dfe7ff`). Los glifos van en azul, lavanda, tinta y blanco, nada de naranja ni amarillo.

## Código

- `assets/codigo/estilo.tsx` se copia a `src/spots/<proyecto>/estilo.tsx` y las dos fuentes a `public/fonts/`. Depende solo de `remotion` (`Img`, `Easing`, `staticFile`) y de `@remotion/fonts`.
- `estilo.tsx` trae las piezas y la composición pone el resto:
  - un `Plano` por capa de profundidad, que sigue a la cámara en la proporción `d`;
  - un `Circulo` que revela desde lo que se mira, con `radioRevela`;
  - las nubes de delante: la foto del cielo con `LlaveCielo`;
  - una escena por cada piso de texto y el cierre con `Planeta` y `Resalte`.
- `assets/codigo/Interfaces.tsx` es un vídeo completo que usa `Foto`, `enfoque` y las fuentes del kit.
- `scripts/anchos.py` mide los textos con la fuente real.
- Orden de capas, de atrás adelante:
  1. Fotos y auras, cada una en su revelado.
  2. Grano.
  3. Lienzo 3D.
  4. Nubes por delante.
  5. Texto y pastillas, en el espacio de la cámara.
  6. Brillos y cursor.

## Analizar una referencia nueva

Los scripts `scripts/referencia.py` y `scripts/fotogramas.py`:

- `referencia.py <mp4> <carpeta> 12`: hojas cada 12 fotogramas, cortes, tempo y nivel.
- `fotogramas.py <mp4> <jpg> 40,110,170`: fotogramas sueltos grandes para ver la tipografía.

Se mira, por este orden:

1. De dónde sale el fondo (foto, aura o 3D).
2. Qué pareja tipográfica usa.
3. Cómo entra cada palabra.
4. Qué transición lleva cada cambio.
5. Qué rótulo va pegado a qué objeto.
6. Cómo cierra.

Después se escribe la tabla «abarata / lo hace caro» del vídeo propio antes de tocar código.

## Fallos vistos (r3, 13 nov 2026)

- **Rayas en los bordes del cuadro.** Cuando la cámara se aleja (k < 1), el `Plano` encoge y deja ver lo de detrás si la foto está recortada a su caja. `Foto` no lleva `overflow: hidden`: la foto escalada tiene que poder salirse.
- **Franja negra encima de las nubes de delante.** La llave usaba alfa = 1 + …, que vuelve opaco el margen vacío que el filtro añade alrededor de la imagen. Va con alfa = A + ….
- **Glifo blanco sobre el aura blanca.** No se ve. En las escenas claras, los objetos 3D van en azul, lavanda o tinta.
- **Picos en el arco del planeta en una hoja de contacto.** Son dos fotogramas pegados. Para el arco hay que mirar un fotograma suelto a resolución completa.
- **Tarjetas en blanco en el carrusel (r4).** El usuario lo vio enseguida: «unas sí y otras no» queda poco profesional. Las causas eran dos: la cara de atrás era plástico liso y al girar salía vacía, y las capturas de fondo blanco sobre un cuerpo blanco parecían vacías. La regla:
  - Toda tarjeta que gire lleva contenido en las dos caras (la de atrás, girada media vuelta para que no salga en espejo).
  - El cuerpo es oscuro, para que la pantalla quede enmarcada.
  - En un carrusel solo van fotogramas que llenan la pantalla, nunca un fondo liso con un móvil pequeño en medio.
- **Un carrusel sin rótulo no dice nada.** Le va una etiqueta de cristal con esquinas de selección azules en el centro («Mis trabajos»), que nace con muelle y se recoge con la espiral.
- **Tarjetas que se atraviesan en el carrusel (r5).** Si no caben en el anillo, se cortan entre sí, y se nota mucho. La regla:
  - Las tarjetas van tangentes a un círculo (`ry = ángulo`).
  - El radio cumple 2·r·tan(π/N) ≥ ancho × escala × 1,13 (el rebote del muelle) + 20 px. Con 8 tarjetas de 236 px a escala 1,15, sale r ≥ 395, y se usa 420.
  - Se pone un `throw` en el código si no se cumple.
  - El anillo entero crece, gira y se recoge a la vez (un solo muelle de radio y una sola recogida), y cada tarjeta ≤ el radio de ese momento. Nunca un muelle de posición por tarjeta.
  - El balanceo en el plano de la tarjeta no pasa de 2°.

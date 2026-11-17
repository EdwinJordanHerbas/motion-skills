# Cambios de video-demo-saas

## 0.4.0 · 17 nov 2026

Lo aprendido con dos vídeos propios hechos con la skill: una presentación personal en vertical y un muestrario de interfaces.

- **Estilo premium** (`references/estilo-premium.md` y `assets/codigo/estilo.tsx`) para presentaciones, intros y anuncios propios. Fondos de foto y un aura pastel en lugar de degradados planos, con cuatro fotos de Unsplash ya catalogadas. Tipografía en tres pisos: antetítulo gris, palabra gigante en degradado y cursiva serif. Entradas con foco, pastillas de cristal pegadas a su objeto, transición en semitono y cierre con planeta. En las demos de producto sigue mandando el innegociable 9, salvo que el cliente diga que sí.
- **Kit de elementos de interfaz** (`references/elementos-ui.md` y `assets/codigo/ui.tsx`): 24 elementos de shadcn/ui, Magic UI, Aceternity UI, Liquid Glass y Material 3 Expressive replicados en código, cada uno como función pura de su progreso. La guía dice cómo se mueve cada uno, cómo un solo toque conduce el vídeo y cómo un marco con el nombre presenta cada componente. `assets/codigo/Interfaces.tsx` es un vídeo de ejemplo completo con «Tu marca».
- **Analizar una referencia:** `scripts/referencia.py` saca hojas de contacto, cortes, tempo y nivel de un vídeo, y `scripts/fotogramas.py`, fotogramas sueltos grandes para ver la tipografía.
- **Medir antes de maquetar:** `scripts/anchos.py` da el ancho de un texto con la fuente real, para saber si cabe en los 823 px de la zona segura.
- **Capas que desaparecen un fotograma:** `scripts/parpadeo.py` las encuentra en el render completo, donde `huecos.py` no las ve. La revisión explica cómo rehacer solo ese tramo sin que cambie de color.

## 0.3.1 · 12 nov 2026

- **`informe.json` ya no se guarda junto a los efectos.** `paquete_efectos.py` lo dejaba en la carpeta de salida, que suele ser `public/` y va al repositorio, y el informe lleva rutas del ordenador. Ahora se guarda en la carpeta de la caché, o donde digas con `--informe`. El arreglo viene del [PR #2](https://github.com/EdwinJordanHerbas/motion-skills/pull/2).

## 0.3.0 · 12 nov 2026

Lo aprendido al hacer con la skill la intro 3D de NeumorStudio (33,6 s): un mundo 3D en un solo plano, con voz de marca.

- **Sonido inmersivo** (`references/sonido.md` y `assets/codigo/sonido-inmersivo.tsx`): cada objeto suena a su material, un aire en bucle sigue la velocidad de la cámara, el ambiente del «antes» se corta en seco con el golpe y los momentos grandes van en capas. Incluye cómo comparar los efectos con la música en una pista aparte. En la intro, los efectos iban 13 dB por debajo de la música.
- **14 efectos nuevos en la receta**, de objetos y ambiente: `aire`, `ambiente`, `riser`, `golpe`, `porcelana`, `toque`, `rodar`, `bisagra`, `contador`, `tinta`, `deslizar`, `succion`, `boton` y `vibra`. Son 41 en total. `paquete_efectos.py` admite fondos continuos (familia `bed`), pedidos en bucle y alargados con fundido cruzado.
- **Desfases medidos, no a ojo:** `scripts/desfases.py` da el pico de cada efecto. Con desfases a ojo, los barridos caían de 4 a 13 fotogramas tarde.
- **Picos por fotograma:** `scripts/picos.py` dice en qué fotograma se apila el sonido cuando el vídeo pasa de −1 dBTP.
- **Voz:** un tono por escena, la música se aparta desde el primer sonido de cada frase (no desde la primera palabra alineada), la voz manda en los tiempos al añadirla a un vídeo ya montado, y solo se rehacen las frases que cambian. `elevenlabs.py voz` acepta `--anterior` y `--siguiente`.
- **Marcas dichas en español:** `scripts/vocal_e.py` comprueba si la voz dice «Estudio» o «Studio» midiendo la «e», porque Whisper no lo distingue.
- **Móvil delante de una pantalla:** `assets/codigo/recorte-movil.tsx` recorta a la pantalla DOM la silueta del móvil 3D. `mundo3d.ts` exporta `aPantalla`.
- **Revisión:** cómo rehacer solo el audio sin volver a renderizar la imagen, siete fallos nuevos con su arreglo y cómo preparar el commit de un solo vídeo.

## 0.2.0 · 11 nov 2026

- El repositorio pasa a ser una colección de skills: `motion-skills`.
- Tres fallos más en la lista de revisión y la comprobación de que todo se lee con el vídeo a 380 px de ancho.

## 0.1.0 · 8 nov 2026

- Primera versión pública: la plantilla «Tu marca», el método, la receta de 27 efectos de interfaz y los scripts de medida.

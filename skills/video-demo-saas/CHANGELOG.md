# Cambios de video-demo-saas

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

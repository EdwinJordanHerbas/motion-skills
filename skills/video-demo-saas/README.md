# video-demo-saas

Una **plantilla de vídeo demo vertical** para tu producto (1080×1920, 33 s), al estilo de las plantillas de After Effects, y el método para que tu IA la adapte. Lleva dispositivos 3D modelados en código con tu interfaz real y nítida, rótulos que se leen sin sonido, transiciones conectadas y neumorfismo. El sonido no tiene silencios muertos.

Instalación y requisitos comunes: [README de la colección](../../README.md).

```bash
claude plugin install video-demo-saas@edwinjordanherbas
```

## La plantilla «Tu marca»

Es un solo plano continuo, sin voz:

1. Un cliente escribe en un chat y la respuesta se abre en tu marca.
2. Un portátil enseña tu panel.
3. Un editor corta tres piezas, que saltan a tres móviles.
4. Uno de los móviles se inclina, su feed se acelera, gira y suelta un halo de monedas.
5. Siguen una revisión, un informe y un formulario que se rellena solo.
6. Cierra con tu marca.

Todo lo que cambia de un vídeo a otro está en un archivo, `ajustes.ts`:

- nombre, lema, color de acento y tipografía;
- los textos de cada escena y el símbolo de las monedas;
- las capturas de tu producto para las pantallas;
- la música y los efectos.

La animación y la duración no se tocan. La plantilla está en [`assets/codigo/`](assets/codigo/LEEME.md), con los pasos para registrarla en tu proyecto de Remotion.

Puedes rellenarla tú o pedírselo a tu IA con la skill instalada: «hazme un vídeo demo de mi producto con la plantilla». La skill le enseña el método (guion, atención, 3D, sonido y revisión medida), para adaptarla o para construir otra historia.

## Requisitos de esta skill

Además de los comunes:

- **`three` (0.18x) y `@remotion/fonts`** en tu proyecto. La plantilla se ha probado con Remotion 4.0.541 y three 0.181.

## Sonido: opcional

La plantilla no tiene voz y funciona en silencio hasta que le das música y efectos en `ajustes.ts`. La skill puede generar voz, efectos y música con ElevenLabs, pero no es obligatorio.

- La música tiene sus propios [términos](https://elevenlabs.io/music-terms), con límites por tipo de cuenta y de uso.
- Sin ElevenLabs, usa tus propios sonidos y una música con licencia. Las reglas de mezcla y de silencios valen igual.
- **Los efectos no vienen como audio**, porque los términos de ElevenLabs no permiten repartir lo generado. Viene su receta (`assets/sonidos/receta.json`) y un script que genera los 41 con tu clave: los 27 de interfaz de la plantilla y 14 de objetos y ambiente para mundos 3D.
  ```bash
  uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<proyecto>/sfx
  ```

## Novedades

La versión actual es la **0.3.0**. Trae lo aprendido en la intro 3D de NeumorStudio: sonido inmersivo, voz con un tono por escena, la marca dicha en español y tres scripts de medida nuevos. Todos los cambios, versión a versión, están en [CHANGELOG.md](CHANGELOG.md).

## Pruebas

Diez encargos fijos para comparar versiones de la skill: [`pruebas/video-demo-saas/`](../../pruebas/video-demo-saas/README.md).

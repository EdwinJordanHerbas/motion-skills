# Receta del paquete de efectos

Los 27 efectos de interfaz de la plantilla (clics, barridos, golpes, monedas y 8 teclas) **no vienen como audio**. Los términos de ElevenLabs no permiten repartir lo generado, así que aquí está la receta para generarlos con tu cuenta:

- `receta.json`: el prompt, la duración, la influencia y la familia de cada efecto, con los límites de criba que cambian en algunos.
- `scripts/paquete_efectos.py`: pide 3 tomas por efecto, las filtra y criba por medida, se queda con la mejor, la recorta y normaliza, y corta el tecleo en `tecla0.wav`…`tecla7.wav`.

```
uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<proyecto>/sfx
```

Necesitas `ELEVENLABS_API_KEY`, un plan de pago si el vídeo es comercial, y ffmpeg. Todo queda en una caché local, así que repetir no vuelve a cobrar. Las reglas de criba, los volúmenes y dónde suena cada efecto están en `references/sonido.md`.

Lo que generes lo puedes usar en tus vídeos según los términos de tu plan, pero no lo publiques suelto como paquete o biblioteca de sonidos.

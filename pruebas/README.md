# Pruebas: comparar versiones de la skill

Antes de publicar una versión nueva, el mantenedor pasa los mismos encargos con la versión anterior y con la nueva, y compara lo que se puede medir. Los encargos de `briefs/` son fijos: no se editan entre versiones. Si hace falta uno distinto, se añade con un número nuevo.

Los productos son inventados. Si algún nombre coincide con una marca real, se cambia.

## Cómo pasar un encargo

1. Un proyecto Remotion limpio por encargo y por versión, por ejemplo `prueba-0.1.0/02-cobrello/`. En Windows, con rutas cortas.
2. Mismo agente, mismo modelo y misma versión de Remotion en las dos pasadas. Apúntalos.
3. Pega el encargo tal cual. Responde a las preguntas de la IA con lo que diga el encargo y nada más. Si pregunta algo que el encargo no dice, responde «lo que recomiende la skill».
4. Sin ElevenLabs de pago, usa solo los efectos del paquete y una música fija de prueba con licencia, la misma en las dos versiones. Así la diferencia sale de la skill y no del sonido generado.
5. Render final en PNG (`references/revision.md`).

## Qué medir

Desde la carpeta de la skill, sobre cada `final.mp4`:

```
uv run scripts/medir.py final.mp4 hoja.jpg 0,30,60,90,120,150,180,240,300,360,420,480,540,600,660,720,780,840,900
uv run scripts/silencios.py final.mp4 -29
uv run scripts/zonas.py final.mp4 zonas.jpg 0,90,180,270,360,450,540,630,720,810,900
```

- `medir.py`: duración, LUFS integrados, pico real y una hoja de contacto con los fotogramas que le pases.
- `silencios.py`: tramos de 0,3 s o más por debajo de -29 LUFS momentáneos (tiene que salir «ninguno»), con la mediana y el percentil 10.
- `zonas.py`: la misma hoja con la zona segura de anuncios dibujada encima. Lo que caiga en rojo y sea texto, marca o botón es un fallo.

## Hoja de resultados

Una fila por encargo y versión en `pruebas/resultados/<versión>.md`, sin vídeos ni imágenes en el repositorio:

| Encargo | Versión | Agente y modelo | Duración | LUFS | Pico (dBTP) | Tramos < -29 | Mediana | p10 | Fallos vistos en la hoja | Vueltas hasta entregar |
|---|---|---|---|---|---|---|---|---|---|---|
| 02-cobrello | 0.1.0 | | | | | | | | | |

**Pasa** si:

- la duración está en el rango del encargo;
- no hay tramos de silencio;
- el volumen es el objetivo del encargo (-16 LUFS ± 1 si no dice otro) y el pico no pasa de -1 dBTP;
- la hoja de contacto no tiene cortes, fantasmas, solapes de rótulos, textos partidos ni texto fuera de la zona segura;
- se respetan los vetos del encargo (en el 09, la IA avisa de los logotipos antes de construir).

## Comparar

- **Medidas**: la versión nueva no puede empeorar en ningún encargo lo que la anterior ya pasaba.
- **A ojo, a ciegas**: junta las hojas de contacto de las dos versiones sin decir cuál es cuál y pide a alguien que no las haya hecho que elija la que se ve más de producto. Apunta el resultado.
- **Coste**: anota las vueltas que necesitó cada versión hasta entregar. Si la nueva necesita más, algo en las instrucciones confunde.

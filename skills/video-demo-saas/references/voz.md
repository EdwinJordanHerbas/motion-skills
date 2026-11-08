# Voz de apoyo

## Papel de la voz

- **Acompaña, no explica sola.** El vídeo se entiende en silencio, y la voz pone calidez y ritmo. En el vídeo de referencia son seis frases, unas 50 palabras en 32 s, con huecos para que la imagen respire.
- **Primero el gancho sin voz** (unos 4 s, solo con teclas y música). Después la marca, dicha sola, y **enseguida más voz**: un usuario pidió explícitamente que tras el nombre siguiera explicando, porque un hueco largo ahí se nota.
- **Cada frase tiene su trabajo:** explicar los pasos, el resultado, la garantía, la idea clave y la llamada a la acción. Termina en una pregunta al público objetivo y una invitación concreta («Pide una demo en la web.»).
- **Las palabras de la voz son las de la pantalla.** La imagen cuelga de ellas: una palabra marca una casilla, otra pone el sello, otra abre el editor y «rechazamos» rechaza la pieza.
- **Sin promesas** de resultados, ingresos ni plazos que no estén escritos, y nada del vocabulario que vete el proyecto.

Plantilla de frases, con su pausa previa (`gap`, en fotogramas) y su intención. Los `gap` son los del vídeo de referencia:

| id | Qué dice | gap | Intención |
|---|---|---|---|
| marca | El nombre del producto | — | Nombre de marca, seguro y cálido, termina bajando |
| explica | Los tres pasos del servicio, en una frase | 20 | Explicación tranquila y cercana, tres pasos seguidos, termina bajando |
| resultado | A dónde llega lo que hace el producto | 40 | Afirmación tranquila, apoyo a la imagen |
| garantia | Qué pasa cuando algo sale mal | 74 | Aclaración tranquila y honesta |
| clave | La idea que diferencia al producto | 20 | Afirmación firme, la idea clave |
| cta | Pregunta al público e invitación | 36 | Pregunta cercana que sube, y después invitación tranquila |

## Elegir la voz

- **Una voz fija por producto.** Elígela de oído entre 3 y 5 candidatas de la biblioteca de ElevenLabs, con el acento del público (para España, una voz de España). Anota su `voice_id` en la configuración del proyecto, no en la skill, y no repitas el casting salvo que el usuario pida otra voz.
- **Cómo comparar candidatas**, con las mismas frases del vídeo en cada voz:
  - fuera del casting las voces suaves, susurradas o sensuales: el adjetivo de la biblioteca ya avisa;
  - inteligibilidad bajo la música real del vídeo: la confianza media de Whisper por palabra, con la música 3 y 8 dB por debajo de la voz (`scripts/claridad.py`);
  - limpieza de la voz con HNR y CPPS (Praat): cuanto más alto, menos aire;
  - las eses: la energía entre 4,5 y 8 kHz. Por encima del 3 % suena afilada y cansa (también la da `claridad.py`);
  - en una voz femenina clara, un tono medio de 200-230 Hz. Por debajo de 190 Hz suena más pesada.
- **Una puntuación automática no basta para elegir voz.** Si sus componentes son percentiles dentro del lote, premian quedar en el medio, no ser mejor. Decide de oído entre las dos o tres primeras.
- **Comprueba que la voz se puede usar comercialmente** con el plan que tengas. Las voces de la biblioteca tienen condiciones propias.
- **Modelo `eleven_v4`** con `language_code: es`. Es el más expresivo, pero no controla la velocidad. La alternativa estable es `eleven_multilingual_v2`.
- **Estabilidad 0,55**, con tomas a 0,45, 0,5, 0,55 y 0,6. Pide 4 tomas por frase y elige la que suene más natural y quepa en su hueco.
- **Etiquetas** como `[warmly]`, una como mucho: a veces las lee en voz alta.
- **Comprueba que la pregunta sube.** Mide el tono en la última vocal con voz de la pregunta, no en el final de la palabra: una palabra que acaba en -s sorda no tiene tono. En el vídeo de referencia, la toma con mejores puntos no subía (−0,8 semitonos) y otra subía +7,6. Las etiquetas como `[confident]` aplanan las preguntas.
- **Números y siglas:** escríbelos como se dicen si los lee la voz. En pantalla pueden ir en cifra («48 h»).

## Generar

Con `scripts/elevenlabs.py`:

```
uv run scripts/elevenlabs.py voz <voice_id> "Texto de la frase, tal como se dice." voz/explica.wav --estabilidad 0.55 --toma 0
```

Junto al wav deja `explica.json` con cada palabra y su inicio y fin en segundos (de la alineación de ElevenLabs). Cuesta unos créditos por carácter: antes de un lote grande, mira los créditos libres (`elevenlabs.py plan`).

## Colocar la voz en la línea de tiempo

La plantilla no tiene voz, así que no trae este script. Si añades voz, su lógica es esta:

1. Cada frase se filtra (paso alto a 70 Hz, compresión 3:1) y todas se nivelan con **una ganancia común**, para que mantengan su equilibrio. Se limitan a -2 dBFS para dejar margen al AAC.
2. Se detecta dónde empieza y acaba de verdad el habla (ventanas de 20 ms por encima de -40 dB del pico).
3. La primera frase empieza en `layout.lead`. Cada siguiente empieza `gap` fotogramas después del final real de la anterior: pausas de silencio, sin estirar ni acelerar la voz.
4. Se reescriben `from`, `to` y `words` (en fotogramas absolutos: `f = from + round(inicio·fps)`) en `timeline.json`, y la duración total con `frames = final de la última + layout.tail`.
5. **Después**, ajusta `music.end` al golpe de la marca final si no coincide con `frames`. En el vídeo de referencia: `end` 917 y `frames` 977.

Como la imagen lee esos fotogramas, cambiar una frase mueve la animación sola. Si un momento queda apretado, cambia el `gap` de esa frase y vuelve a colocar.

## Voz sobre la plantilla (imagen ya montada)

La imagen de la plantilla no depende de ninguna voz. Si se la añades, no encadenes las frases: pon en cada una `at`, el fotograma de su evento (una constante de `Plantilla.tsx`, como `MARCA_AT` o `REV`), y coloca ahí su primer sonido sin mover la imagen. Cada frase dice su rótulo. Si dos frases quedan pegadas (menos de unos 10 fotogramas entre ellas), quita una y deja ese rótulo para leerlo en silencio.

**Mezcla:** la música baja unos 8 dB bajo cada frase (0,4 de volumen, con rampas de 6 y 10 fotogramas) y los efectos un 30 %. Con la voz a −14 LUFS queda unos 9 dB por encima de la música. Si quieres avisar en pantalla de que la voz es generada, `Lockup` acepta una `nota` («Voz generada con IA»).

## Palabras del guion → fotogramas

```ts
const palabras = (id: string) => {
  const l = linea(id);
  const script = l.text.split(/\s+/).filter(Boolean);
  const n = l.words.length;
  return script.map((t, i) => {
    const k = n === script.length ? i : Math.round((i / Math.max(1, script.length - 1)) * (n - 1));
    return {t, f: l.words[k]?.f ?? l.from};
  });
};
```

Indexa por posición en el guion (`palabras('explica')[10]` es la undécima palabra). Cuenta las palabras con cuidado: un índice desplazado deja un rótulo sin su primera palabra.

## Antes de dar la voz por buena

- Escucha las preguntas: la entonación tiene que subir. Si no sube en ninguna toma, avisa al usuario en lugar de esconderlo.
- Comprueba que el nombre de marca se entiende.
- Al publicar, el vídeo se marca como hecho con IA en la plataforma. No hace falta rotularlo en pantalla si el usuario no lo pide.

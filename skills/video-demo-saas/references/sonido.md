# Sonido: paquete de efectos, música, mezcla y silencios

## De dónde sale cada sonido

No se ha descargado nada de bibliotecas: **todo está generado con ElevenLabs** desde una cuenta de pago, y guardado en caché para no pagar dos veces.

| Qué | Modelo y punto de la API | Cómo |
|---|---|---|
| Efectos | `eleven_text_to_sound_v3`, `POST /v1/sound-generation` (`text`, `duration_seconds`, `prompt_influence`) | 3-4 candidatos por efecto, cribados por medida, filtrados y normalizados a 0,89 de pico |
| Teclas sueltas | La misma, con un tecleo largo de 3 s | Se corta en 8 pulsaciones con `scripts/cortar_teclas.py` |
| Música | `music_v2_5`, `POST /v1/music` con un `composition_plan` por tramos | 3 tomas, elegida de oído y nivelada con `scripts/nivelar_musica.py` |
| Voz | `eleven_v4`, `POST /v1/text-to-speech/{voz}/with-timestamps` | Ver `voz.md` |

La clave se lee solo de `ELEVENLABS_API_KEY`. **Licencias:**

- El plan gratuito de ElevenLabs no permite uso comercial ([términos](https://elevenlabs.io/terms-of-use)): `elevenlabs.py plan` avisa si la cuenta es gratuita.
- Música: lee los [Music Terms](https://elevenlabs.io/music-terms) vigentes. En la versión del 9 oct 2026, los planes hasta Pro eran solo para uso individual, Scale admitía organizaciones de menos de 10 empleados, y ningún plan salvo Enterprise Music cubría cine, TV, radio ni videojuegos de estudio. Tampoco se puede reunir la música generada en una biblioteca para terceros.
- Si cambia el plan o la cuenta, vuelve a revisar los términos antes de publicar.
- Lo que generes es tuyo para usarlo en tus vídeos, pero no lo publiques suelto como paquete o biblioteca: la [política de uso](https://elevenlabs.io/use-policy) prohíbe poner los resultados a disposición de terceros.

## El paquete de efectos (27 sonidos, por receta)

El audio no se reparte, porque los términos de ElevenLabs no permiten distribuir lo generado. Lo que viene es la receta, `assets/sonidos/receta.json`, con el prompt, la duración, la influencia y la familia de cada efecto, y `scripts/paquete_efectos.py`, que lo genera con tu clave, lo criba con las reglas de abajo y lo deja listo en la carpeta que le digas:

```
uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<proyecto>/sfx
```

Pide 3 tomas por efecto: las 3 tomas de los 20 prompts suman unos 60 s de audio generado. Mira antes tus créditos con `elevenlabs.py plan`. Cada cuenta obtiene tomas distintas, así que escucha el resultado. Si un efecto no convence, pide otra toma con `elevenlabs.py efecto` (otra `--toma`) y vuelve a generar solo ese con `--solo`. Sin ElevenLabs, usa tus propios sonidos con los mismos nombres.

Los prompts están en inglés porque así responde mejor el modelo. Volumen y desfase son los del vídeo de referencia: el desfase, en fotogramas, adelanta el sonido para que su pico caiga en la acción.

| Archivo | Prompt (resumen) | s | Influencia | Familia | Vol. | Desfase | Cuándo |
|---|---|---|---|---|---|---|---|
| `ui-click` | Soft modern mouse click on a trackpad, short clean interface click, no reverb, one-shot | 0,5 | 0,7 | tick | 0,40 | −3 | Cada clic del cursor |
| `slice` | Fast crisp digital slice swish, a clean blade cutting through air, short and bright, no metallic ring | 0,6 | 0,5 | air | 0,30 | −4 | El cabezal corta (mensaje, clips en la regla) |
| `card-in` | Short soft airy whoosh of a card sliding in, modern app interface transition, gentle, no low rumble | 0,8 | 0,45 | air | 0,20 | −8 | Llega una tarjeta o una pantalla |
| `zoom` | Smooth airy camera zoom-in whoosh, modern motion graphics transition, clean, no low rumble | 1,0 | 0,45 | air | 0,24 | −12 | Salto de los clips a los móviles |
| `pop` | Tiny soft bubbly interface pop, short and gentle, clean | 0,4 | 0,6 | tick | 0,26 (de 0,14 a 0,22 según el caso) | 0 | **Todo lo que aparece**: chips, filas, móviles, etiquetas, lema |
| `success` | Soft pleasant two-note interface confirmation chime, warm and short, no reverb tail | 0,8 | 0,6 | tick | 0,30 | 0 | Aprobado, solicitud recibida |
| `rechazo` | Soft muted two-note descending interface notice tone, gentle and calm, short, no reverb | 0,6 | 0,6 | tick | 0,30 | 0 | Rechazado |
| `sello` | Firm soft rubber stamp pressed on paper on a desk, short and clean | 0,5 | 0,6 | tick | 0,42 | −1 | Sellos «Aprobado por escrito», «Ejemplo» |
| `publicado` | Soft short friendly phone notification blip, modern app, no reverb tail | 0,5 | 0,6 | tick | 0,24 | 0 | Notificación en un móvil |
| `enviar` | Short soft whoosh of a chat message being sent in a modern messaging app, light and clean | 0,5 | 0,6 | tick | 0,34 | 0 | Enviar un mensaje |
| `soltar` | Soft muffled thump of a file dropped into an app upload area, short clean interface sound | 0,5 | 0,6 | tick | — | — | Soltar un archivo (no se usó en el vídeo de referencia) |
| `transicion` | Smooth wide airy whoosh for a scene transition in a modern product video, soft attack, no low rumble | 1,0 | 0,5 | air | 0,22 | −9 | Cambio de fondo por revelado circular |
| `paper-plane` | Quick paper fold crinkle followed by a light airy whoosh of a paper plane flying away | 1,2 | 0,5 | air | 0,34 | −13 | Avión de papel al enviar el formulario |
| `logo-hit` | Deep soft cinematic impact with a short warm tail, modern logo reveal hit, not boomy | 1,2 | 0,5 | hit | 0,48 | 0 | Marca (apertura y cierre) |
| `magia` | Magical sparkle shimmer, a quick bright twinkle of tiny bells and glitter over a soft airy whoosh, clean, short | 0,9 | 0,5 | air (agudos hasta 75 %) | 0,10-0,22 | −2 | Apariciones mágicas importantes |
| `monedas` | A burst of gold coins tumbling and clinking together, bright cheerful cascade, close and clean, no music | 1,6 | 0,5 | swell (1,8 s) | 0,38 | −1 | Lluvia de monedas |
| `giro` | Fast swirling whoosh of a phone flipping in the air, quick spin swish, clean modern motion graphics, no low rumble | 0,8 | 0,5 | air | 0,34 | −4 | El móvil gira |
| `scroll` | Rapid swipe flicks of a phone feed scrolling faster and faster, airy clean whooshes that speed up, modern interface, no music | 2,5 | 0,45 | swell (2,8 s) | 0,30 | 0 | Feed que acelera |
| `asombro` | Bright cinematic impact with a shimmering sparkle tail, a wow reveal moment in a product video, clean, not boomy | 1,3 | 0,5 | hit | 0,50 | 0 | Momento de asombro |
| `tecla0`-`tecla7` | Cortadas de «Fast natural typing on a quiet modern laptop keyboard, about fourteen crisp separate key presses with tiny pauses, close and dry, no music, no voice» (3 s, 0,6) | 0,1 | — | — | 0,22-0,32 | 0 | Cada letra tecleada |

`magia` y `monedas` no pasan la criba de agudos (88 % sobre 6 kHz): un centelleo y unas monedas son agudos por naturaleza. Se aceptan bajos de volumen, con `max_high` subido en su ficha.

Para generar uno nuevo, sigue el mismo estilo de prompt: qué es, dos o tres adjetivos («soft, short, clean»), lo que no quieres («no reverb», «no low rumble», «not boomy») y «one-shot». Fija la duración y genera de 3 a 4 tomas:

```
uv run scripts/elevenlabs.py efecto "Soft short interface toggle switch click, clean, no reverb, one-shot" 0.5 sfx/toggle.mp3 --influencia 0.6 --toma 0
```

**Criba** (reglas nacidas de rechazos reales de clientes):

| Familia | Duración activa máx. | Energía bajo 150 Hz | Energía sobre 6 kHz | Filtro |
|---|---|---|---|---|
| tick (interfaz) | 0,35 s | ≤ 30 % | ≤ 45 % | paso alto 200 Hz, paso bajo 12 kHz |
| hit (golpe) | 0,9 s | ≤ 40 % | ≤ 50 % | paso alto 120 Hz, paso bajo 14 kHz, −3 dB sobre 9 kHz |
| air (barrido) | 1,8 s | ≤ 35 % | ≤ 50 % | paso alto 170 Hz, paso bajo 11 kHz |
| swell (subida) | 1,3 s | ≤ 30 % | ≤ 50 % | paso alto 200 Hz, paso bajo 12 kHz |

Nada retumbante, nada chirriante, subidas cortas. Entre los que pasan, en los tick y los hit gana el ataque más rápido y corto. Recorta a 4 ms antes del ataque, con fundidos de 2 ms de entrada y 40 ms de salida.

## Colocar los efectos

Cada efecto va **en el fotograma de lo que lo provoca**, calculado desde las mismas constantes que la animación. Así, si se mueve la imagen, se mueve el sonido.

```tsx
const SFX = {'ui-click': {vol: 0.4, desfase: -3}, 'card-in': {vol: 0.2, desfase: -8}, /* … */};
type Cue = {f: number; k: string; v?: number};
const teclas = (ks: number[], semilla: number, vol: number): Cue[] =>
  ks.map((f, i) => ({f, k: `tecla${(i * 3 + semilla) % 8}`, v: vol + 0.06 * Math.sin(i * 2.3 + semilla)}));
const CUES: Cue[] = [
  ...teclas(MSG_KEYS, 2, 0.22),
  {f: SEND + 1, k: 'enviar'}, {f: CUT, k: 'slice'}, {f: MARCA_AT, k: 'logo-hit'},
  ...[0, 1, 2, 3, 4].map((j) => ({f: ROW0 + j * ROW_GAP, k: 'pop', v: 0.2})),
  {f: STAMP, k: 'sello'},
  /* … */
];
const Efectos = () => <>{CUES.map((c, i) => {
  const fx = SFX[c.k];
  return <Sequence key={i} from={Math.max(0, c.f + fx.desfase)} layout="none">
    <Html5Audio src={staticFile(`proyecto/sfx/${c.k}.wav`)} volume={c.v ?? fx.vol} />
  </Sequence>;
})}</>;
```

- **Teclas:** una por letra, alternando las 8 muestras con una semilla distinta en cada tecleo y un volumen que oscila ±0,06, para que no suene a la misma tecla repetida. El Intro o el botón de enviar llevan una tecla más fuerte.
- **Pops:** en cada elemento que aparece, entre 0,14 y 0,26. El usuario los pidió expresamente («cuando aparece, ¡plup!, un pop»): sin ellos, el vídeo se siente vacío.
- **Barridos** (`card-in`, `zoom`, `transicion`, `paper-plane`): con desfase negativo, porque su pico llega tarde.
- **Bajo la voz**, los efectos suaves y fuera de las sílabas acentuadas.

## Música

1. **Plan por tramos en fotogramas de la composición** (`timeline.json` → `music.sections`). La plantilla trae los suyos en `assets/codigo/timeline.json` y el plan ya convertido para ElevenLabs en `assets/codigo/plan-musica.json`.
   - Estilos comunes en inglés, repetidos en cada tramo: `minimal electronic, soft pulse, clean modern, warm analog synth, instrumental, 120 BPM`.
   - Tramos del vídeo de referencia con voz:

     | Tramo | Fotogramas | Etiquetas |
     |---|---|---|
     | intro | 0-114 | soft warm synth pad, gentle, sparse, no drums, quiet anticipation |
     | opening | 114-277 | soft pulse enters, warm bass, light percussion, steady |
     | body | 277-726 | steady soft pulse, light percussion, sparse, leaves space for voice-over |
     | lift | 726-917 | gentle build, brighter synth, light percussion |
     | outro | 917-1007 | decisive button ending, final staccato hit on the downbeat, then silence |

   - Estilos negativos: `vocals, lyrics, humming, choir, spoken word, long intro, fade out, long reverb tail, riser, EDM drop`.
   - Cada tramo dura al menos 3 s, y no se nombran artistas ni marcas.
   - **La API rechaza tramos de menos de 3 s** (error 422, `duration_ms ≥ 3000`). Si un momento dura menos, júntalo con el tramo vecino y pon su golpe en las etiquetas («soft impact on the first downbeat»). El tramo final también debe durar 3 s: alárgalo más allá del final del vídeo y corta la toma.
   - **Sin voz**, la música es la cama: `intro 0-131` (plucked synth arpeggio, light shaker, no kick drum), `groove 131-419`, `build 419-509` (building intensity, snare build), `wow 509-613` (full energy on the first downbeat, euphoric), `steady 613-777`, `lift 777-940` y `outro 940-1030`. Estilos: `modern electronic, clean product demo music, warm synths, tight light drums, instrumental, 120 BPM`.
2. **Tres tomas.** En cada una se busca el golpe final y se desplaza para que caiga en `music.end` (hasta 300-400 ms; si el desfase es mayor, se regenera). Elige de oído: en el vídeo de referencia ganó la toma 0 porque crece mejor.
3. **Nivela** para que nunca baje a algo que suene a silencio:
   ```
   uv run scripts/nivelar_musica.py take0.wav public/proyecto/musica.wav --curva "0:-28,114:-28,130:-22,726:-22,917:-21" --fin 917
   ```
   Queda a -28 LUFS bajo el tecleo del gancho, sube a -22 con la marca y llega a -21 en el golpe final. Desde ahí la ganancia se congela, para que la cola se apague sola.
   Sin voz, la curva es `0:-17, 131:-17, 139:-16, 419:-16, 509:-14.5, 613:-14.5, 627:-16, 777:-16, 940:-15`: presente desde el principio, sube con el asombro y vuelve. Sin voz encima, la mezcla queda en torno a −16 LUFS; con −19 de partida el borrador se quedó en −17,5.
   Si no puedes escuchar las tomas, elige por medida: el golpe final más cerca de `music.end` y los cambios de sección más cerca de los momentos del guion (energía 1,5 s antes y después de cada uno). Sin voz, ganó la toma 1, a 0 ms del final.
4. **En Remotion**, música desde el fotograma 0 a volumen 1 cuando no hay voz y a 0,42 bajo la voz. Baja 6 fotogramas antes de cada frase, sube 10 fotogramas después y se funde en los últimos 15:
   ```tsx
   const musicaVol = (fr: number) => {
     const voz = Math.max(0, ...tl.vo.map((l) => Math.min(p(fr, l.from - 6, 6), 1 - p(fr, l.to + 2, 10))));
     return mix(1, 0.42, voz) * p(fr, 0, 4) * (1 - p(fr, tl.frames - 16, 15));
   };
   <Sequence from={0} layout="none"><Html5Audio src={staticFile('proyecto/musica.wav')} volume={musicaVol} /></Sequence>
   ```
   Sin voz, `musicaVol = (fr) => p(fr, 0, 4) * (1 - p(fr, total - 16, 15))`: no baja nunca.
5. **Alargar un acto con la música ya hecha** (en una versión con voz, la llamada a la acción necesitó 2 s más). No regeneres la música: repite un compás.
   - Mide el pulso con librosa (`beat_track` y una recta por los tiempos). En el vídeo de referencia sale 120,004 BPM, así que 2 s son exactamente 4 tiempos, un compás.
   - Alarga el acto en múltiplos de compás: 60 fotogramas a 120 BPM y 30 fps.
   - El salto es uno solo: `salida = pista[:s] + pista[s − 2 s:]`. En `s` la pista vuelve 2 s atrás y todo lo de después se retrasa 60 fotogramas, golpe final incluido.
   - `s` va justo antes de un tiempo, con un fundido de potencia constante de 12 ms. Elígelo dentro del tramo que se alarga y donde los dos lados se parezcan más: `scripts/empalme.py` sin fotograma compara seis tiempos por su espectro medio antes y después del salto.
   - Comprueba después que el pulso sigue a 120 y que el golpe final cae en el nuevo `FIN` + 1. Guarda la pista nueva aparte, sin tocar la anterior. En la plantilla, cambia también `timeline.json`.
   ```
   BEAT0=776.2 uv run scripts/empalme.py musica.wav x.wav          # mide los candidatos (BEAT0: un tiempo medido, en fotogramas)
   BEAT0=776.2 uv run scripts/empalme.py musica.wav nueva.wav 866.2
   ```

## Silencios: la regla que más se nota

El usuario lo dijo así: «cuando hay silencio… no sé dónde presta atención». En la primera versión, la música estaba casi en silencio entre la marca y el portátil y no había pops. Desde entonces:

- La música suena **desde el fotograma 0** y nivelada, aunque sea muy suave bajo el gancho.
- Todo lo que aparece suena, y el tecleo suena letra a letra.
- **Medida obligatoria:** `uv run scripts/silencios.py video.mp4 -29` no puede dar ningún tramo de 0,3 s o más por debajo de -29 LUFS momentáneos. En el vídeo de referencia la mediana queda en -18,4 y el percentil 10 en -27,2.

## Volumen final

- El vídeo de referencia sale a **-16 LUFS integrados y -3,2 dBTP de pico real**, directamente del render, sin retocar después. Lo miden `scripts/medir.py` o `silencios.py`.
- Si el destino pide más volumen (por ejemplo, -14 LUFS y -1 dBTP), sube la voz y la música de forma proporcional, o aplica la ganancia sobre el MP4 y vuelve a medir el pico.
- No dejes que nada salga a más de -1 dBTP.

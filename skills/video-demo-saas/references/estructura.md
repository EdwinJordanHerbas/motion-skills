# Guion, actos y línea de tiempo

## Formato

- 1080×1920, 30 fps, entre 25 y 35 s. El vídeo de referencia con voz dura 32,6 s (977 fotogramas); la plantilla sin voz, 32,9 s (988).
- Fondo claro, una tipografía sans de interfaz para los rótulos (peso 700) y para la interfaz, y una mono en mayúsculas para las etiquetas. Un único color de acento: el de la marca.
- **Zona segura: x 65-888, y 288-1248.** Ahí van todo el texto, los botones, la marca y los datos clave. Lo que queda fuera lo tapan la interfaz de la red, el nombre, el texto de la publicación y los botones de la derecha. El detalle y las fuentes están en `references/atencion-ojo.md`. Compruébalo con `scripts/zonas.py` antes de entregar.

## Los actos

Cada acto nace del anterior. Los fotogramas son los del vídeo de referencia con voz y solo sirven de orientación: en uno nuevo salen de la voz o de las constantes del guion.

| Fotogramas | Acto | Qué se ve | Cómo enlaza |
|---|---|---|---|
| 0-114 | **Gancho sin voz** | El cliente escribe su problema, con sus palabras, en una tarjeta de cristal (destinatario, un adjunto y una frase) y lo envía. Solo suenan las teclas y una música suave | La burbuja sube y el cabezal de la marca la corta |
| 114-160 | **Marca** | El nombre en texto con su lema. La voz dice solo el nombre | La marca sube y se desenfoca mientras llega el portátil |
| 162-277 | **Cómo funciona** | El portátil llega cerrado, gira, abre la tapa y se enciende. Aparecen el aviso «recibido», una lista de pasos que se marcan con la voz y un sello | La pantalla pasa al editor |
| 277-356 | **El producto trabajando** | La acción principal en pantalla: un editor con su línea de tiempo, el cabezal la recorre y corta tres piezas | Las piezas saltan de la regla a las pantallas de los móviles |
| 356-489 | **Resultado** | Tres móviles 3D con la app vertical y una notificación de «publicado» | Los móviles se encogen hasta ser las miniaturas de la revisión |
| 489-615 | **Garantía** | Revisión: dos aprobados y uno rechazado, con su motivo y su apelación | La tarjeta se va al fondo y llega el informe |
| 615-726 | **Prueba sin cifras** | Informe con el sello «Ejemplo», estados «Pendiente» y «Excluido», y la columna clave resaltada | Corte a la llamada a la acción |
| 726-917 | **Llamada a la acción** | Una pregunta al público objetivo, el botón y el formulario real de la web: elegir opción, escribir el correo y enviar. Un avión de papel y el aviso «Solicitud recibida» | El cabezal baja sobre el aviso y firma |
| 917-977 | **Cierre** | Marca con el lema. Precio o condición solo si el cliente lo pide | Fin, con el golpe final de la música |

### En la plantilla (sin voz)

Los mismos actos, con los fotogramas de `assets/codigo/Plantilla.tsx`. Son fijos: los textos de `ajustes.ts` no los mueven.

| Fotogramas | Acto | Qué se ve | Rótulo (`ajustes.rotulos`) | Cómo enlaza |
|---|---|---|---|---|
| 0-131 | **Gancho** | Chat: el adjunto cae (8), el mensaje se teclea (18-79) y se envía (85), «escribiendo…» (90) y la respuesta (104) | ninguno: el mensaje es el texto | La respuesta vuela al centro (120) y la barra de acento la corta (128) |
| 131-169 | **Marca** | Icono, nombre letra a letra y lema | — | La marca sube y se desenfoca mientras llega el portátil |
| 169-305 | **Cómo funciona** | El portátil llega cerrado, gira y abre la tapa. Aviso «recibido» (199), cinco pasos (245-277) y sello (285) | `recibe` (195), `pasos` (239) | La pantalla pasa al editor (305) |
| 305-381 | **El producto trabajando** | El cabezal recorre la línea de tiempo (311-351) y corta tres piezas | `trabajo` (301) | Las piezas saltan a los tres móviles (359) |
| 381-509 | **Resultado** | Tres móviles con la pieza publicada. El del centro se inclina (427), su feed acelera (437) y salen tres insignias | `llega` (383), `ritmo` (443) | Asombro: fogonazo y golpe de cámara (509) |
| 509-613 | **Emoción** | Giro de 360° (517), pantalla de resultado (532) y halo de diez monedas (555) | `resultado` (567) | El móvil y las monedas caen fuera de cuadro (600) |
| 613-777 | **Garantía y prueba** | Revisión: dos aprobados y un rechazo con su motivo (633-683). Informe con sello «Ejemplo» y su columna destacada (713) | `revision` (619), `informe` (727) | Corte a la llamada a la acción |
| 777-940 | **Llamada a la acción** | Botón (793), clic (807), formulario: primera opción (827), correo (839-867), enviar (879), avión (884) y aviso (900) | `pregunta` (779) | La barra baja y firma |
| 940-988 | **Cierre** | Marca con `lemaFinal` | — | Golpe final de la música (940) |

Patrón reutilizable para cualquier SaaS:

1. **Gancho:** el problema del cliente, en sus palabras y en la interfaz donde lo diría (mensaje, búsqueda, correo). Sin voz durante unos 4 s.
2. **Marca:** corta el gancho, y la voz dice solo el nombre.
3. **Cómo funciona:** el dispositivo con la pantalla real, paso a paso, con la voz.
4. **El producto trabajando:** la acción principal ocurre en pantalla.
5. **Resultado:** a dónde llega lo que hace el producto.
6. **Garantía o control:** qué pasa cuando algo sale mal (revisión, motivo, apelación).
7. **Prueba sin inventar:** informe o plantilla con «Ejemplo», «Pendiente» o datos reales con fuente.
8. **Llamada a la acción:** la pregunta al público objetivo y el formulario o botón real de la web, rellenado delante de la cámara.
9. **Cierre:** marca y condición, con el golpe final de la música.

## Reglas del guion

- **La pantalla cuenta la historia.** Si tapas el sonido, se entiende igual: cada paso tiene su rótulo de producto (línea en tinta y línea gris), con las palabras de la voz si la hay.
- **Un foco por momento.** Cuando entra algo nuevo, lo anterior baja, se desenfoca o sale.
- **Nada quieto más de 0,6 s.** La cámara siempre deriva un poco y hay brillos o pequeñas subidas.
- **Textos exactos:** los de la web y del producto, con tildes y signos de apertura. Los datos ficticios van marcados («Ejemplo», `tu@correo.com`).
- **El dominio y las redes** solo aparecen si existen y están registrados. Si no, se quitan: el kit de marca debe permitir pintar la marca sin dirección.
- **No prometas lo que no existe**, como autoservicio, resultados o ingresos. Revisa los vetos de las instrucciones del proyecto.

## `timeline.json`

La imagen y el sonido leen de aquí. La plantilla trae el suyo, sin voz (`assets/codigo/timeline.json`): duración, tramos de música (`music.sections`), golpe final (`music.end`) y momentos clave. Con voz, se añaden la disposición y la lista `vo`:

```json
{
  "fps": 30,
  "frames": 977,
  "bpm": 120,
  "layout": {"lead": 121, "gap": 12, "tail": 150},
  "vo": [
    {"id": "marca", "text": "Nombre.", "intent": "Nombre de marca, seguro y cálido, termina bajando",
     "from": 118, "to": 145, "file": "proyecto/voz/marca.wav",
     "words": [{"w": "Nombre.", "f": 118, "e": 140}]}
  ],
  "cues": [{"id": "ui-click", "frame": 0, "kind": "ui-click"}],
  "music": {
    "styles": ["minimal electronic", "soft pulse", "clean modern", "warm analog synth", "instrumental", "120 BPM"],
    "sections": [{"name": "intro", "from": 0, "to": 114, "tags": ["soft warm synth pad", "no drums"]}],
    "end": 917
  }
}
```

- `layout.lead` es lo que dura el gancho sin voz, `gap` la pausa por defecto entre frases y `tail` el cierre tras la última frase.
- Cada frase lleva su propio `gap`, que es silencio real de voz entre el final de la anterior y su primer sonido. Elígelo según lo que tenga que pasar en pantalla entre las dos. En el vídeo de referencia va de 20 a 74 fotogramas.
- `from`, `to` y `words` los escribe el script que coloca la voz, nunca la mano. Antes de generar una frase nueva, ponle un `from` y un `to` provisionales y descarta las tomas que duren más que `to - from` («dura 6,48 s y cabe en 6,17 s»). Si una frase buena no cabe, ensancha su ventana.
- `intent` describe en una línea cómo debe sonar la frase, y sirve para elegir la toma.
- `music.end` es el fotograma donde cae el golpe final, el de la marca del cierre.

## Animación colgada de la voz

En la composición, los fotogramas de las palabras se leen una vez y todo lo demás se deriva de ellos:

```tsx
const linea = (id: string) => tl.vo.find((v) => v.id === id)!;
const palabras = (id: string) => { /* palabra del guion -> fotograma de la palabra alineada (ver voz.md) */ };
const V = {
  marca: linea('marca').from,
  paso1: palabras('explica')[4].f,      // la palabra que nombra el primer paso
  sello: palabras('explica')[8].f,      // la palabra que justifica el sello
  editor: palabras('explica')[10].f,    // la palabra que abre el editor
  rechazo: palabras('rechazo')[2].f,
  /* … */
};
const ROW0 = V.paso1 + 2;                                // los pasos empiezan a marcarse con su palabra
const STAMP = Math.max(ROW0 + 4 * 8 + 8, V.sello + 4);   // el sello cae tras su palabra y tras el último paso
const EDIT = V.editor;                                   // el editor se abre con su palabra
const R = [V.rechazo - 22, V.rechazo + 4, V.rechazo + 34];  // el rechazo cae en su palabra
```

- El gancho, sin voz, usa sus propios tiempos: teclas con un ritmo natural (`MSG_KEYS`, pausas más largas tras `.` y `,`), y `SEND`, `CUT` y `MARCA_AT` en cadena.
- La llamada a la acción también: `CTA_A = {press: V.cta + 2, …}` y las teclas del correo con pausas irregulares (`GAPS`).
- Si dos momentos chocan, mueve el `gap` de la voz y no el momento. La voz manda.

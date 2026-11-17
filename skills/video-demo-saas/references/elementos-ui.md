# Elementos de interfaz para vídeo

Catálogo de los elementos UI del mercado y de cómo se replican en código para un vídeo. Lo usa el kit `assets/codigo/ui.tsx`, con un vídeo de ejemplo completo en `assets/codigo/Interfaces.tsx` («Interfaces que se sienten», 13 nov 2026). Léelo antes de diseñar un vídeo que enseñe interfaces: un SaaS, una app, un muestrario o el escaparate de un estudio.

## Fuentes (13 nov 2026)

| Fuente | Qué aporta |
|---|---|
| **shadcn/ui** (59 componentes) | El vocabulario básico: formularios (botón, interruptor, deslizador, casilla, OTP, calendario), navegación (pestañas, menú), superposiciones (diálogo, hoja, menú, paleta de comandos), estado (aviso, progreso, esqueleto, insignia) y datos (tabla, gráfico, carrusel) |
| **Magic UI** (~70 animados) | Efectos de vídeo: contador, texto que brilla o se escribe, palabras que rotan, haz de borde, lista animada (notificaciones), anillo de progreso, bento, marquesina, dock, órbitas, confeti, maquetas de móvil y de navegador |
| **Aceternity UI** (104 gratis) | Efectos de portada: foco, rayos, estrellas, ondas, tarjetas 3D que se inclinan, pila de tarjetas, botón con estados, pestañas animadas, isla dinámica, cristal líquido, mapa del mundo, terminal |
| **Apple Liquid Glass** (iOS 26, WWDC 2025) | Una capa de cristal para controles y navegación que flota sobre el contenido. El pomo del interruptor y del deslizador se vuelve cristal mientras se toca. Los botones se transforman en menús. Las formas son más redondas y concéntricas con su contenedor, la barra de pestañas flota y se encoge al desplazarse, y la hoja inferior se separa del borde |
| **Material 3 Expressive** (Android 16) | Movimiento con muelles en vez de duraciones, formas que se transforman, indicadores de selección «líquidos», grupos de botones que cambian de ancho, botón dividido y menú del botón flotante |
| **Tendencias 2026** (daisyUI, UXPin y otras) | Cristal más tranquilo con zonas opacas para leer, UI espacial (profundidad y capas), tipografía protagonista, neumorfismo con estados claros, claymorfismo, cromo y bento |

Lo que repiten todas:
1. **El control cobra vida al tocarlo**: se estira, se vuelve cristal y rebota.
2. **Muelles en lugar de curvas**: todo llega con un poco de rebote.
3. **Formas que se transforman unas en otras**: botón → círculo → botón, pastilla → tarjeta, rejilla → cabecera.
4. **Cristal sobre contenido real**, con fotos detrás y no degradados planos.
5. **Profundidad**: capas que flotan a distinta distancia y desenfoque de lo lejano.

## Qué funciona en un vídeo vertical

- **Grande.** El elemento ocupa del 70 al 80 % del ancho de la zona segura (unos 600-800 px). Un interruptor de 51 px de iOS se dibuja a 200 px.
- **Un cambio de estado por golpe de música** (15 fotogramas a 120 BPM). Lo que no cambia de estado no se nota.
- **Causa visible**: un toque (el «conductor») llega, aprieta y suelta. Nada cambia solo.
- **Su nombre, como en una herramienta de diseño**: un marco azul con asas y el nombre del componente («Interruptor», «Calendario»). Se lee en 1 s y explica qué se enseña.
- **Concreto y con color por negocio**: casa en naranja, música en violeta, restaurante en terracota, deporte en lima y rosa, tienda en azul. El color está en el control activo, no en todo.
- **Datos de ejemplo con sello «Ejemplo»**: reservas, pasos y pedidos. Sin precios.
- **Cada cambio suena**: clic, toque, deslizar, éxito o notificación.

## Catálogo y cómo se mueve

Tiempos en fotogramas a 30 fps. Todo es una función pura del fotograma: el que llama calcula el progreso (`t`, `on`, `abre`) con muelles y el componente solo dibuja.

| Familia | Elemento (`ui.tsx`) | Cómo se mueve |
|---|---|---|
| Control | `Interruptor` | Al apretar (4 f), el pomo se ensancha ×1,2 y se vuelve cristal. Recorre con un muelle (amortiguación 14), estirándose ×1,35 a mitad de camino. La pista se llena de color a la vez |
| Control | `Deslizador` (fino) y `DeslizadorGrueso` (Centro de control) | Mientras se arrastra, el pomo crece ×1,4 y se vuelve cristal. El relleno y el valor siguen al dedo, y al soltar el pomo vuelve a su tamaño con rebote |
| Control | `Segmentado` | El indicador viaja con un muelle y se estira ×1,3 a mitad de camino («líquido»). El texto cambia de color cuando el indicador lo cubre a medias |
| Control | `BotonEstado` | Al apretar se hunde a 0,96. Luego el ancho se transforma en un círculo (10 f), da vueltas mientras carga, se pone verde, la marca se dibuja (8 f) y el botón vuelve a abrirse con el texto nuevo |
| Control | `Franjas` (chips de hora) y `Casilla` | La elegida se llena con un muelle desde el centro y la marca se dibuja |
| Entrada | `Paleta` (⌘K) | La búsqueda se escribe letra a letra, los resultados se filtran con un muelle y la fila activa se ilumina |
| Entrada | `Codigo` (OTP) | Cada dígito cae en su caja y el cursor pasa a la siguiente |
| Superposición | `Notificacion` y `Pila` | Cae desde arriba con un muelle. Las anteriores se apilan detrás a escala 0,94 y 0,88 y suben 26 px. Se ven tres como mucho |
| Superposición | `Isla` | La pastilla negra se abre en tarjeta: el ancho va más rápido que el alto y el radio sigue siendo concéntrico. El contenido entra con foco 6 f después |
| Navegación | `BarraPestanas` | Barra de cristal flotante con una lente que se desliza entre iconos y se estira al moverse |
| Datos | `Contador` | Odómetro: cada cifra es una tira 0-9 que rueda, y la de las decenas solo gira cuando la de las unidades pasa de 9 a 0 |
| Datos | `Barras` | Crecen en cascada (2 f entre barras) con un muelle que rebota. La destacada va a todo color y lleva una etiqueta que salta |
| Datos | `Linea` | El trazo se dibuja, el área de debajo se rellena detrás y un punto viaja en la punta |
| Datos | `Anillos` | Tres anillos concéntricos que se llenan con 4 f de desfase, con puntas redondas y un brillo en la punta |
| Datos | `Calendario` | La rejilla entra fila a fila y el día elegido se llena con un muelle y un anillo. Luego la rejilla se pliega en la cabecera |
| Datos | `Avatares` | Círculos con iniciales que se solapan y entran de izquierda a derecha |
| Efecto | `BordeHaz` | Una luz recorre el borde de una tarjeta o un botón |
| Efecto | `brilloTexto` | Un brillo blanco cruza el texto |
| Efecto | `Confeti` | Partículas con velocidad, gravedad y giro deterministas que se encogen al final (no se desvanecen) |
| Guía | `Toque` (el conductor) | Un punto de cristal de 70 px: al apretar se hunde a 0,82 y suelta una onda. Siempre hay uno solo |
| Guía | `Marco` | El marco de selección de una herramienta de diseño (borde azul, asas y nombre), que salta al elemento que se enseña |
| Base | `vidrio()`, `Sello`, `Icono`, `Logo` | Tarjeta de cristal clara u oscura con radio concéntrico, sello «Ejemplo», iconos de trazo propios (sin logotipos ajenos) y el símbolo de la marca, que se cambia por el tuyo |

Fuera del kit, porque en vídeo aportan poco o ya están en `estilo.tsx`: tablas densas, formularios largos, migas de pan, paginación, tooltips (sin ratón no se ven), mapas y globos (pesados y poco concretos), marquesinas de logotipos (ajenos) y testimonios (prohibidos si son inventados).

## Cómo se arma un vídeo con el kit

1. **Un negocio por escena**, cada uno con su foto de fondo (Unsplash, `references/estilo-premium.md`) y su color. La foto reacciona al control cuando puede: el interruptor enciende la luz de la foto del salón y el deslizador sube su brillo.
2. **Un conductor**: el toque pasa de un control a otro y es lo que abre la escena siguiente, que se revela en círculo desde donde toca. Algo persistente une las escenas, por ejemplo la isla de la música, que queda arriba en compacto.
3. **El marco con el nombre** entra cuando la escena está quieta y salta al siguiente componente de la misma escena: un foco cada vez.
4. **Cierre en bento**: la última foto se encoge hasta su casilla, las escenas anteriores vuelven a la rejilla en su estado final, la rejilla se inclina hacia atrás como un suelo y encima queda el titular y la firma.
5. **Sonido** del paquete de la skill: `toque` al apretar, `ui-click` al cambiar, `deslizar` al arrastrar (con toques suaves cada 4 f, como háptica), `publicado` en cada notificación, `contador` en los números, `success` en el éxito y `transicion` en cada revelado.

## Fallos que evitar

- Un control pequeño en un cuadro grande no se lee, y la animación no se ve aunque exista.
- Dos cosas moviéndose a la vez (el marco y el toque, o el texto y el control): el ojo no sabe dónde mirar.
- Cristal sobre un fondo liso: sin una foto detrás parece plástico gris.
- `backdrop-filter` dentro de `preserve-3d` se aplana. Cada tarjeta se proyecta con su propio `perspective()` y se ordena a mano por profundidad.
- La etiqueta del marco encima del componente tapa el título de su tarjeta. `Marco` lleva `lado` (`arriba`/`abajo`) y `alinea` (`izq`/`der`): por defecto, debajo; arriba solo si encima no hay texto.
- La barra más alta del gráfico pega su etiqueta contra lo que tiene encima. `Barras` deja hueco con `techo` (0,78: la barra mayor llega al 78 % del alto).
- Si la tarjeta que se va y la que llega se cruzan, por el cristal se ve un borrón de color. La que se va sale unos fotogramas después del toque (`APRIETA + 6`) y antes de que entre la siguiente.
- El revelado de la escena siguiente nace donde está el conductor en ese fotograma (la isla ya se ha movido), no donde estaba al empezar.
- Una cámara que se acerca a un componente de la esquina de un muro enseña el vacío de fuera del muro. Las celdas que se visitan se recolocan en el centro antes de rodar.
- Para enseñar un vídeo del kit dentro de un móvil de otro vídeo, no se mete el MP4: se monta la composición con `cuadro` (el fotograma que pinta) y `sinSonido`. Se ve nítida a cualquier escala, y el vídeo de fuera decide su ritmo: cámara rápida hasta su golpe final en la palabra que toca.

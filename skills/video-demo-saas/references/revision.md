# Render, medidas y fallos ya vistos

## Comandos (Remotion 4)

```
npx tsc --noEmit                                                            tipos, antes de cada render
npx remotion bundle src/index.ts --out-dir=out/<video>/bundle               empaquetar una vez por cambio
npx remotion still out/<video>/bundle <Composición> s.jpg --frame=170 --image-format=jpeg --scale=0.5
npx remotion render out/<video>/bundle <Composición> borrador.mp4 --image-format=jpeg --scale=0.5 --concurrency=4
npx remotion render out/<video>/bundle <Composición> final.mp4 --image-format=png --concurrency=4
```

- **Fotogramas sueltos** (`still`) para cada entrada y cada relevo: son baratos y van primero. Para una entrada, revisa del primer fotograma a +30, cada 3.
- **Borrador** a media escala en JPEG, que tarda unos minutos, y después la hoja de contacto.
- **Final** a escala completa y en PNG: el JPEG aplasta degradados y deja bandas. Lánzalo en segundo plano y avisa al usuario.

## Medir

```
uv run scripts/medir.py final.mp4 hoja.jpg 0,30,60,90,120,165,172,180,…   volumen, pico, duración y hoja de contacto
uv run scripts/silencios.py final.mp4 -29                                   aire muerto (tiene que salir «ninguno»)
```

Mira la hoja de contacto de verdad, fotograma a fotograma, buscando cortes, fantasmas, solapes de rótulos, textos partidos y elementos fuera de la zona segura. Para esto último, saca una hoja aparte con `uv run scripts/zonas.py <mp4> <hoja.jpg> <fotogramas>`, que tiñe de rojo lo que tapa la interfaz. También sirve con un render de prueba a `--scale=0.3`. Cuando entregues, di qué has medido y qué no.

## Fallos reales y su arreglo

| Síntoma | Causa | Arreglo |
|---|---|---|
| El portátil entra «medio cortado, como si fuese un vídeo» | Subía desde 1.100 px bajo el encuadre, con la base inclinada hacia fuera: se veía media base y desde abajo | Llega cerrado y entero, visto desde arriba (`rx` negativo), gira sobre el centro de la base y abre la tapa. Comprueba el encuadre con `encuadre_portatil.py` |
| Al aparecer se ve el teclado a través de la tapa | Se fundía la opacidad de cada material (todo transparente) | Fundir el lienzo entero con CSS |
| Una mancha oscura flota sobre el portátil cerrado | La sombra de la pared, unida a la tapa, quedaba encima al cerrarla | Mostrarla solo con la tapa por encima de 60° |
| Teclado «cortado», le faltan teclas | `InstancedMesh` con capacidad para 78 instancias y 80 escritas | Capacidad de sobra (100) y distribución real |
| Móviles translúcidos sobre el portátil | La pantalla DOM del portátil se pintaba encima de los cuerpos 3D de los móviles, y los móviles se fundían despacio | Apagar la pantalla antes de que se crucen y que los móviles sean opacos enseguida |
| Los móviles se ven borrosos detrás de la tarjeta de revisión | La tarjeta DOM de cristal estaba encima del lienzo | Poner la tarjeta antes del lienzo en el árbol: los móviles se posan encima |
| Dos rótulos se mezclan | La salida del primero no había acabado cuando entraba el siguiente | Calcular `out` para que acabe de salir antes (ver `transiciones-estilo.md`) |
| Un rótulo pierde su primera palabra | Índice de palabra desplazado al partir la frase | Contar las palabras del guion desde 0 |
| El subrayado se queda flotando cuando la palabra ya se ha ido | Se recogía a la vez que salía la palabra | Recogerlo 5 fotogramas antes de que salga |
| «¿» o media palabra solos en una línea | El tecleado letra a letra deja partir en cualquier carácter | Agrupar por palabras en `inline-block` |
| El rótulo repite el título de la pantalla | Mismo texto en el titular y en la interfaz | La pantalla lleva su propio título, distinto del rótulo |
| Un chip tapa el rótulo y la cámara se acerca demasiado | Posiciones fijas sin mirar la cámara | Mover el chip (`top: 1560`) y limitar el zoom a 1,1 |
| El cursor clica en movimiento | Faltaban fotogramas de espera | Claves a −6 y +3 alrededor de cada clic |
| La apertura muestra un dominio que no existe | La marca del kit pinta el dominio por defecto | `sinDireccion` en la apertura; el dominio solo en el cierre y solo si está registrado |
| Silencios incómodos | Música casi en silencio en un tramo y elementos que aparecían sin sonido | Música desde el fotograma 0 y nivelada, pops en todo, y `silencios.py` |
| Volumen a -17,8 LUFS | Música baja y sin nivelar | La música nivelada lo resolvió (-16,0 sin retoques) |
| Una toma de voz buena se descarta por larga | La ventana provisional de la frase era corta (6,17 s para 6,48 s) | Ensanchar `from`/`to` provisionales antes de generar |
| Palabra de acento naranja con subrayado «muy poco profesional» (cliente) | Rótulo de anuncio, no de producto | Rótulo de producto: línea en tinta y línea gris, sin color ni subrayado |
| Tipografía «que no va acorde» (cliente) | Condensada en mayúsculas, copiada de la web | Sans de interfaz en minúscula normal, peso 700, −0,035 em |
| Una palabra («clips.») sola en la segunda línea | El navegador parte por ancho | `textWrap: 'balance'` en la línea principal |
| Mitad superior vacía durante el chat | Sin rótulo en el gancho | Rótulo de gancho corto (dos frases de dos palabras) y cámara que no tapa su zona |
| La música no se genera: error 422 | Tramos de menos de 3 s en el plan | Juntar tramos y alargar el último más allá del final |
| Pantalla de pagos vacía 16 fotogramas tras el giro | Sus elementos colgaban del rótulo, no del giro | Colgarlos de `GIRO + 15`, cuando la pantalla vuelve a mirar a cámara |
| Círculo blanco suelto cuando el móvil se aleja | La pantalla DOM y el lienzo 3D se apagaban a la vez | Ni alejar ni fundir: el móvil cae entero fuera de cuadro |
| El móvil se queda como una losa gris translúcida al irse | Se alejaba fundiéndose: sin la interfaz, la pantalla 3D es oscura | Saltito y caída fuera de cuadro, con la pantalla pegada |
| El dinero tapa la pantalla de pagos y cruza el rótulo | Salía del centro de la pantalla con `vy` de hasta 2.100 px/s (sube unos 700 px) | Nacer en los bordes, volar hacia fuera y limitar el vértice `vy² / 2g` |
| Disco blanco grande en un cuadro vacío | El cambio de fondo empezaba antes de que llegara la tarjeta | Que nazca con la tarjeta, desde su centro |
| Resaltado de columna descuadrado en una tabla (cliente) | Última columna `1fr` y un rectángulo absoluto con `right: −12, width: 214`: empezaba donde el texto y se salía por la derecha, con las líneas de las filas cruzándolo | Rejilla fija que suma el ancho interior, el pozo exacto sobre su pista (`left` = suma de las anteriores), valores centrados en una capa encima y filas `content-box` contadas con su línea de 1,5 px |
| Precio en el cierre que el cliente no quiere | Se arrastró del cierre de la web | Preguntar qué va en el último cuadro; por defecto, icono, nombre y lema |
| Aro blanco tenue arriba durante todo el vídeo | Degradado radial lineal: el pico del cono se ve como un anillo (banda de Mach) | Centro plano y caída suave con varias paradas (0 %, 22 %, 50 %, 78 %, 100 %) |
| Monedas que quedarían detrás de la pantalla del móvil | El DOM se pinta encima del lienzo 3D | Segundo lienzo para lo que sale por delante, colocado después de la pantalla |
| «O presto atención o leo» (cliente) | Rótulo arriba y acción abajo a la vez | Un foco cada vez: rótulo junto a su objeto y con la escena quieta (`references/atencion-ojo.md`) |
| Rótulos «siempre en el mismo sitio» (cliente) | Franja fija arriba para todo el vídeo | `Rotulo` dentro de la cámara, en un sitio distinto por escena y con entradas distintas |
| El dinero no convence (cliente) | Muchas piezas rápidas sin dirección | Halo de 10 monedas grandes que salen en círculo y flotan |
| Monedas vistas de canto, como elipses oscuras | `rx` de 62° sobre una geometría que ya mira a cámara | `rx` de 10 a 25° y menos metal en la cara |
| Una moneda lavada a un lado del móvil | Moneda de la capa de atrás bajo la sombra semitransparente | Quitarla o esconderla detrás del móvil |
| El nombre de la red no se ve en los móviles | La notificación lo tapaba justo cuando se mira | Ponerlo también en la notificación: «@usuario · YouTube» |
| Rótulo del informe sobre una tarjeta borrosa | La revisión se quedaba al fondo al 15 % | Que la tarjeta anterior se vaya del todo |
| Petición de poner logotipos de Instagram, YouTube o TikTok | Chocan con el plan («sin logotipos ajenos») y con las normas de marca | Avisar antes de construir; usar el nombre en texto e iconos universales |
| Medio segundo de silencio al final | Fundido de música en los 16 últimos fotogramas y 60 de cola | Cola de 48 fotogramas y fundido de 4: basta la cola natural de la música |
| Borrador a −17,5 LUFS sin voz | La curva de música se pensó para ir bajo una voz | Subir la curva 2 dB: −17 / −16 / −14,5 / −16 / −15 LUFS a corto plazo |
| «Hay elementos abajo que tapa Instagram» (cliente) | La cámara anclaba en y = 1060, por debajo del centro, y no se comprobó la zona segura. La que había apuntada (220/320/120) no salía de ninguna fuente | Anclar en el centro de la zona oficial (x 65-888, y 288-1248), plano al 86 %, y comprobar con `scripts/zonas.py` |
| La columna clave del informe, las insignias y los estados de la revisión, bajo los botones de la derecha | Cámara empujada a la derecha (x 560) y tarjetas demasiado anchas | Sin empujes a la derecha y menos zoom en las tarjetas anchas: caben en 823 px de pantalla |
| Al alejar el plano, el móvil y las monedas que caen se cortan a media pantalla | El borde del lienzo 3D (el mundo de 1080 × 1920) queda dentro del cuadro | Lienzo con margen y `setViewOffset` en la cámara de three.js; la proyección no cambia |
| «Unos frames se ve el ordenador cortado» al entrar (cliente) | El portátil llegaba girado, abría la tapa inclinado hacia la cámara y en reposo era casi tan ancho como el cuadro | Llega de frente, abre la tapa ya derecho, escala con ~120 px de margen a cada lado y centrado en el cuadro. Mide con `scripts/caja.py` |
| Desde un fotograma, todo en blanco salvo los rótulos | Cámara 2D desplazada en horizontal: Chrome deja de pintar el lienzo 3D y el fondo, y la GPU no se recupera en el resto del render | Mover el objeto, no la cámara. Busca fotogramas rotos con `scripts/huecos.py` |
| Rótulo que sale «de detrás de la tapa» desde el aire | Línea de la tapa fija (`TAPA = 868`) y portátil más pequeño | Calcular la línea desde la pose 3D en reposo |
| La pregunta final, el clic en una opción y el correo «van demasiado rápido»; «capas encima de otras» (cliente) | El rótulo seguía mientras el botón crecía hasta ser formulario; el fondo oscuro pasaba a claro de golpe con los dos textos a la vez; el clic en la opción llegaba 17 fotogramas después de abrirse el formulario | Rótulo fuera, o por debajo de la tarjeta, antes de que crezca; cambio por capas en orden (texto del botón fuera → fondo oscuro fundido → formulario dentro); 1 s de formulario quieto antes del primer clic. Más tiempo sin regenerar la música: un compás repetido (`scripts/empalme.py`) |
| «Enviar solicitud» encima del campo del correo mientras se abre el formulario | El botón de enviar iba anclado abajo (`bottom`) en una tarjeta que crecía, así que subía con el borde | Colocarlo desde arriba con la altura final: mientras la tarjeta crece queda recortado debajo |
| Dos rótulos a la vez en el mismo sitio, unos 7 fotogramas | El siguiente entraba 4 fotogramas antes de la salida del anterior, y la salida «detrás» dura 11 | El `at` del siguiente, después de `out` más lo que dura la salida: palabras + 8 con «sube», 11 con «detrás» o «lado» |
| Un móvil tapa el rótulo de debajo mientras sale | El rótulo salía justo cuando el móvil se inclinaba y crecía sobre su línea | Que termine de salir antes de que empiece el movimiento: `out` unos 12 fotogramas antes |
| Copias planas que asoman por encima de los móviles 3D | Cada pieza volaba hacia el sitio final de su móvil mientras el móvil subía desde abajo: unos 10 fotogramas con los dos a la vez, la pieza por encima | Que la pieza apunte todo el rato a la pantalla de su móvil donde está en ese fotograma (abajo antes de subir): se juntan al aterrizar. Después, fundido corto (4 fotogramas) siguiéndolo |
| Fotogramas en blanco o «Chrome ran out of memory» | Tres lienzos WebGL grandes montados todo el vídeo, por cuatro pestañas | Margen justo, lienzos montados solo en su escena y `delayRender` de arranque soltado tras el primer dibujo |

## Antes de entregar

- [ ] Primeros fotogramas de cada entrada 3D: entera, sin transparencias y sin sombras raras.
- [ ] `caja.py` en cada escena 3D → nunca toca el borde y deja el mismo margen que las tarjetas; `huecos.py` en el render final → sin fotogramas rotos.
- [ ] Cada relevo de rótulos sin solapes, y cada rótulo completo.
- [ ] Hoja de contacto completa revisada.
- [ ] `silencios.py` → ninguno; `medir.py` → volumen y pico dentro de objetivo.
- [ ] Textos contra la fuente real, sin cifras inventadas y con los datos ficticios marcados.
- [ ] Dominio y redes solo si existen.
- [ ] README del vídeo actualizado: qué hay, decisiones, licencias y cómo renderizar.
- [ ] Sin commit hasta que el usuario lo pida.

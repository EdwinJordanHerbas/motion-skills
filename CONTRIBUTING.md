# Cómo aportar

Estas skills mejoran con casos reales. Si al hacer un vídeo algo falló y se arregló, esa lección le sirve a la siguiente persona. Compartirla es **opcional**: ninguna skill envía nada sin tu sí, y no hay telemetría.

## Qué se acepta

- **Lecciones**: texto e imágenes pequeñas dentro de `lecciones/<skill>/<AAAA-MM-DD>-<tema>/`, en la carpeta de la skill a la que se refieren, con la plantilla [`lecciones/PLANTILLA.md`](lecciones/PLANTILLA.md).
- **Nada más por PR.** El código, `SKILL.md`, `references/`, los scripts y los sonidos los cambia solo el mantenedor. Si quieres proponer un cambio ahí, abre un issue y descríbelo.

Una comprobación automática marca en rojo los PR de forks que tocan algo fuera de `lecciones/` o traen imágenes de más de 200 KB.

## Cómo enviar una lección

- **Con tu IA**: al terminar un vídeo, la skill escribe la lección en tu proyecto y te pregunta si quieres compartirla. Solo si dices que sí, abre un issue o un PR con `gh` (la CLI de GitHub). Si no tienes `gh`, te da el enlace del formulario.
- **A mano**: rellena el [formulario de lección](https://github.com/EdwinJordanHerbas/motion-skills/issues/new?template=leccion.yml), o abre un PR que añada tu carpeta a `lecciones/<skill>/`.

Una lección por issue o por PR.

## Reglas

- **Sin datos ni material de clientes**: ni marcas, ni nombres de personas, ni textos, precios, pantallas o logotipos reales, ni rutas locales, correos, claves o identificadores de voces. Describe el producto de forma genérica.
- **Imágenes pequeñas y opcionales**: `antes.jpg` y `despues.jpg`, de 480 px de alto como mucho y menos de 200 KB. Si enseñan algo de un cliente, reprodúcelo con datos genéricos o no las pongas.
- **Todo es público** y queda en el historial de git aunque se borre después. Si compartes algo por error, avisa en el issue o escribe al mantenedor, pero cuenta con que puede haberse copiado.

## Qué hace el mantenedor

1. Lee cada lección a mano. **Nada se fusiona solo**: todo pasa por su revisión.
2. Agrupa las lecciones que apuntan a lo mismo.
3. Cuando una regla se repite, la escribe en la skill con sus palabras y saca una versión nueva (`metadata.version` en su `SKILL.md` y `version` de su plugin en `.claude-plugin/marketplace.json`), citando los issues o PR que la motivaron.
4. Mantiene `lecciones/PLANTILLA.md` y el `assets/leccion.md` de cada skill idénticos.

## Términos de las aportaciones

- **Licencia.** Lo que aportas entra bajo la licencia del repositorio, [Apache-2.0](LICENSE), como dice su sección 5. No hay que firmar ningún acuerdo aparte.
- **Firma de origen (DCO).** Cada commit de un PR lleva la línea `Signed-off-by: Tu Nombre <tu@correo>`, que añade `git commit -s`. Con ella certificas el [Developer Certificate of Origin 1.1](https://developercertificate.org/): que lo escribiste tú o tienes derecho a aportarlo con esta licencia. Puedes usar el correo `noreply` que te da GitHub. Una comprobación automática revisa que esté.
- **Por el formulario**, una casilla obligatoria certifica lo mismo.
- **Qué se hace con tu lección.** El mantenedor puede resumirla con sus palabras en la skill y la cita con el enlace a tu issue o PR.
- **Retirar una lección.** Pídelo en su issue o PR y se borra el archivo, aunque sigue en el historial de git.

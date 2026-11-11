# Cerrar con una lección

Una lección es un caso real que mejora la skill: qué se pidió, qué falló, cómo se arregló y qué regla propone. Se escribe siempre en local. Compartirla es opcional y solo ocurre con un sí explícito del usuario.

## Cuándo

- Al terminar un vídeo, o cuando el usuario dé por cerrada una ronda de cambios.
- Solo si algo falló y se arregló, o si apareció una regla que la skill no tenía. Si todo salió como dice la skill, no hay lección.
- Una o dos por vídeo como mucho: las que más tiempo costaron.

## Escribirla en local

1. Copia `assets/leccion.md` a la carpeta del proyecto del usuario, en `lecciones/<AAAA-MM-DD>-<tema>/leccion.md`. Nunca dentro de la carpeta de la skill: puede ser de solo lectura y se reemplaza al actualizar.
2. Rellena cada campo:
   - La versión de la skill sale de `metadata.version` en `SKILL.md`.
   - El agente y el modelo son los tuyos. Si no los sabes con certeza, pregúntalos.
3. **Anonimiza.** Describe el producto de forma genérica y quita marcas, nombres, textos, precios, pantallas, rutas, correos, claves e identificadores de voces.
4. Fotogramas, opcionales: solo si el fallo se ve sin material del cliente. Sácalos pequeños, por ejemplo con
   `ffmpeg -ss <segundo> -i video.mp4 -frames:v 1 -vf scale=-2:480 -q:v 5 antes.jpg`
   o con `npx remotion still ... --scale=0.25`. Si enseñan la interfaz real del cliente, no los incluyas.
5. Dile al usuario dónde la has guardado.

## Preguntar si se quiere compartir

Enseña el texto completo y la lista de imágenes, y pregunta una sola vez, en una frase clara. Por ejemplo:

> He guardado la lección en `lecciones/2026-11-08-portatil-cortado/`. ¿Quieres compartirla en el repositorio público de la skill para mejorarla? Se publicaría tal como la ves, con tu cuenta de GitHub.

- **Solo un sí explícito** a esa pregunta cuenta. El silencio, un «luego» o un sí a otra cosa son un no.
- Si dice que no, no insistas en este vídeo.
- Nada de envíos automáticos, telemetría ni copias en otro sitio.

## Compartir, solo con un sí

El repositorio público es `EdwinJordanHerbas/motion-skills`, con una carpeta de lecciones por skill: las de esta van en `lecciones/video-demo-saas/`.

**Con `gh` instalado y con sesión iniciada** (`gh auth status` lo dice):

- Sin imágenes, como issue:
  ```
  gh issue create --repo EdwinJordanHerbas/motion-skills --title "Lección (video-demo-saas): <tema>" --body-file lecciones/<AAAA-MM-DD>-<tema>/leccion.md
  ```
- Con imágenes, como PR desde un fork, en una carpeta temporal fuera del proyecto del usuario:
  ```
  gh repo fork EdwinJordanHerbas/motion-skills --clone=false
  gh repo clone <usuario>/motion-skills <temporal>/motion-skills -- --depth 1
  cd <temporal>/motion-skills
  git switch -c leccion/<AAAA-MM-DD>-<tema>
  # copia la carpeta de la lección a lecciones/video-demo-saas/<AAAA-MM-DD>-<tema>/ (solo leccion.md, antes.jpg y despues.jpg)
  git add lecciones/video-demo-saas/<AAAA-MM-DD>-<tema>
  git commit -s -m "Lección (video-demo-saas): <tema>"
  git push -u origin leccion/<AAAA-MM-DD>-<tema>
  gh pr create --repo EdwinJordanHerbas/motion-skills --title "Lección (video-demo-saas): <tema>" --body-file lecciones/<AAAA-MM-DD>-<tema>/leccion.md
  ```
  Si el usuario prefiere no hacer un fork, abre el issue sin imágenes y dile que puede arrastrarlas al issue desde el navegador.

**Sin `gh`**, dale el enlace del formulario y dile que pegue el texto y arrastre las imágenes:

`https://github.com/EdwinJordanHerbas/motion-skills/issues/new?template=leccion.yml` (elige `video-demo-saas` en «Skill»)

No metas el contenido de la lección en el enlace.

Al terminar, enseña el enlace del issue o del PR. No lo envíes dos veces.

## Qué pasa después

El mantenedor revisa cada lección a mano. Cuando varias apuntan a lo mismo, las resume en una regla y saca una versión nueva de la skill. Nada se fusiona solo, y el código de la skill solo lo cambia el mantenedor.

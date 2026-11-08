# video-demo-saas

Una **plantilla de vídeo demo vertical** para tu producto (1080×1920, 33 s), al estilo de las plantillas de After Effects, y una skill para que tu IA la adapte: dispositivos 3D modelados en código con tu interfaz real y nítida, rótulos que se leen sin sonido, transiciones conectadas, neumorfismo y un sonido sin silencios muertos. Usa [Remotion](https://www.remotion.dev) y three.js. Las instrucciones están en español.

Sigue el formato abierto [Agent Skills](https://agentskills.io/specification), así que funciona con Claude Code y con otros agentes compatibles.

> **Estado: borrador.**

## La plantilla «Tu marca»

Un solo plano continuo, sin voz: un cliente escribe en un chat, la respuesta se abre en tu marca, un portátil enseña tu panel, un editor corta tres piezas que saltan a tres móviles, uno se inclina y su feed se acelera, gira y suelta un halo de monedas, y siguen una revisión, un informe y un formulario que se rellena solo. Cierra con tu marca.

Todo lo que cambia de un vídeo a otro está en un archivo, `ajustes.ts`: nombre, lema, color de acento, tipografía, los textos de cada escena, el símbolo de las monedas, las capturas de tu producto para las pantallas, la música y los efectos. La animación y la duración no se tocan. Está en [`skills/video-demo-saas/assets/codigo/`](skills/video-demo-saas/assets/codigo/LEEME.md), con los pasos para registrarla en tu proyecto de Remotion.

Puedes rellenarla tú o pedírselo a tu IA con la skill instalada: «hazme un vídeo demo de mi producto con la plantilla». La skill le enseña el método (guion, atención, 3D, sonido y revisión medida) para adaptarla o para construir otra historia.

## Instalación

### Claude Code, como plugin

En una sesión de Claude Code:

```
/plugin marketplace add EdwinJordanHerbas/video-demo-saas
/plugin install video-demo-saas@edwinjordanherbas
```

O desde la terminal:

```bash
claude plugin marketplace add EdwinJordanHerbas/video-demo-saas
claude plugin install video-demo-saas@edwinjordanherbas
```

Para recibir versiones nuevas: `claude plugin marketplace update edwinjordanherbas` y `claude plugin update video-demo-saas@edwinjordanherbas`.

### Cualquier agente compatible, con `npx skills`

```bash
npx skills add EdwinJordanHerbas/video-demo-saas
```

La CLI [`skills`](https://github.com/vercel-labs/skills) detecta tus agentes y te deja elegir dónde instalarla. Para actualizar: `npx skills update video-demo-saas`.

Según el [escaparate oficial de Agent Skills](https://agentskills.io/clients), el formato lo admiten, entre otros, Claude Code, ChatGPT y Codex, Cursor, Gemini CLI, GitHub Copilot, VS Code y OpenCode. **Esta skill solo se ha probado con Claude Code.** Si la usas con otro agente, cuéntanos cómo te fue con una lección.

### A mano

Copia la carpeta `skills/video-demo-saas/` a la carpeta de skills de tu agente (en Claude Code, `~/.claude/skills/`).

## Requisitos

- **Node.js**, en la versión mínima que pida Remotion ([requisitos de sistema](https://www.remotion.dev/docs/#system-requirements)). Remotion pide macOS 15 o posterior y, en Linux, glibc 2.35 o posterior.
- **Un proyecto Remotion 4** con `three` (0.18x) y `@remotion/fonts`. La plantilla se ha probado con Remotion 4.0.541 y three 0.181. La skill no instala nada en tu proyecto: te guía para hacerlo.
- **[uv](https://docs.astral.sh/uv/)** para los scripts de Python (Python 3.10 o posterior). Cada script declara sus dependencias y `uv run` las instala solas.
- **[ffmpeg](https://ffmpeg.org/download.html)** para sacar fotogramas y revisar audio.

## Sonido: opcional

La plantilla no tiene voz y funciona en silencio, sin música ni efectos, hasta que se los das en `ajustes.ts`. La skill puede generar voz, efectos y música con [ElevenLabs](https://elevenlabs.io), pero no es obligatorio.

- **El plan gratuito de ElevenLabs no permite uso comercial.** Para un vídeo de empresa necesitas un plan de pago ([precios](https://elevenlabs.io/pricing), [términos](https://elevenlabs.io/terms-of-use)). La música tiene sus propios [términos](https://elevenlabs.io/music-terms), con límites por tipo de cuenta y de uso.
- La clave va solo en la variable de entorno `ELEVENLABS_API_KEY`, nunca en archivos. Las peticiones se guardan en una caché local para no pagar dos veces.
- Sin ElevenLabs, usa tus propios sonidos y una música con licencia. Las reglas de mezcla y de silencios valen igual.
- **Los efectos no vienen como audio**, porque los términos de ElevenLabs no permiten repartir lo generado. Viene su receta (`assets/sonidos/receta.json`) y un script que genera los 27 con tu clave: `uv run scripts/paquete_efectos.py assets/sonidos/receta.json public/<proyecto>/sfx`.

## Licencia de Remotion

Remotion no es software libre para todo el mundo. Según su [FAQ de licencias](https://www.remotion.dev/docs/license/faq), es gratis para particulares (también con uso comercial), para organizaciones de hasta 3 personas, para organizaciones sin ánimo de lucro y para evaluarlo. **Una empresa de 4 personas o más necesita una licencia de empresa** ([remotion.pro/license](https://remotion.pro/license)), aunque solo una persona use Remotion. Esta skill no incluye Remotion: lo instalas tú en tu proyecto y aceptas su licencia.

## Windows, macOS y Linux

La skill se ha hecho y probado **solo en Windows**. No hay partes que funcionen solo en Windows, pero hay detalles propios de Windows:

- **Rutas cortas.** Por encima de 260 caracteres, Remotion falla en Windows si no están activadas las rutas largas. Trabaja en carpetas cercanas a la raíz.
- **La clave de ElevenLabs** se guarda con `setx ELEVENLABS_API_KEY "tu-clave"` y hay que abrir otra terminal. En macOS y Linux se usa `export`. En Windows, `scripts/elevenlabs.py` también la lee del registro de usuario si la terminal se abrió antes del `setx`.

En macOS y Linux debería funcionar igual, pero está sin probar.

## Privacidad

- **Sin telemetría.** La skill no envía nada a nadie por su cuenta.
- Solo llama a ElevenLabs cuando le pides generar sonido, con tu clave.
- Al terminar un vídeo, puede escribir en tu proyecto una lección sobre lo que falló y cómo se arregló. **Solo la comparte si dices que sí**, después de enseñarte lo que se enviaría. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Qué hay aquí

```
skills/video-demo-saas/   la skill: SKILL.md, references/, scripts/ y assets/ (la plantilla está en assets/codigo/)
.claude-plugin/           el plugin y el marketplace de Claude Code
lecciones/                lecciones aportadas por quienes usan la skill, y su plantilla
pruebas/                  encargos fijos para comparar versiones de la skill
```

## Aportar

Se aceptan **lecciones**: casos reales en texto e imágenes pequeñas, sin datos de clientes. El código lo cambia solo el mantenedor y nada se fusiona solo. Todo está en [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[Apache-2.0](LICENSE). Puedes usar, cambiar y redistribuir la skill y la plantilla, también en proyectos comerciales, siempre que conserves el aviso de licencia y el [`NOTICE`](NOTICE) y marques lo que cambies. Los vídeos que hagas con ella son tuyos.

Las lecciones aportadas entran con la misma licencia ([CONTRIBUTING.md](CONTRIBUTING.md)). Remotion, three.js y ElevenLabs no vienen incluidos y tienen sus propias licencias y términos.

# motion-skills

Skills de motion graphics para tu IA, en español: vídeos verticales de producto hechos con código, con [Remotion](https://www.remotion.dev) y three.js, y revisados con medidas en lugar de a ojo. Cada skill trae su método, sus scripts de medida y, cuando hace falta, una plantilla lista para rellenar.

Siguen el formato abierto [Agent Skills](https://agentskills.io/specification), así que funcionan con Claude Code y con otros agentes compatibles.

> El repositorio se llamaba `video-demo-saas`. La dirección vieja redirige aquí.

## Skills

| Skill | Para qué |
|---|---|
| [`video-demo-saas`](skills/video-demo-saas/README.md) | Vídeo demo vertical de un SaaS (1080×1920, unos 33 s). Trae la plantilla «Tu marca»: dispositivos 3D con tu interfaz real, rótulos que se leen sin sonido y un sonido sin silencios muertos. |

Cada skill es un plugin aparte: instala solo las que vayas a usar.

## Instalación

### Claude Code, como plugin

En una sesión de Claude Code:

```
/plugin marketplace add EdwinJordanHerbas/motion-skills
/plugin install video-demo-saas@edwinjordanherbas
```

O desde la terminal:

```bash
claude plugin marketplace add EdwinJordanHerbas/motion-skills
claude plugin install video-demo-saas@edwinjordanherbas
```

Para recibir versiones nuevas: `claude plugin marketplace update edwinjordanherbas` y `claude plugin update <skill>@edwinjordanherbas`.

### Cualquier agente compatible, con `npx skills`

```bash
npx skills add EdwinJordanHerbas/motion-skills --skill video-demo-saas
```

Sin `--skill`, la CLI [`skills`](https://github.com/vercel-labs/skills) te enseña todas para que elijas. También detecta tus agentes y te deja elegir dónde instalarla. Para actualizar: `npx skills update <skill>`.

Según el [escaparate oficial de Agent Skills](https://agentskills.io/clients), el formato lo admiten, entre otros, Claude Code, ChatGPT y Codex, Cursor, Gemini CLI, GitHub Copilot, VS Code y OpenCode. **Estas skills solo se han probado con Claude Code.** Si usas una con otro agente, cuéntanos cómo te fue con una lección.

### A mano

Copia la carpeta `skills/<skill>/` a la carpeta de skills de tu agente (en Claude Code, `~/.claude/skills/`).

## Requisitos

Los comunes. Cada skill dice en su README lo que necesita además.

- **Node.js**, en la versión mínima que pida Remotion ([requisitos de sistema](https://www.remotion.dev/docs/#system-requirements)). Remotion pide macOS 15 o posterior y, en Linux, glibc 2.35 o posterior.
- **Un proyecto Remotion 4.** Las skills no instalan nada en tu proyecto: te guían para hacerlo.
- **[uv](https://docs.astral.sh/uv/)** para los scripts de Python (Python 3.10 o posterior). Cada script declara sus dependencias y `uv run` las instala solas.
- **[ffmpeg](https://ffmpeg.org/download.html)** para sacar fotogramas y revisar audio.
- **Sonido opcional con [ElevenLabs](https://elevenlabs.io)**, con tu propia clave en la variable de entorno `ELEVENLABS_API_KEY`, nunca en archivos. El plan gratuito no permite uso comercial ([precios](https://elevenlabs.io/pricing), [términos](https://elevenlabs.io/terms-of-use)).

## Licencia de Remotion

Remotion no es software libre para todo el mundo. Según su [FAQ de licencias](https://www.remotion.dev/docs/license/faq), es gratis para particulares (también con uso comercial), para organizaciones de hasta 3 personas, para organizaciones sin ánimo de lucro y para evaluarlo. **Una empresa de 4 personas o más necesita una licencia de empresa** ([remotion.pro/license](https://remotion.pro/license)), aunque solo una persona use Remotion. Estas skills no incluyen Remotion: lo instalas tú en tu proyecto y aceptas su licencia.

## Windows, macOS y Linux

Las skills se han hecho y probado **solo en Windows**. No hay partes que funcionen solo en Windows, pero hay detalles propios de Windows:

- **Rutas cortas.** Por encima de 260 caracteres, Remotion falla en Windows si no están activadas las rutas largas. Trabaja en carpetas cercanas a la raíz.
- **La clave de ElevenLabs** se guarda con `setx ELEVENLABS_API_KEY "tu-clave"` y hay que abrir otra terminal. En macOS y Linux se usa `export`. En Windows, el script `elevenlabs.py` de cada skill también la lee del registro de usuario si la terminal se abrió antes del `setx`.

En macOS y Linux debería funcionar igual, pero está sin probar.

## Privacidad

- **Sin telemetría.** Ninguna skill envía nada a nadie por su cuenta.
- Solo llaman a ElevenLabs cuando les pides generar sonido, con tu clave.
- Al terminar un vídeo, pueden escribir en tu proyecto una lección sobre lo que falló y cómo se arregló. **Solo la comparten si dices que sí**, después de enseñarte lo que se enviaría. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Qué hay aquí

```
skills/<skill>/        cada skill: SKILL.md, README.md, references/, scripts/ y assets/
.claude-plugin/        el marketplace de Claude Code: un plugin por skill
lecciones/<skill>/     lecciones aportadas por quienes usan cada skill; la plantilla, en lecciones/PLANTILLA.md
pruebas/<skill>/       encargos fijos para comparar versiones de cada skill
```

## Aportar

Se aceptan **lecciones**: casos reales en texto e imágenes pequeñas, sin datos de clientes. El código lo cambia solo el mantenedor y nada se fusiona solo. Todo está en [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[Apache-2.0](LICENSE). Puedes usar, cambiar y redistribuir las skills y sus plantillas, también en proyectos comerciales, siempre que conserves el aviso de licencia y el [`NOTICE`](NOTICE) y marques lo que cambies. Los vídeos que hagas con ellas son tuyos.

Las lecciones aportadas entran con la misma licencia ([CONTRIBUTING.md](CONTRIBUTING.md)). Remotion, three.js y ElevenLabs no vienen incluidos y tienen sus propias licencias y términos.

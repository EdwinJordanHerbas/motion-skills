/*
 * Ajustes de la plantilla «Tu marca». Para un vídeo nuevo basta con este archivo: marca, color,
 * tipografía, textos de cada escena, capturas para las pantallas y sonido.
 *
 * - Las rutas son relativas a la carpeta `public/` de tu proyecto Remotion (se leen con `staticFile`).
 * - La duración es fija: 988 fotogramas a 30 fps (unos 33 s). Un texto más largo o más corto no la
 *   cambia; el tecleo del chat y del correo se ajusta solo a su hueco.
 * - Los máximos de caracteres son orientativos. Por encima, el texto puede partirse o salirse:
 *   compruébalo siempre con fotogramas sueltos (`npx remotion still`) y con la zona segura (prop `zonas`).
 * - No hay voz: la historia se cuenta con rótulos, música y efectos.
 */

export type Insignia = {titulo: string; sub: string; icono: 'sigla' | 'tick' | 'avatar'; sigla?: string};

export type Ajustes = {
  marca: {
    /** Nombre en el icono del chat, en las barras de las apps y en las dos marcas grandes. Hasta unos 10 caracteres a tamaño completo; más largo, se encoge. */
    nombre: string;
    /** Línea bajo la marca del principio. Hasta unos 28 caracteres. */
    lema: string;
    /** Línea bajo la marca del final. Hasta unos 40 caracteres. */
    lemaFinal: string;
    /** Icono cuadrado (PNG o SVG con fondo). Sin él, una tesela oscura con una barra del color de acento. */
    icono: string | null;
  };
  /** Color de acento: la barra que corta, el icono, la línea de tiempo del editor. Hexadecimal de 6 cifras. */
  acento: string;
  tipografia: {
    /** Si `archivo` es null, se usa la familia si está instalada y, si no, la del sistema. */
    texto: {familia: string; archivo: string | null};
    mono: {familia: string; archivo: string | null};
  };
  /** Cuentas que aparecen en los móviles, el feed, los resultados y la revisión. Ocho, en este orden. */
  cuentas: string[];
  chat: {
    estado: string;
    /** Lo que escribe el cliente. Hasta unos 45 caracteres (dos líneas en la burbuja). */
    mensaje: string;
    /** La respuesta que se abre en la marca. Hasta unos 26 caracteres, en una línea. */
    respuesta: string;
    adjunto: {nombre: string; detalle: string; duracion: string};
    placeholder: string;
  };
  /** Primera pantalla del portátil. */
  panel: {seccion: string; etiqueta: string; titulo: string; recibido: string; filas: [string, string][]; sello: string};
  /** Segunda pantalla del portátil: una línea de tiempo que se corta en tres piezas. */
  editor: {titulo: string; lista: string; pieza: string};
  moviles: {
    /** Nombre de la app de vídeo genérica, arriba a la izquierda. No uses logotipos de redes reales. */
    app: string;
    aviso: string;
    seguir: string;
    sonido: string;
    /** Etiqueta pequeña sobre el texto de cada vídeo (por ejemplo «Publicidad»). null la quita. */
    etiqueta: string | null;
    textos: [string, string, string];
    /** Subtítulos quemados de cada móvil, palabra a palabra, en mayúsculas. */
    subtitulos: [string[], string[], string[]];
  };
  /** Frases de los mosaicos del feed: palabras cortas, el mosaico mide 140 px de ancho. */
  feed: {titulo: string; pestanas: string; frases: string[]};
  /** Tres insignias que salen alrededor del móvil inclinado. */
  insignias: [Insignia, Insignia, Insignia];
  /** La pantalla del móvil después del giro, con las monedas. */
  resultado: {seccion: string; titulo: string; detalle: string; estado: string; boton: string};
  revision: {
    titulo: string;
    plazo: string;
    enCurso: string;
    aprobado: string;
    rechazado: string;
    motivo: {etiqueta: string; texto: string};
    apelacion: string;
  };
  informe: {
    titulo: string;
    subtitulo: string;
    sello: string;
    /** Cinco columnas fijas y la destacada, que va en su propio hueco. */
    columnas: [string, string, string, string, string];
    destacada: string;
    filas: {pieza: string; canal: string; a: string; b: string; c: string; valor: string; ok: boolean}[];
    nota: string;
  };
  formulario: {
    boton: string;
    antetitulo: string;
    titulo: string;
    pregunta: string;
    /** La primera opción es la que se marca en el vídeo. */
    opciones: string[];
    campo: string;
    ejemplo: string;
    /** Lo que se teclea en el campo. Hasta unos 24 caracteres. */
    escrito: string;
    enviar: string;
  };
  aviso: {titulo: string; texto: string};
  /**
   * Rótulos, en orden de aparición. Cada uno va junto a su objeto y dentro de la zona segura.
   * Una idea por rótulo, de 2 a 6 palabras; `sub` es una línea gris opcional.
   */
  rotulos: {
    /** Portátil abriéndose. */
    recibe: {t: string; sub?: string};
    /** Portátil, lista de pasos. */
    pasos: {t: string};
    /** Portátil, editor cortando. */
    trabajo: {t: string};
    /** Bajo los tres móviles. Hasta unos 30 caracteres. */
    llega: {t: string};
    /** Arriba a la izquierda, mientras el feed se acelera. */
    ritmo: {t: string};
    /** Encima del móvil con las monedas. */
    resultado: {t: string};
    /** Bajo la tarjeta de revisión; `sub` sale con el rechazo. */
    revision: {t: string; sub?: string};
    /** Encima del informe. */
    informe: {t: string};
    /** Encima del botón final. Corto: va en grande. */
    pregunta: {t: string};
  };
  /** El símbolo de las monedas 3D (€, $, £…). Uno o dos caracteres. */
  moneda: string;
  /**
   * Huecos de las pantallas. Cada uno muestra una interfaz de muestra hasta que le das una captura
   * (PNG o JPG) de tu producto; usa el tamaño indicado o uno proporcional, el doble para más nitidez.
   */
  capturas: {
    /** Portátil, primera pantalla: 916 × 576. */
    panel: string | null;
    /** Portátil, segunda pantalla: 916 × 576. Las tres piezas siguen saliendo de su línea de tiempo. */
    editor: string | null;
    /** Los tres móviles: 304 × 674 cada uno. */
    moviles: [string | null, string | null, string | null];
    /** El móvil inclinado: 304 de ancho y tan alta como quieras; se desplaza cada vez más rápido. */
    feed: string | null;
    /** El móvil después del giro: 304 × 674. */
    resultado: string | null;
  };
  sonido: {
    /** Música de toda la pieza, ya nivelada (`scripts/nivelar_musica.py`). null: sin música. */
    musica: string | null;
    /** Carpeta con los efectos por nombre (`pop.wav`, `slice.wav`…, los que genera `scripts/paquete_efectos.py`). null: sin efectos. */
    efectos: string | null;
  };
};

export const AJUSTES: Ajustes = {
  marca: {
    nombre: 'Tu marca',
    lema: 'Tu lema, en una línea.',
    lemaFinal: 'Lo que haces, en pocas palabras.',
    icono: null,
  },
  acento: '#3b5bff',
  tipografia: {
    texto: {familia: 'Inter', archivo: null},
    mono: {familia: 'IBM Plex Mono', archivo: null},
  },
  cuentas: ['@cuenta.uno', '@cuenta.dos', '@cuenta.tres', '@cuenta.cuatro', '@cuenta.cinco', '@cuenta.seis', '@cuenta.siete', '@cuenta.ocho'],
  chat: {
    estado: 'En línea',
    mensaje: 'Os paso el archivo. ¿Me ayudáis con esto?',
    respuesta: 'Claro. Mira cómo funciona.',
    adjunto: {nombre: 'tu-archivo.mp4', detalle: 'Vídeo · 4 h 12 min', duracion: '4:12:07'},
    placeholder: 'Escribe un mensaje',
  },
  panel: {
    seccion: 'Panel',
    etiqueta: 'Demo',
    titulo: 'Tu proyecto',
    recibido: 'recibido',
    filas: [
      ['Paso 1', 'Lo primero que hace tu producto'],
      ['Paso 2', 'Lo segundo, en pocas palabras'],
      ['Regla', 'Una garantía que importe al cliente'],
      ['Límite', 'Una condición clara'],
      ['Entrega', 'Lo que recibe tu cliente al final'],
    ],
    sello: 'Aprobado · hoy',
  },
  editor: {titulo: 'Editor', lista: 'Piezas', pieza: 'Pieza'},
  moviles: {
    app: 'Tu app',
    aviso: 'Pieza publicada',
    seguir: 'Seguir',
    sonido: '♪ Sonido original',
    etiqueta: null,
    textos: ['Tu texto aquí', 'Así se ve en el móvil', 'Una frase corta'],
    subtitulos: [
      ['ASÍ', 'SE', 'VE', 'AQUÍ'],
      ['TU', 'TEXTO', 'EN', 'GRANDE'],
      ['UNA', 'FRASE', 'MUY', 'CORTA'],
    ],
  },
  feed: {
    titulo: 'Inicio',
    pestanas: 'Siguiendo · Para ti',
    frases: [
      'Tu texto aquí',
      'Así de fácil',
      'Mira esto',
      'Antes y después',
      'En un minuto',
      'Paso a paso',
      'Sin esperas',
      'Lo mejor de hoy',
      'Atentos al final',
      'Nadie se lo esperaba',
      'Qué momento',
      'Pruébalo',
    ],
  },
  insignias: [
    {titulo: 'Tu primera ventaja', sub: 'Una línea que la explica', icono: 'sigla', sigla: '01'},
    {titulo: 'Tu segunda ventaja', sub: 'En todas las piezas', icono: 'tick'},
    {titulo: '@cuenta.cuatro', sub: 'Pieza publicada', icono: 'avatar'},
  ],
  resultado: {seccion: 'Resultados', titulo: 'Todo listo', detalle: 'Completado', estado: 'Hecho', boton: 'Resultados enviados'},
  revision: {
    titulo: 'Revisión',
    plazo: 'Plazo: 48 h',
    enCurso: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    motivo: {etiqueta: 'Motivo:', texto: 'no cumple una de las reglas'},
    apelacion: 'Puedes pedir una segunda revisión',
  },
  informe: {
    titulo: 'Informe',
    subtitulo: 'Una línea con el periodo o el método',
    sello: 'Ejemplo',
    columnas: ['Pieza', 'Canal', 'Inicio', 'Revisión', 'Cierre'],
    destacada: 'Resultado',
    filas: [
      {pieza: 'Pieza 01', canal: 'Web', a: '12 nov', b: '22 nov', c: '25 nov', valor: 'Pendiente', ok: true},
      {pieza: 'Pieza 03', canal: 'App', a: '13 nov', b: '23 nov', c: '26 nov', valor: 'Pendiente', ok: true},
      {pieza: 'Pieza 02', canal: 'Web', a: '—', b: '—', c: '—', valor: 'Excluida', ok: false},
    ],
    nota: 'Pieza 02: rechazada en revisión, no cuenta',
  },
  formulario: {
    boton: 'Pide tu demo',
    antetitulo: 'Formulario',
    titulo: 'Cuéntanos tu caso',
    pregunta: 'Tipo de negocio',
    opciones: ['Autónomo', 'Pequeña empresa', 'Empresa', 'Agencia', 'Otro'],
    campo: 'Correo de contacto',
    ejemplo: 'nombre@correo.com',
    escrito: 'tu@correo.com',
    enviar: 'Enviar solicitud',
  },
  aviso: {titulo: 'Solicitud recibida', texto: 'Te escribiremos al correo que nos has dado.'},
  rotulos: {
    recibe: {t: 'Nos mandas tu archivo.', sub: 'Tú no instalas nada.'},
    pasos: {t: 'Lo preparamos contigo.'},
    trabajo: {t: 'Y lo convertimos en piezas.'},
    llega: {t: 'Que llegan a cada móvil.'},
    ritmo: {t: 'Rápido y sin esfuerzo.'},
    resultado: {t: 'Tú ves el resultado.'},
    revision: {t: 'Revisamos cada pieza.', sub: 'Si algo no vale, te decimos por qué.'},
    informe: {t: 'Y un informe claro.'},
    pregunta: {t: '¿Lo probamos?'},
  },
  moneda: '€',
  capturas: {
    panel: null,
    editor: null,
    moviles: [null, null, null],
    feed: null,
    resultado: null,
  },
  sonido: {
    musica: null,
    efectos: null,
  },
};

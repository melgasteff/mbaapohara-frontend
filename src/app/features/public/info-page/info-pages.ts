import { AccordionItem } from '../../../shared/ui/accordion/accordion';

export type InfoPageId = 'moderacion' | 'privacidad' | 'terminos' | 'responsabilidad';

export interface InfoPageData {
  ruta: string;
  titulo: string;
  bajada: string;
  /** Archivo de public/marca/iconos; sin él, un candado. */
  ilustracion: string | null;
  /** «Lo importante en 30 segundos»: tres ideas. */
  claves: { titulo: string; texto: string }[];
  /** Secciones con su ancla, en el orden de la página. «Preguntas frecuentes» se agrega sola al final. */
  indice: { id: string; texto: string }[];
  preguntas: AccordionItem[];
}

export const INFO_PAGE_ORDER: InfoPageId[] = ['moderacion', 'privacidad', 'terminos', 'responsabilidad'];

/**
 * Textos comunes de las páginas informativas. Resumen la política de moderación (mbaapohara-backend/docs/politica-moderacion.md)
 * y lo que el sistema hace hoy: si eso cambia, estos textos también. BORRADOR hasta que lo valide el tutor.
 */
export const INFO_PAGES: Record<InfoPageId, InfoPageData> = {
  moderacion: {
    ruta: '/como-moderamos',
    titulo: 'Cómo moderamos',
    bajada: 'Qué pasa con una reseña desde que la enviás hasta que se publica, y qué revisamos en el camino.',
    ilustracion: '19-la-voz',
    claves: [
      { titulo: 'Todo se revisa antes de publicarse', texto: 'Ninguna reseña aparece sin pasar por la moderación.' },
      { titulo: 'Nadie ve quién escribió', texto: 'Tampoco la persona que modera.' },
      { titulo: 'No retiramos por ser negativa', texto: 'Solo si no cumple las reglas.' },
    ],
    indice: [
      { id: 'recorrido', texto: 'El recorrido de una reseña' },
      { id: 'revisamos', texto: 'Qué revisamos y qué no' },
      { id: 'reportes', texto: 'Si ves algo que no debería estar' },
    ],
    preguntas: [
      {
        pregunta: '¿Cuánto tarda en publicarse?',
        respuesta:
          'Si la revisión automática no encuentra nada dudoso, se publica enseguida. Si tiene que leerla una persona, el objetivo es resolverla en 48 horas. El estado está siempre en «Mis reseñas».',
      },
      {
        pregunta: '¿Puedo editar una reseña publicada?',
        respuesta:
          'Sí, desde «Mis reseñas». Los cambios pasan por la misma revisión que una reseña nueva y, mientras tanto, se sigue viendo la versión anterior.',
      },
      { pregunta: '¿La empresa puede borrar una reseña?', respuesta: 'No. Puede pedir que la revisemos, y la retiramos solo si no cumple las reglas.' },
    ],
  },
  privacidad: {
    ruta: '/privacidad',
    titulo: 'Privacidad',
    bajada: 'Qué datos pedimos, para qué los usamos y quién puede verlos.',
    ilustracion: null,
    claves: [
      { titulo: 'Tu nombre nunca se publica', texto: 'Ni siquiera lo pedimos.' },
      { titulo: 'Pedimos lo mínimo', texto: 'Un correo y una contraseña para tu cuenta.' },
      { titulo: 'Tus datos son tuyos', texto: 'Podés descargarlos o eliminar tu cuenta.' },
    ],
    indice: [
      { id: 'quien', texto: 'Quién ve qué' },
      { id: 'datos', texto: 'Qué datos pedimos y para qué' },
      { id: 'compartimos', texto: 'Con quién compartimos datos' },
      { id: 'tiempo', texto: 'Cuánto tiempo los guardamos' },
      { id: 'derechos-datos', texto: 'Lo que podés hacer con tus datos' },
      { id: 'proteccion', texto: 'Cómo los protegemos' },
      { id: 'responsable', texto: 'Quién es responsable' },
      { id: 'edad-cambios', texto: 'Edad y cambios' },
    ],
    preguntas: [
      {
        pregunta: '¿La empresa puede saber que fui yo?',
        respuesta:
          'Nunca le damos tu correo, y tu nombre no lo tenemos. Igual, si contás detalles muy particulares, alguien podría reconocerte: por eso te recomendamos contar hechos generales.',
      },
      {
        pregunta: '¿Por qué no muestran la fecha exacta?',
        respuesta: 'Porque la fecha exacta, junto con el local y el cargo, podría ayudar a identificarte. Por eso solo se ve el mes.',
      },
      { pregunta: '¿Usan mis datos para publicidad?', respuesta: 'No. No usamos cookies de seguimiento ni herramientas de publicidad, y no vendemos tus datos.' },
      {
        pregunta: '¿Dónde queda una reseña que no terminé?',
        respuesta:
          'Solo en el navegador de ese dispositivo, hasta que la envíes, elijas «Empezar de nuevo» o elimines tu cuenta desde ahí. Cerrar sesión no la borra: tenelo en cuenta si usás una computadora compartida.',
      },
    ],
  },
  terminos: {
    ruta: '/terminos',
    titulo: 'Términos de uso',
    bajada: 'Las reglas para escribir y leer reseñas en Mbaapohara, explicadas con ejemplos.',
    ilustracion: '18-trabajo-en-equipo',
    claves: [
      { titulo: 'Contá tu experiencia real', texto: 'En un lugar donde trabajás o trabajaste.' },
      { titulo: 'Hechos, no nombres', texto: 'Describí situaciones sin identificar personas.' },
      { titulo: 'Respeto siempre', texto: 'Sin insultos, amenazas ni discriminación.' },
    ],
    indice: [
      { id: 'reglas', texto: 'Las reglas, con ejemplos' },
      { id: 'probar', texto: '¿Se publicaría?' },
      { id: 'completo', texto: 'Términos completos' },
    ],
    preguntas: [
      { pregunta: '¿Puedo escribir sobre un trabajo de hace años?', respuesta: 'Sí. Indicás el último año en que trabajaste ahí y eso se muestra en la reseña.' },
      {
        pregunta: '¿Puedo escribir más de una reseña de la misma empresa?',
        respuesta: 'Sí, si trabajaste en más de un local: es una reseña por persona y local. La de cada local la podés editar cuando quieras.',
      },
      { pregunta: '¿Qué pasa si no cumplo las reglas?', respuesta: 'La reseña no se publica y te decimos qué corregir. Si se repite o es grave, podemos bloquear la cuenta.' },
    ],
  },
  responsabilidad: {
    ruta: '/responsabilidad',
    titulo: 'Responsabilidad por las reseñas',
    bajada: 'Quién responde por lo que se publica y qué puede hacer una empresa si cree que una reseña tiene un error.',
    ilustracion: '17-cargar-juntos',
    claves: [
      { titulo: 'Cada reseña es una experiencia personal', texto: 'No es la opinión de Mbaapohara.' },
      { titulo: 'Todas pasan por moderación', texto: 'Antes de publicarse y cuando se reportan.' },
      { titulo: 'Las empresas pueden pedir revisión', texto: 'Sin crear una cuenta.' },
    ],
    indice: [
      { id: 'quien-responde', texto: 'Quién responde por qué' },
      { id: 'pedido', texto: 'Cómo pedir una revisión' },
      { id: 'limites', texto: 'Lo que podemos hacer y lo que no' },
    ],
    preguntas: [
      {
        pregunta: '¿Mbaapohara verifica que la persona trabajó ahí?',
        respuesta: 'No verificamos el empleo. Quien escribe declara que su experiencia es real, y la moderación revisa que la reseña cumpla las reglas.',
      },
      // TODO(decision): plazo de respuesta a las empresas. Mientras no se defina, no se promete.
      {
        pregunta: '¿Cómo le responden a una empresa?',
        respuesta: 'Por el correo que deja en el formulario. Al responder borramos su nombre y su correo; quedan el mensaje y la respuesta.',
      },
      { pregunta: '¿Pueden darnos los datos de quien escribió?', respuesta: 'No. No compartimos datos de las personas que escriben.' },
    ],
  },
};

// Revisión humana (3.9a): modelos de GET /moderation/queue y textos de la política de moderación
// (mbaapohara-backend/docs/politica-moderacion.md, secciones 4, 5 y 7).
import { CatalogItem, ModerationCategory, SavedAnswer, WorkSituation } from './review';

/** Señales de la última moderación automática de una versión. */
export interface QueueSignals {
  category: ModerationCategory | null;
  rules: string[];
  /** Confianza de 0 a 1 por categoría; `null` si el modelo no respondió. */
  scores: Record<ModerationCategory, number> | null;
  failure: string | null;
  modelReason: string | null;
}

/** Versión que espera la revisión humana. Nunca trae el autor. */
export interface QueueItem {
  idVersion: number;
  idResena: number;
  numero: number;
  empresa: { id: number; nombre: string };
  local: { id: number; nombre: string; ciudad: string };
  cargo: { descripcion: string; aprobado: boolean };
  situacion: WorkSituation;
  ultimoAnio: number | null;
  tipoContrato: CatalogItem;
  modalidad: CatalogItem;
  calificacion: number;
  loBueno: string;
  aMejorar: string;
  respuestas: SavedAnswer[];
  fechaEnvio: string;
  /** Horas desde el envío; el objetivo es resolver en 48. */
  horasEsperando: number;
  /** La reseña tiene otra versión publicada, que se sigue viendo mientras tanto. */
  tieneVersionPublicada: boolean;
  senales: QueueSignals | null;
}

export const CATEGORIES: ModerationCategory[] = ['DP', 'TER', 'ACU', 'INS', 'SPAM', 'TEMA'];

/** Nombre de cada categoría (política, sección 4). */
export const CATEGORY_LABELS: Record<ModerationCategory, string> = {
  DP: 'Datos de contacto',
  TER: 'Persona identificable',
  ACU: 'Acusación de delito',
  INS: 'Insulto o discriminación',
  SPAM: 'Spam o publicidad',
  TEMA: 'Fuera de tema',
};

/** Motivo de rechazo que lee quien escribió (política, sección 7): se propone y se puede editar. */
export const REJECTION_MESSAGES: Record<ModerationCategory, string> = {
  DP: 'Tu reseña tiene datos de contacto (un teléfono, un correo, un documento o un enlace). Sacalos y volvé a enviarla.',
  TER: 'Tu reseña nombra o señala a una persona. Contá lo que pasó sin decir quién fue.',
  ACU: 'Tu reseña acusa de un delito a una persona. Podés contar el hecho sobre la empresa sin identificar a nadie.',
  INS: 'Tu reseña tiene insultos o expresiones discriminatorias. Contá lo que pasó con otras palabras.',
  SPAM: 'Tu reseña parece publicidad o un texto repetido. Contá tu experiencia de trabajo.',
  TEMA: 'Tu reseña no habla de tu experiencia de trabajo en la empresa. Contá cómo fue trabajar ahí.',
};

/** Reglas locales (política, sección 5, paso 1). */
export const RULE_LABELS: Record<string, string> = {
  datos_contacto: 'Datos de contacto',
  lista_insultos: 'Palabra de la lista de insultos',
  texto_repetido: 'Texto repetido o sin sentido',
};

/** Por qué no hubo clasificación del modelo. */
export const FAILURE_LABELS: Record<string, string> = {
  sin_clave: 'El modelo no está configurado (sin clave)',
  tope_de_gasto: 'Se alcanzó el tope de gasto del mes',
  error: 'El modelo no respondió',
  rechazo_del_modelo: 'El modelo no quiso clasificar el texto',
  respuesta_invalida: 'El modelo respondió algo inválido',
};

/** Categoría de un reporte: una de la política u «Otro» con comentario (3.9b). */
export type ReportCategory = ModerationCategory | 'OTRO';
export const REPORT_CATEGORIES: ReportCategory[] = [...CATEGORIES, 'OTRO'];
export const REPORT_LABELS: Record<ReportCategory, string> = {
  DP: 'Tiene datos de contacto',
  TER: 'Nombra o señala a una persona',
  ACU: 'Acusa de un delito a una persona',
  INS: 'Tiene insultos o discriminación',
  SPAM: 'Es publicidad o un texto repetido',
  TEMA: 'No habla de trabajar en la empresa',
  OTRO: 'Otro motivo',
};

/** Reseña con reportes pendientes (GET /moderation/reports). Sin el autor ni quién reportó. */
export interface ReportedReview {
  idResena: number;
  empresa: { id: number; nombre: string };
  local: { id: number; nombre: string; ciudad: string };
  publicada: boolean;
  calificacion: number | null;
  loBueno: string | null;
  aMejorar: string | null;
  cantidad: number;
  primerReporte: string;
  reportes: { categoria: ReportCategory; comentario: string | null; fecha: string }[];
}

export type CompanyRequestType = 'revision_resena' | 'correccion_datos';
export type CompanyRequestStatus = 'pendiente' | 'respondida';

/** Solicitud pública de una empresa (POST /company-requests). */
export interface NewCompanyRequest {
  tipo: CompanyRequestType;
  idResena?: number;
  idEmpresa?: number;
  nombre: string;
  correo: string;
  mensaje: string;
  aceptaPrivacidad: boolean;
}

/** Solicitud para la administración. Nombre y correo solo mientras está abierta. */
export interface CompanyRequest {
  id: number;
  tipo: CompanyRequestType;
  estado: CompanyRequestStatus;
  empresa: { id: number; nombre: string } | null;
  resena: { id: number; publicada: boolean; loBueno: string | null; aMejorar: string | null } | null;
  nombre: string | null;
  correo: string | null;
  mensaje: string;
  respuesta: string | null;
  fecha: string;
  fechaRespuesta: string | null;
}

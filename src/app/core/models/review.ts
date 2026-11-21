// Forma de la reseña (R2 a R7, sección 7 del PLAN). El contenido de los criterios es provisional y llega como
// datos desde public/criterios-provisionales.json: nunca se escribe en el código.

/** Opción de una lista fija del JSON (respuestas, situaciones). */
export interface ReviewOption {
  valor: string;
  etiqueta: string;
}

export interface CriteriaItem {
  codigo: string;
  orden: number;
  texto: string;
}

export interface CriteriaCategory {
  codigo: string;
  nombre: string;
  orden: number;
  items: CriteriaItem[];
}

export interface ReviewTextField {
  codigo: 'LO_BUENO' | 'A_MEJORAR';
  etiqueta: string;
  placeholder: string;
  minimo: number;
  maximo: number;
}

export interface OverallRatingConfig {
  minimo: number;
  maximo: number;
  etiqueta: string;
  pregunta: string;
  /** Palabra de cada valor: «1» → «Muy malo». */
  palabras: Record<string, string>;
}

/** Contenido de public/criterios-provisionales.json que usa el asistente. */
export interface CriteriaConfig {
  version: string;
  opcionesRespuesta: ReviewOption[];
  situaciones: ReviewOption[];
  calificacionGeneral: OverallRatingConfig;
  textos: ReviewTextField[];
  categorias: CriteriaCategory[];
}

/** Elemento de un catálogo simple de la API (tipos de contrato, modalidades). */
export interface CatalogItem {
  id: number;
  nombre: string;
}

/** Cargo (GET /jobs). */
export interface Job {
  id: number;
  descripcion: string;
}

export type WorkSituation = 'ACTUAL' | 'ANTERIOR';

/** Reseña lista para enviar. Lleva nombres además de ids para mostrar la vista previa. */
export interface ReviewDraft {
  empresa: { id: number; nombre: string };
  local: { id: number; nombre: string; ciudad: string | null };
  /** Cargo de la lista (id) o propuesto por la persona (id `null`). */
  cargo: { id: number | null; nombre: string };
  situacion: WorkSituation;
  /** Último año en la empresa; en la situación actual es el año en curso. */
  ultimoAnio: number;
  tipoContrato: CatalogItem;
  modalidad: CatalogItem;
  /** Respuesta de cada criterio, por código: «CP01» → «SI». */
  respuestas: Record<string, string>;
  calificacion: number;
  loBueno: string;
  aMejorar: string;
}

/** Estados de una reseña después de la moderación (política de moderación, sección 7). */
export type ReviewStatus = 'publicada' | 'en_revision' | 'rechazada';

/** Categorías de moderación (política de moderación, sección 4). */
export type ModerationCategory = 'DP' | 'TER' | 'ACU' | 'INS' | 'SPAM' | 'TEMA';

export interface PublishResult {
  /** Id de la reseña: con él se corrige una reseña rechazada (PUT /reviews/:id). */
  id: number;
  estado: ReviewStatus;
  /** Categoría que motivó el rechazo o la revisión. */
  categoria?: ModerationCategory;
  /** Motivo para quien escribió: qué corregir o por qué se revisa. */
  motivo?: string;
}

/** Respuesta de un criterio en una reseña guardada. */
export interface SavedAnswer {
  codigo: string;
  respuesta: string;
}

/** Última versión de una reseña propia (GET /reviews/mine). */
export interface MyReviewVersion {
  numero: number;
  estado: ReviewStatus;
  categoria: ModerationCategory | null;
  /** Mensaje de la moderación para quien escribió. */
  motivo: string | null;
  /** `aprobado` es `false` mientras un cargo propuesto espera la aprobación del administrador. */
  cargo: { id: number; descripcion: string; aprobado: boolean };
  situacion: WorkSituation;
  ultimoAnio: number | null;
  tipoContrato: CatalogItem;
  modalidad: CatalogItem;
  calificacion: number;
  loBueno: string;
  aMejorar: string;
  respuestas: SavedAnswer[];
  /** Fecha de envío (ISO). */
  fecha: string;
}

/** Reseña propia, para «Mis reseñas» y para editarla. */
export interface MyReview {
  id: number;
  empresa: { id: number; nombre: string };
  local: { id: number; nombre: string; ciudad: string };
  /** Hay una versión publicada visible (puede ser anterior a la última). */
  publicada: boolean;
  ultimaVersion: MyReviewVersion;
}

/** Reseña publicada, tal como la ve cualquier persona (GET /reviews). Nunca trae el autor. */
export interface PublicReview {
  id: number;
  empresa: { id: number; nombre: string };
  local: { id: number; nombre: string; ciudad: string };
  /** `null` si es un cargo propuesto que el administrador todavía no aprobó («Otro cargo»). */
  cargo: string | null;
  situacion: WorkSituation;
  ultimoAnio: number | null;
  tipoContrato: CatalogItem;
  modalidad: CatalogItem;
  calificacion: number;
  loBueno: string;
  aMejorar: string;
  /** Respuestas a los criterios activos, en su orden. */
  respuestas: SavedAnswer[];
  /** Mes de publicación, «2026-11»: nunca el día. */
  mesPublicacion: string;
}

/** Filtros del listado público de reseñas (RF5). */
export interface PublicReviewsQuery {
  empresa?: number;
  local?: number;
  cargo?: number;
  ciudad?: number;
  tipoContrato?: number;
  modalidad?: number;
  situacion?: WorkSituation;
  page?: number;
  pageSize?: number;
}

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

export type ReviewStatus = 'publicada' | 'en_revision';

export interface PublishResult {
  estado: ReviewStatus;
  /** Motivo de la revisión, para mostrárselo a quien escribió. */
  motivo?: string;
}

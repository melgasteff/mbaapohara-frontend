// Administración de criterios (tarea 3.8): GET /criteria/admin y sus cambios.

export interface AdminCriterion {
  id: number;
  codigo: string;
  texto: string;
  orden: number;
  activo: boolean;
  idCategoria: number;
  /** Respuestas guardadas: con respuestas, cambiar el sentido del texto las desvirtúa. */
  respuestas: number;
}

export interface AdminCriteriaCategory {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
  items: AdminCriterion[];
}

/** Cambio de una categoría o un ítem. El código no se cambia. */
export interface CriteriaChange {
  nombre?: string;
  texto?: string;
  orden?: number;
  activo?: boolean;
}

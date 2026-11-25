import { SectorGroup } from './sector-group';

/** Respuestas a un criterio o a una categoría (GET /insights). La API lo da solo desde 3 reseñas. */
export interface Indicator {
  /** Reseñas que respondieron Sí, En parte o No. */
  resenas: number;
  si: number;
  enParte: number;
  no: number;
  /** «No sé o no aplica»: no entra en el porcentaje. */
  noSabe: number;
  porcentajeSi: number;
}

export interface CriterionInsight {
  codigo: string;
  texto: string;
  indicador: Indicator | null;
}

export interface CategoryInsight {
  codigo: string;
  nombre: string;
  indicador: Indicator | null;
  criterios: CriterionInsight[];
}

export interface Insights {
  resenas: number;
  empresas: number;
  promedio: number | null;
  minimo: number;
  categorias: CategoryInsight[];
}

export interface InsightsFilters {
  grupo?: SectorGroup;
  departamento?: number;
  ciudad?: number;
}

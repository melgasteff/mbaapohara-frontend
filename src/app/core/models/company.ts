// Modelos que siguen los DTOs del backend (src/companies/dto y src/companies/offices/dto).

import { SectorGroup } from './sector-group';

/** Estado de una empresa o un local propuesto (D10). */
export type ProposalStatus = 'pendiente' | 'aprobada' | 'rechazada';

/** Rubro según la sección CIIU Rev. 4. */
export interface Sector {
  id: number;
  codigoCiiu: string | null;
  nombre: string | null;
  /** Grupo de rubro; define el color del sello. */
  grupo: SectorGroup;
}

export interface Company {
  id: number;
  nombre: string;
  rubro: Sector;
  estado: ProposalStatus;
}

/** Cumplimiento de una categoría de criterios, sin contar «No sé o no aplica». */
export interface Topic {
  codigo: string;
  nombre: string;
  /** Porcentaje de «Sí», entero. */
  porcentajeSi: number;
  /** Reseñas que respondieron algo de la categoría. */
  resenas: number;
}

/** Empresa con el resumen de sus reseñas publicadas (GET /companies). */
export interface CompanySummary extends Company {
  cantidadResenas: number;
  /** Promedio con un decimal; `null` sin reseñas. */
  promedio: number | null;
  /** Primera categoría de criterios, la misma para todas las empresas; `null` si no llega a 3 reseñas. */
  temaPrincipal: Topic | null;
  /** Logo con permiso de la empresa; por ahora siempre `null`. */
  logoUrl: string | null;
}

export interface OfficeCity {
  id: number;
  nombre: string | null;
  idDepartamento: number | null;
}

/** Local (sucursal) de una empresa. */
export interface Office {
  id: number;
  nombre: string;
  idEmpresa: number;
  ciudad: OfficeCity;
  direccionReferencia: string | null;
  estado: ProposalStatus;
  /** Empresa del local; solo en los listados de administración (GET /offices/admin). */
  empresa?: { id: number; nombre: string };
}

/** Local con la cantidad de reseñas publicadas. */
export interface OfficeSummary extends Office {
  cantidadResenas: number;
}

/** Empresa con sus locales aprobados y el resumen de sus reseñas (GET /companies/:id). */
export interface CompanyDetail extends CompanySummary {
  /** De 5 a 1 estrellas; vacía con menos de 3 reseñas. */
  distribucion: { estrellas: number; cantidad: number }[];
  /** Categorías con 3 reseñas o más; vacía con menos de 3 reseñas. */
  temas: Topic[];
  locales: OfficeSummary[];
}

/** Filtros del directorio, para el listado y sus conteos. */
export interface CompanyFilters {
  q?: string;
  rubro?: number;
  grupo?: SectorGroup;
  departamento?: number;
  ciudad?: number;
  /** `true`: solo con reseñas; `false`: solo sin reseñas; sin valor, todas. */
  conResenas?: boolean;
}

export type CompanyOrder = 'nombre' | 'resenas' | 'calificacion';

/** Consulta del directorio (GET /companies). */
export interface CompaniesQuery extends CompanyFilters {
  orden?: CompanyOrder;
  page?: number;
  pageSize?: number;
}

/** Conteos del directorio (GET /companies/facets). Cada uno aplica los demás filtros y no el propio. */
export interface CompanyFacets {
  /** Empresas con todos los filtros. */
  total: number;
  /** Reseñas de esas empresas; con departamento o ciudad, solo las de ese lugar. */
  experiencias: number;
  grupos: { total: number; opciones: { grupo: SectorGroup; cantidad: number }[] };
  departamentos: { total: number; opciones: { id: number; nombre: string; cantidad: number }[] };
  ciudades: { total: number; opciones: { id: number; nombre: string; idDepartamento: number; cantidad: number }[] };
  resenas: { total: number; con: number; sin: number };
}

/** Rubro completo del catálogo (GET /sectors). */
export interface SectorItem {
  id: number;
  codigoCiiu: string;
  nombre: string;
  descripcion: string;
}

/** Datos de un local para proponerlo o editarlo. */
export interface SaveOffice {
  nombre: string;
  idCiudad: number;
  direccionReferencia?: string;
}

/** Datos de una empresa para editarla. */
export interface SaveCompany {
  nombre: string;
  idRubro: number;
}

/** Empresa nueva con su primer local (POST /companies). */
export interface ProposeCompany extends SaveCompany {
  local: SaveOffice;
}

/** Filtros de GET /companies/admin. */
export interface AdminCompaniesQuery {
  q?: string;
  estado?: ProposalStatus;
  page?: number;
  pageSize?: number;
}

/** Filtros de GET /offices/admin. */
export interface AdminOfficesQuery {
  estado?: ProposalStatus;
  empresa?: number;
  page?: number;
  pageSize?: number;
}

// Modelos que siguen los DTOs del backend (src/companies/dto y src/companies/offices/dto).

/** Estado de una empresa o un local propuesto (D10). */
export type ProposalStatus = 'pendiente' | 'aprobada' | 'rechazada';

/** Rubro según la sección CIIU Rev. 4. */
export interface Sector {
  id: number;
  codigoCiiu: string | null;
  nombre: string | null;
}

export interface Company {
  id: number;
  nombre: string;
  rubro: Sector;
  estado: ProposalStatus;
  // Resumen de reseñas publicadas. Opcional hasta que la API lo devuelva (fase 2 del rediseño).
  cantidadResenas?: number;
  /** Promedio con un decimal; `null` sin reseñas. */
  promedio?: number | null;
  /** Tema con más «Sí», sin contar «No sé»; solo con 3 reseñas o más. */
  temaPrincipal?: { nombre: string; porcentajeSi: number } | null;
  /** Logo con permiso de la empresa. */
  logoUrl?: string | null;
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

/** Empresa con sus locales aprobados (GET /companies/:id). */
export interface CompanyDetail extends Company {
  locales: Office[];
}

/** Filtros del directorio (GET /companies). */
export interface CompaniesQuery {
  q?: string;
  ciudad?: number;
  rubro?: number;
  page?: number;
  pageSize?: number;
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

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

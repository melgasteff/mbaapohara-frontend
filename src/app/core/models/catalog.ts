/** Departamento del INE (Censo 2022). */
export interface Department {
  id: number;
  codigoIne: string;
  nombre: string;
}

/** Ciudad (distrito) del INE. */
export interface City {
  id: number;
  codigoIne: string;
  nombre: string;
  idDepartamento: number;
}

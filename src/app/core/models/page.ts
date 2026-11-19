/** Página de un listado de la API: `{ data, total, page, pageSize }`. */
export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

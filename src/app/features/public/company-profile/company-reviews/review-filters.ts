import { CompanyDetail, OfficeSummary } from '../../../../core/models/company';
import { CatalogItem, PublicReviewFacets, PublicReviewFilters, PublicReviewOrder, ReviewFacet, WorkSituation } from '../../../../core/models/review';
import { FilterOption } from '../../../../shared/ui/option-list/option-list';

/** Filtros de RF5, orden y página: lo que se guarda en la URL del perfil. */
export interface ReviewFilters {
  local?: number;
  cargo?: number;
  tipoContrato?: number;
  modalidad?: number;
  situacion?: WorkSituation;
  orden: PublicReviewOrder;
  page: number;
}

export type ReviewFilterName = 'local' | 'cargo' | 'tipoContrato' | 'modalidad' | 'situacion';

const SITUATIONS: Record<WorkSituation, string> = { ACTUAL: 'Trabaja ahí', ANTERIOR: 'Trabajó ahí' };
const ORDERS: PublicReviewOrder[] = ['recientes', 'mejor', 'peor'];

/** Lleva el foco al título de las reseñas: al cambiar de página o al tocar un local, lo nuevo está ahí arriba. */
export function focusReviews(): void {
  document.getElementById('resenas-titulo')?.focus({ preventScroll: true });
}

/** Convierte el parámetro de la URL en una situación válida. */
export function toSituation(value: unknown): WorkSituation | undefined {
  return value === 'ACTUAL' || value === 'ANTERIOR' ? value : undefined;
}

/** Por defecto, más recientes. */
export function toReviewOrder(value: unknown): PublicReviewOrder {
  return ORDERS.find((order) => order === value) ?? 'recientes';
}

/** Filtros de los conteos: sin orden ni página, para no volver a pedirlos al paginar. */
export function toFacetFilters(empresa: number, filters: ReviewFilters): PublicReviewFilters {
  const { local, cargo, tipoContrato, modalidad, situacion } = filters;
  return { empresa, local, cargo, tipoContrato, modalidad, situacion };
}

export function hasReviewFilters(filters: ReviewFilters): boolean {
  const { orden: _orden, page: _page, ...rest } = filters;
  return Object.values(rest).some((value) => value !== undefined);
}

/**
 * Opciones de un filtro con catálogo: las que dejan resultados y la elegida, aunque otro filtro la deje en cero (si no, la
 * frase se quedaría sin texto). `all` son los conteos de la empresa sin filtros: dan los nombres.
 */
function catalogOptions<T extends CatalogItem>(
  selected: number | undefined,
  everything: string,
  facet: ReviewFacet<T> | undefined,
  all: ReviewFacet<T> | undefined,
  detail: (item: T, count: number) => string | number = (_item, count) => count,
): FilterOption<number>[] {
  const count = new Map(facet?.opciones.map((option) => [option.id, option.cantidad]));
  const options: FilterOption<number>[] = [{ valor: null, etiqueta: everything, detalle: facet?.total }];
  for (const item of all?.opciones ?? []) {
    if (count.has(item.id) || item.id === selected) {
      options.push({ valor: item.id, etiqueta: item.nombre, detalle: detail(item, count.get(item.id) ?? 0) });
    }
  }
  if (selected && !options.some((option) => option.valor === selected)) options.push({ valor: selected, etiqueta: 'la opción elegida', detalle: 0 });
  return options;
}

export interface ReviewFilterOptions {
  local: FilterOption<number>[];
  cargo: FilterOption<number>[];
  tipoContrato: FilterOption<number>[];
  modalidad: FilterOption<number>[];
  situacion: FilterOption<WorkSituation>[];
}

export function reviewFilterOptions(filters: ReviewFilters, facets: PublicReviewFacets | undefined, all: PublicReviewFacets | undefined): ReviewFilterOptions {
  const situations = new Map(facets?.situacion.opciones.map((option) => [option.valor, option.cantidad]));
  return {
    local: catalogOptions(filters.local, 'todos los locales', facets?.local, all?.local, (item, count) => `${item.ciudad} · ${count}`),
    cargo: catalogOptions(filters.cargo, 'cualquier cargo', facets?.cargo, all?.cargo),
    tipoContrato: catalogOptions(filters.tipoContrato, 'Todos', facets?.tipoContrato, all?.tipoContrato),
    modalidad: catalogOptions(filters.modalidad, 'Todas', facets?.modalidad, all?.modalidad),
    situacion: [
      { valor: null, etiqueta: 'Todas', detalle: facets?.situacion.total },
      ...(Object.keys(SITUATIONS) as WorkSituation[]).map((valor) => ({ valor, etiqueta: SITUATIONS[valor], detalle: facets ? (situations.get(valor) ?? 0) : undefined })),
    ],
  };
}

export interface CityOffices {
  ciudad: string;
  locales: OfficeSummary[];
}

/** Locales agrupados por ciudad, en orden alfabético. */
export function officesByCity(offices: OfficeSummary[]): CityOffices[] {
  const groups = new Map<string, OfficeSummary[]>();
  for (const office of offices) {
    const city = office.ciudad.nombre ?? 'Sin ciudad';
    groups.set(city, [...(groups.get(city) ?? []), office]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'es')).map(([ciudad, locales]) => ({ ciudad, locales }));
}

/** «3 locales en Asunción y San Lorenzo»; con más de tres ciudades, «6 locales en 5 ciudades». */
export function officesText(company: Pick<CompanyDetail, 'locales'>): string {
  const total = company.locales.length;
  if (!total) return '';
  const cities = officesByCity(company.locales).map((group) => group.ciudad);
  const place = cities.length > 3 ? `${cities.length} ciudades` : cities.length === 1 ? cities[0] : `${cities.slice(0, -1).join(', ')} y ${cities.at(-1)}`;
  return `${total} ${total === 1 ? 'local' : 'locales'} en ${place}`;
}

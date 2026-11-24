import { CompanyFacets, CompanyFilters, CompanyOrder } from '../../../core/models/company';
import { SECTOR_GROUPS, SectorGroup } from '../../../core/models/sector-group';
import { FilterOption } from '../../../shared/ui/option-list/option-list';

/** Filtro de reseñas en la URL: `?resenas=con` o `?resenas=sin`. */
export type ReviewsFilter = 'con' | 'sin';

/** Filtros del directorio tal como están en la URL. */
export interface DirectoryState {
  q?: string;
  grupo?: SectorGroup;
  departamento?: number;
  ciudad?: number;
  resenas?: ReviewsFilter;
}

export const GROUPS = Object.keys(SECTOR_GROUPS) as SectorGroup[];
const ORDERS: CompanyOrder[] = ['resenas', 'calificacion', 'nombre'];

export function toGroup(value: unknown): SectorGroup | undefined {
  return GROUPS.find((group) => group === value);
}

export function toReviews(value: unknown): ReviewsFilter | undefined {
  return value === 'con' || value === 'sin' ? value : undefined;
}

/** Por defecto, más reseñas. */
export function toOrder(value: unknown): CompanyOrder {
  return ORDERS.find((order) => order === value) ?? 'resenas';
}

export function toFilters(state: DirectoryState): CompanyFilters {
  return {
    q: state.q?.trim() || undefined,
    grupo: state.grupo,
    departamento: state.departamento,
    ciudad: state.ciudad,
    conResenas: state.resenas && state.resenas === 'con',
  };
}

export function hasFilters(state: DirectoryState): boolean {
  return Object.values(toFilters(state)).some((value) => value !== undefined);
}

/** Opciones de rubro de la frase. Sin conteos todavía, la lista funciona igual. */
export function groupOptions(facets: CompanyFacets | undefined): FilterOption<SectorGroup>[] {
  const count = new Map(facets?.grupos.opciones.map((option) => [option.grupo, option.cantidad]));
  return [
    { valor: null, etiqueta: 'todos los rubros', detalle: facets?.grupos.total },
    ...GROUPS.map((group) => ({ valor: group, etiqueta: SECTOR_GROUPS[group].nombre.toLocaleLowerCase('es'), detalle: count.get(group) })),
  ];
}

export function reviewOptions(facets: CompanyFacets | undefined): FilterOption<ReviewsFilter>[] {
  return [
    { valor: null, etiqueta: 'con o sin reseñas', detalle: facets?.resenas.total },
    { valor: 'con', etiqueta: 'con reseñas', detalle: facets?.resenas.con },
    { valor: 'sin', etiqueta: 'sin reseñas todavía', detalle: facets?.resenas.sin },
  ];
}

/** Lugar de la frase: un departamento (`d5`) o la ciudad elegida (`c12`). */
export type PlaceValue = `d${number}` | `c${number}`;

export interface Named {
  id: number;
  nombre: string;
}

export function placeValue(state: DirectoryState): PlaceValue | null {
  if (state.ciudad) return `c${state.ciudad}`;
  return state.departamento ? `d${state.departamento}` : null;
}

/**
 * Todo el país, la ciudad elegida (si hay) y los departamentos con empresas. El lugar elegido está siempre, aunque otro
 * filtro lo deje en cero: si no, la frase se quedaría sin texto.
 */
export function placeOptions(state: DirectoryState, facets: CompanyFacets | undefined, departments: Named[], city: Named | undefined): FilterOption<PlaceValue>[] {
  const count = new Map(facets?.departamentos.opciones.map((option) => [option.id, option.cantidad]));
  const options: FilterOption<PlaceValue>[] = [{ valor: null, etiqueta: 'todo el país', detalle: facets?.departamentos.total }];
  if (state.ciudad) {
    options.push({ valor: `c${state.ciudad}`, etiqueta: city?.nombre ?? 'la ciudad elegida', detalle: facets?.ciudades.opciones.find((o) => o.id === state.ciudad)?.cantidad });
  }
  for (const { id, nombre } of departments) {
    if (count.has(id) || id === state.departamento) options.push({ valor: `d${id}`, etiqueta: nombre, detalle: count.get(id) ?? (facets ? 0 : undefined) });
  }
  // El departamento de la URL antes de que llegue el catálogo.
  if (state.departamento && !options.some((option) => option.valor === `d${state.departamento}`)) {
    options.push({ valor: `d${state.departamento}`, etiqueta: 'el departamento elegido' });
  }
  return options;
}

/** Cambio en la URL al elegir un lugar. */
export function placeParams(value: PlaceValue | null): { departamento: number | null; ciudad: number | null } {
  const id = value ? Number(value.slice(1)) : null;
  return value?.startsWith('c') ? { departamento: null, ciudad: id } : { departamento: id, ciudad: null };
}

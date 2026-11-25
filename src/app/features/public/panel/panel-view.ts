import { Indicator } from '../../../core/models/insights';
import { SECTOR_GROUPS, SectorGroup } from '../../../core/models/sector-group';
import { FilterOption } from '../../../shared/ui/option-list/option-list';
import { Named, PlaceValue } from '../companies-directory/directory-filters';

/** Una parte de la barra: Sí, En parte o No. «No sé» no se dibuja: no entra en el porcentaje. */
export interface Segment {
  clave: 'si' | 'enParte' | 'no';
  nombre: string;
  cantidad: number;
  /** Ancho, sobre Sí + En parte + No. */
  porcentaje: number;
}

export const ANSWERS: { clave: Segment['clave']; nombre: string }[] = [
  { clave: 'si', nombre: 'Sí' },
  { clave: 'enParte', nombre: 'En parte' },
  { clave: 'no', nombre: 'No' },
];

export function segments(indicator: Indicator): Segment[] {
  const answered = indicator.si + indicator.enParte + indicator.no;
  return ANSWERS.map(({ clave, nombre }) => ({ clave, nombre, cantidad: indicator[clave], porcentaje: answered ? (100 * indicator[clave]) / answered : 0 }));
}

/** Lo mismo que dice la barra, en una frase: es lo que leen los lectores de pantalla y quien no distingue los colores. */
export function indicatorText(indicator: Indicator): string {
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts = [`${indicator.si} Sí`, `${indicator.enParte} En parte`, `${indicator.no} No`];
  if (indicator.noSabe) parts.push(`${indicator.noSabe} No sé`);
  return `${parts.join(' · ')} — ${plural(indicator.resenas, 'reseña', 'reseñas')} sin contar «No sé»`;
}

export function groupOptions(): FilterOption<SectorGroup>[] {
  const groups = Object.keys(SECTOR_GROUPS) as SectorGroup[];
  return [
    { valor: null, etiqueta: 'todos los rubros' },
    ...groups.map((group) => ({ valor: group, etiqueta: SECTOR_GROUPS[group].nombre.toLocaleLowerCase('es') })),
  ];
}

/** Todo el país, la ciudad de la URL (si hay) y los 18 departamentos. */
export function placeOptions(departamento: number | undefined, ciudad: number | undefined, departments: Named[], city: Named | undefined): FilterOption<PlaceValue>[] {
  const options: FilterOption<PlaceValue>[] = [{ valor: null, etiqueta: 'todo el país' }];
  if (ciudad) options.push({ valor: `c${ciudad}`, etiqueta: city?.nombre ?? 'la ciudad elegida' });
  options.push(...departments.map(({ id, nombre }) => ({ valor: `d${id}` as PlaceValue, etiqueta: nombre })));
  if (departamento && !departments.some(({ id }) => id === departamento)) {
    options.push({ valor: `d${departamento}`, etiqueta: 'el departamento elegido' });
  }
  return options;
}

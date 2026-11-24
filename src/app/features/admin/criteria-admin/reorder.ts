interface Ordered {
  id: number;
  orden: number;
}

/**
 * Cambios de `orden` para mover un elemento un lugar. Numera desde 1 según la posición y devuelve solo los que cambian: así
 * también se ordenan los que tenían el mismo número. Vacío si no se puede mover.
 */
export function moveChanges<T extends Ordered>(items: T[], id: number, step: -1 | 1): { id: number; orden: number }[] {
  const from = items.findIndex((item) => item.id === id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= items.length) return [];
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next.flatMap((item, i) => (item.orden === i + 1 ? [] : [{ id: item.id, orden: i + 1 }]));
}

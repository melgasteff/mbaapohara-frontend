import { ActivatedRouteSnapshot } from '@angular/router';

/**
 * Versión del encabezado. La elige cada ruta con `data: { encabezado: 'foco' }`; sin dato es la normal.
 * - inicio: sin buscador (el inicio ya es un buscador). - foco: asistente, sin navegación. - admin: administración.
 * - ninguno: pantalla completa, sin encabezado ni pie (ingresar y crear cuenta).
 */
export type HeaderVariant = 'normal' | 'inicio' | 'foco' | 'admin' | 'ninguno';

/** Dato más interno de la cadena de rutas activas. */
export function routeData<T>(root: ActivatedRouteSnapshot, key: string): T | undefined {
  let found: T | undefined;
  for (let route: ActivatedRouteSnapshot | null = root; route; route = route.firstChild) {
    found = (route.data[key] as T | undefined) ?? found;
  }
  return found;
}

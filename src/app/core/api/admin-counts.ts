import { httpResource } from '@angular/common/http';
import { computed, Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { keepWhileLoading } from '../../shared/keep-while-loading';
import { Page } from '../models/page';

export type AdminCount = 'moderacion' | 'reportes' | 'solicitudes' | 'empresas' | 'locales' | 'cargos';

/** Dónde se cuenta lo pendiente de cada sección. Se pide una sola fila: interesa el total. */
const SOURCES: Record<AdminCount, { url: string; params: Record<string, string> }> = {
  moderacion: { url: '/moderation/queue', params: {} },
  reportes: { url: '/moderation/reports', params: {} },
  solicitudes: { url: '/moderation/company-requests', params: { estado: 'pendiente' } },
  empresas: { url: '/companies/admin', params: { estado: 'pendiente' } },
  locales: { url: '/offices/admin', params: { estado: 'pendiente' } },
  cargos: { url: '/jobs/admin', params: { estado: 'pendiente' } },
};

/** Cantidades pendientes de la administración. Se vuelven a pedir con cada decisión. */
@Injectable({ providedIn: 'root' })
export class AdminCounts {
  private readonly changes = signal(0);

  refresh(): void {
    this.changes.update((n) => n + 1);
  }

  /** Total pendiente; `undefined` mientras no se sabe. Se usa en un contexto de inyección. */
  count(kind: AdminCount): Signal<number | undefined> {
    const { url, params } = SOURCES[kind];
    const resource = httpResource<Page<unknown>>(() => {
      this.changes();
      return { url: environment.apiUrl + url, params: { ...params, pageSize: 1 } };
    });
    const page = keepWhileLoading(resource);
    return computed(() => page()?.total);
  }
}

/** Totales de varias secciones sumados (empresas y locales). */
export function sumCounts(...counts: Signal<number | undefined>[]): Signal<number | undefined> {
  return computed(() => (counts.every((count) => count() === undefined) ? undefined : counts.reduce((sum, count) => sum + (count() ?? 0), 0)));
}

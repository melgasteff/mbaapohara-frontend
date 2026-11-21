import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QueueItem } from '../models/moderation';
import { Page } from '../models/page';
import { ModerationCategory } from '../models/review';

/** Revisión humana (solo administradores): la cola y las decisiones (3.9a). */
@Injectable({ providedIn: 'root' })
export class ModerationAdminApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/moderation/queue`;
  /** Cambia con cada decisión: la cantidad pendiente de la navegación se vuelve a pedir. */
  private readonly changes = signal(0);

  queueResource(page: Signal<number>) {
    return httpResource<Page<QueueItem>>(() => ({ url: this.url, params: { page: page(), pageSize: 10 } }));
  }

  /** Solo la cantidad pendiente (pide una fila). */
  pendingResource() {
    return httpResource<Page<QueueItem>>(() => {
      this.changes();
      return { url: this.url, params: { pageSize: 1 } };
    });
  }

  publish(idVersion: number): Observable<unknown> {
    return this.http.patch(`${this.url}/${idVersion}/publish`, {}).pipe(tap(() => this.changes.update((n) => n + 1)));
  }

  reject(idVersion: number, categoria: ModerationCategory, motivo: string): Observable<unknown> {
    return this.http
      .patch(`${this.url}/${idVersion}/reject`, { categoria, motivo })
      .pipe(tap(() => this.changes.update((n) => n + 1)));
  }
}

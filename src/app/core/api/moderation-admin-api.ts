import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyRequest, CompanyRequestStatus, QueueItem, ReportedReview } from '../models/moderation';
import { Page } from '../models/page';
import { ModerationCategory } from '../models/review';

/** Revisión humana (solo administradores): la cola y las decisiones (3.9a). */
@Injectable({ providedIn: 'root' })
export class ModerationAdminApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/moderation/queue`;
  queueResource(page: Signal<number>) {
    return httpResource<Page<QueueItem>>(() => ({ url: this.url, params: { page: page(), pageSize: 10 } }));
  }

  publish(idVersion: number): Observable<unknown> {
    return this.http.patch(`${this.url}/${idVersion}/publish`, {});
  }

  reject(idVersion: number, categoria: ModerationCategory, motivo: string): Observable<unknown> {
    return this.http.patch(`${this.url}/${idVersion}/reject`, { categoria, motivo });
  }

  // ---------- Reportes y retiro (3.9b)

  reportsResource(page: Signal<number>) {
    return httpResource<Page<ReportedReview>>(() => ({ url: `${environment.apiUrl}/moderation/reports`, params: { page: page(), pageSize: 10 } }));
  }

  /** La reseña cumple las reglas: se cierran sus reportes. */
  keepReported(idResena: number): Observable<unknown> {
    return this.http.patch(`${environment.apiUrl}/moderation/reviews/${idResena}/keep`, {});
  }

  /** Retira una reseña publicada que incumple las reglas; quien la escribió ve el motivo. */
  retire(idResena: number, categoria: ModerationCategory, motivo: string): Observable<unknown> {
    return this.http.patch(`${environment.apiUrl}/moderation/reviews/${idResena}/retire`, { categoria, motivo });
  }

  // ---------- Solicitudes de empresas (3.9b)

  requestsResource(estado: Signal<CompanyRequestStatus | undefined>, page: Signal<number>) {
    return httpResource<Page<CompanyRequest>>(() => {
      const value = estado();
      return {
        url: `${environment.apiUrl}/moderation/company-requests`,
        params: { page: page(), pageSize: 10, ...(value ? { estado: value } : {}) },
      };
    });
  }

  /** Registra la respuesta enviada por correo; se borran el nombre y el correo de la solicitud. */
  answer(id: number, respuesta: string): Observable<unknown> {
    return this.http.patch(`${environment.apiUrl}/moderation/company-requests/${id}/answer`, { respuesta });
  }
}

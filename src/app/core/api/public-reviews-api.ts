import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { NewCompanyRequest, ReportCategory } from '../models/moderation';
import { PublicReview, PublicReviewFacets, PublicReviewFilters, PublicReviewsQuery } from '../models/review';
import { toParams } from './query-params';

/** Reseñas publicadas (GET /reviews, público). Solo trae lo que la moderación publicó. */
@Injectable({ providedIn: 'root' })
export class PublicReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reviews`;

  /** Una reseña publicada; `undefined` no pide nada. */
  detailResource(id: Signal<number | undefined>) {
    return httpResource<PublicReview>(() => {
      const value = id();
      return value ? `${this.url}/${value}` : undefined;
    });
  }

  /** Reporta una reseña publicada (exige sesión). Sigue visible mientras se revisa. */
  report(id: number, categoria: ReportCategory, comentario?: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.url}/${id}/reports`, { categoria, ...(comentario ? { comentario } : {}) });
  }

  /** Solicitud de una empresa (público, sin cuenta). */
  requestRevision(body: NewCompanyRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${environment.apiUrl}/company-requests`, body);
  }

  /** Listado paginado que se vuelve a pedir cada vez que cambian los filtros; `undefined` no pide nada. */
  listResource(query: Signal<PublicReviewsQuery | undefined>) {
    return httpResource<Page<PublicReview>>(() => {
      const value = query();
      return value ? { url: this.url, params: toParams(value) } : undefined;
    });
  }

  /** Conteos por opción de cada filtro del perfil. */
  facetsResource(filters: Signal<PublicReviewFilters>) {
    return httpResource<PublicReviewFacets>(() => ({ url: `${this.url}/facets`, params: toParams(filters()) }));
  }
}

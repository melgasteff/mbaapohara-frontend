import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { PublicReview, PublicReviewsQuery } from '../models/review';
import { toParams } from './query-params';

/** Reseñas publicadas (GET /reviews, público). Solo trae lo que la moderación publicó. */
@Injectable({ providedIn: 'root' })
export class PublicReviewsApi {
  private readonly url = `${environment.apiUrl}/reviews`;

  /** Listado paginado que se vuelve a pedir cada vez que cambian los filtros; `undefined` no pide nada. */
  listResource(query: Signal<PublicReviewsQuery | undefined>) {
    return httpResource<Page<PublicReview>>(() => {
      const value = query();
      return value ? { url: this.url, params: toParams(value) } : undefined;
    });
  }
}

import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Insights, InsightsFilters } from '../models/insights';
import { toParams } from './query-params';

/** Panel de indicadores (GET /insights, público): solo reseñas publicadas, agregadas. */
@Injectable({ providedIn: 'root' })
export class InsightsApi {
  private readonly url = `${environment.apiUrl}/insights`;

  /** Se vuelve a pedir cada vez que cambian los filtros. */
  resource(filters: Signal<InsightsFilters>) {
    return httpResource<Insights>(() => ({ url: this.url, params: toParams(filters()) }));
  }
}

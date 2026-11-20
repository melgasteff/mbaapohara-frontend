import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { CatalogItem } from '../models/review';

/** Modalidades de trabajo (GET /work-modes, lista fija de R5). */
@Injectable({ providedIn: 'root' })
export class WorkModesApi {
  allResource() {
    return httpResource<Page<CatalogItem>>(() => ({
      url: `${environment.apiUrl}/work-modes`,
      params: { pageSize: 100 },
    }));
  }
}

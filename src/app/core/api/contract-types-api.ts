import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { CatalogItem } from '../models/review';

/** Tipos de contrato (GET /contract-types, lista fija de R5). */
@Injectable({ providedIn: 'root' })
export class ContractTypesApi {
  allResource() {
    return httpResource<Page<CatalogItem>>(() => ({
      url: `${environment.apiUrl}/contract-types`,
      params: { pageSize: 100 },
    }));
  }
}

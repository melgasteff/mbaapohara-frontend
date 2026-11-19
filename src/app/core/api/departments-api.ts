import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Department } from '../models/catalog';
import { Page } from '../models/page';

/** Departamentos del INE. Son 18, así que entran en una sola página. */
@Injectable({ providedIn: 'root' })
export class DepartmentsApi {
  private readonly url = `${environment.apiUrl}/departments`;

  allResource() {
    return httpResource<Page<Department>>(() => ({ url: this.url, params: { pageSize: 100 } }));
  }
}

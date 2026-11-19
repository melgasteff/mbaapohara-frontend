import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CompaniesQuery, Company, CompanyDetail } from '../models/company';
import { Page } from '../models/page';
import { toParams } from './query-params';

/** Empresas (endpoints públicos: solo devuelven las aprobadas). */
@Injectable({ providedIn: 'root' })
export class CompaniesApi {
  private readonly url = `${environment.apiUrl}/companies`;

  /** Listado paginado que se vuelve a pedir cada vez que cambian los filtros. */
  listResource(query: Signal<CompaniesQuery>) {
    return httpResource<Page<Company>>(() => ({ url: this.url, params: toParams(query()) }));
  }

  /** Empresa con sus locales; `undefined` no hace ninguna petición. */
  detailResource(id: Signal<number | undefined>) {
    return httpResource<CompanyDetail>(() => {
      const value = id();
      return value ? `${this.url}/${value}` : undefined;
    });
  }
}

import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CompaniesQuery, CompanyDetail, CompanyFacets, CompanyFilters, CompanySummary } from '../models/company';
import { Page } from '../models/page';
import { toParams } from './query-params';

/** Empresas (endpoints públicos: solo devuelven las aprobadas). */
@Injectable({ providedIn: 'root' })
export class CompaniesApi {
  private readonly url = `${environment.apiUrl}/companies`;

  /** Listado paginado que se vuelve a pedir cada vez que cambian los filtros. */
  listResource(query: Signal<CompaniesQuery>) {
    return httpResource<Page<CompanySummary>>(() => ({ url: this.url, params: toParams(query()) }));
  }

  /** Conteos por opción de cada filtro del directorio. */
  facetsResource(filters: Signal<CompanyFilters>) {
    return httpResource<CompanyFacets>(() => ({ url: `${this.url}/facets`, params: toParams(filters()) }));
  }

  /** Empresa con sus locales y el resumen de sus reseñas; `undefined` no hace ninguna petición. */
  detailResource(id: Signal<number | undefined>) {
    return httpResource<CompanyDetail>(() => {
      const value = id();
      return value ? `${this.url}/${value}` : undefined;
    });
  }
}

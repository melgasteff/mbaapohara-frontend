import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminCompaniesQuery, Company, ProposeCompany, SaveCompany } from '../models/company';
import { Page } from '../models/page';
import { toParams } from './query-params';

/** Administración de empresas (solo rol administrador; el interceptor agrega el token). */
@Injectable({ providedIn: 'root' })
export class CompaniesAdminApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/companies`;

  /** Empresas en cualquier estado (GET /companies/admin). */
  listResource(query: Signal<AdminCompaniesQuery>) {
    return httpResource<Page<Company>>(() => ({ url: `${this.url}/admin`, params: toParams(query()) }));
  }

  /** Crea la empresa con su primer local; los dos quedan pendientes hasta aprobarlos. */
  create(data: ProposeCompany) {
    return this.http.post<Company>(this.url, data);
  }

  update(id: number, data: SaveCompany) {
    return this.http.put<Company>(`${this.url}/${id}`, data);
  }

  /** Aprueba la empresa y sus locales pendientes. */
  approve(id: number) {
    return this.http.patch<Company>(`${this.url}/${id}/approve`, {});
  }

  /** Rechaza la empresa y sus locales pendientes. */
  reject(id: number) {
    return this.http.patch<Company>(`${this.url}/${id}/reject`, {});
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

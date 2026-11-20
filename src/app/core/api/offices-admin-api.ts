import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminOfficesQuery, Office, SaveOffice } from '../models/company';
import { Page } from '../models/page';
import { toParams } from './query-params';

/** Administración de locales (solo rol administrador). */
@Injectable({ providedIn: 'root' })
export class OfficesAdminApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  /** Locales en cualquier estado, con su empresa (GET /offices/admin). */
  listResource(query: Signal<AdminOfficesQuery | undefined>) {
    return httpResource<Page<Office>>(() => {
      const value = query();
      return value ? { url: `${this.url}/offices/admin`, params: toParams(value) } : undefined;
    });
  }

  /** Agrega un local a la empresa; queda pendiente hasta aprobarlo. */
  create(idEmpresa: number, data: SaveOffice) {
    return this.http.post<Office>(`${this.url}/companies/${idEmpresa}/offices`, data);
  }

  update(id: number, data: SaveOffice) {
    return this.http.put<Office>(`${this.url}/offices/${id}`, data);
  }

  approve(id: number) {
    return this.http.patch<Office>(`${this.url}/offices/${id}/approve`, {});
  }

  reject(id: number) {
    return this.http.patch<Office>(`${this.url}/offices/${id}/reject`, {});
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/offices/${id}`);
  }
}

import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { ProposalStatus } from '../models/company';
import { Job } from '../models/review';

/** Cargos (GET /jobs es público; crear y eliminar son del administrador). */
@Injectable({ providedIn: 'root' })
export class JobsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/jobs`;

  allResource() {
    return httpResource<Page<Job>>(() => ({ url: this.url, params: { pageSize: 100 } }));
  }

  create(descripcion: string) {
    return this.http.post<Job>(this.url, { descripcion });
  }

  /** Administración: cargos en un estado (por ejemplo, los propuestos desde una reseña, pendientes). */
  adminResource(estado: ProposalStatus) {
    return httpResource<Page<Job & { estado: ProposalStatus }>>(() => ({ url: `${this.url}/admin`, params: { estado, pageSize: 100 } }));
  }

  approve(id: number) {
    return this.http.patch<Job>(`${this.url}/${id}/approve`, {});
  }

  reject(id: number) {
    return this.http.patch<Job>(`${this.url}/${id}/reject`, {});
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

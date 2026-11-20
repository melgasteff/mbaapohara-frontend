import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
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

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

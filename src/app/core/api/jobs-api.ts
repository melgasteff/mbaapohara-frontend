import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Job } from '../models/review';
import { Page } from '../models/page';

/** Cargos (GET /jobs). */
@Injectable({ providedIn: 'root' })
export class JobsApi {
  allResource() {
    return httpResource<Page<Job>>(() => ({ url: `${environment.apiUrl}/jobs`, params: { pageSize: 100 } }));
  }
}

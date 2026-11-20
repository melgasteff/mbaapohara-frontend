import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SectorItem } from '../models/company';
import { Page } from '../models/page';

/** Rubros (secciones CIIU Rev. 4, GET /sectors). Son 21: entran en una página. */
@Injectable({ providedIn: 'root' })
export class SectorsApi {
  allResource() {
    return httpResource<Page<SectorItem>>(() => ({ url: `${environment.apiUrl}/sectors`, params: { pageSize: 100 } }));
  }
}

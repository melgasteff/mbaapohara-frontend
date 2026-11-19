import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { City } from '../models/catalog';
import { Page } from '../models/page';

/** Ciudades del INE. Se piden por departamento: ninguno tiene más de 100. */
@Injectable({ providedIn: 'root' })
export class CitiesApi {
  private readonly url = `${environment.apiUrl}/cities`;

  /** Ciudades del departamento; `undefined` no hace ninguna petición. */
  byDepartmentResource(departamento: Signal<number | undefined>) {
    return httpResource<Page<City>>(() => {
      const value = departamento();
      return value ? { url: this.url, params: { departamento: value, pageSize: 100 } } : undefined;
    });
  }
}

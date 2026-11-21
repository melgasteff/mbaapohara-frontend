import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminCriteriaCategory, AdminCriterion, CriteriaChange } from '../models/criteria';
import { CriteriaCategory, CriteriaConfig } from '../models/review';

/** La forma fija de la reseña (R2 a R7): opciones de respuesta, textos y calificación. */
type ReviewShape = Omit<CriteriaConfig, 'categorias'>;

/** Configuración del asistente armada con dos pedidos; se usa como un `httpResource`. */
export interface CriteriaConfigResource {
  hasValue(): boolean;
  value: Signal<CriteriaConfig>;
  error(): unknown;
  reload(): void;
}

/**
 * Criterios de la reseña. Las categorías e ítems vienen de la API (GET /criteria, tarea 3.8), donde los administra
 * el administrador. La forma de la reseña sigue en public/criterios-provisionales.json: no es contenido de criterios.
 */
@Injectable({ providedIn: 'root' })
export class CriteriaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/criteria`;

  configResource(): CriteriaConfigResource {
    const shape = httpResource<ReviewShape>(() => '/criterios-provisionales.json');
    const categories = httpResource<CriteriaCategory[]>(() => this.url);
    return {
      hasValue: () => shape.hasValue() && categories.hasValue(),
      // Solo se lee después de hasValue(), como un httpResource.
      value: computed(() => ({ ...shape.value()!, categorias: categories.value()! })),
      error: () => shape.error() ?? categories.error(),
      reload: () => {
        if (shape.error()) shape.reload();
        if (categories.error()) categories.reload();
      },
    };
  }

  /** Administración: todas las categorías e ítems, activos o no, con sus respuestas. */
  adminResource() {
    return httpResource<AdminCriteriaCategory[]>(() => `${this.url}/admin`);
  }

  createCategory(codigo: string, nombre: string) {
    return this.http.post<AdminCriteriaCategory>(`${this.url}/categories`, { codigo, nombre });
  }

  updateCategory(id: number, change: CriteriaChange) {
    return this.http.patch<AdminCriteriaCategory>(`${this.url}/categories/${id}`, change);
  }

  createItem(idCategoria: number, codigo: string, texto: string) {
    return this.http.post<AdminCriterion>(`${this.url}/items`, { idCategoria, codigo, texto });
  }

  updateItem(id: number, change: CriteriaChange) {
    return this.http.patch<AdminCriterion>(`${this.url}/items/${id}`, change);
  }
}

import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CriteriaConfig } from '../models/review';

/**
 * Criterios PROVISIONALES de la reseña (preguntas 5 a 8 del cuestionario). Se leen como datos estáticos hasta
 * que exista el módulo `criteria` de la API (Fase 3); cambiarlos es cambiar el JSON.
 */
@Injectable({ providedIn: 'root' })
export class CriteriaApi {
  configResource() {
    return httpResource<CriteriaConfig>(() => '/criterios-provisionales.json');
  }
}

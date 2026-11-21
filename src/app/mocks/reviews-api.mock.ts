import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ReviewsApi } from '../core/api/reviews-api';
import { MyReview, PublishResult, ReviewDraft } from '../core/models/review';

// PROTOTIPO: no guarda nada. Imita dos filas de la tabla de decisión de la política de moderación
// (mbaapohara-backend/docs/politica-moderacion.md, sección 5) para que la demo muestre los tres estados.
// La moderación real (reglas + modelo de lenguaje + revisión humana) es la tarea 2.3.

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
/** Seis dígitos o más, con o sin separadores: teléfonos y números de cédula. */
const LONG_NUMBER = /\d(?:[\s.-]?\d){5,}/;
const LINK = /\bhttps?:\/\/|\bwww\.\S/i;
/** Palabras que sugieren la acusación de un delito (ACU). En el sistema real lo detecta el modelo. */
const CRIME = /\b(rob[aoó]\w*|acos[ao]\w*|abus[ao]\w*|estaf[aoó]\w*|fraude\w*)\b/i;

/** Mensajes de la política (sección 7). */
const DP_MESSAGE =
  'Tu reseña tiene datos de contacto (un teléfono, un correo, un documento o un enlace). Sacalos y volvé a enviarla.';
const ACU_MESSAGE =
  'Tu reseña menciona un posible delito. Una persona del equipo la revisa antes de publicarla, sin saber quién la escribió.';

/** Resultado simulado de la moderación de un texto. */
export function simulateModeration(text: string): Omit<PublishResult, 'id'> {
  // Fila 1: regla de datos de contacto → rechazada con explicación.
  if (EMAIL.test(text) || LONG_NUMBER.test(text) || LINK.test(text)) {
    return { estado: 'rechazada', categoria: 'DP', motivo: DP_MESSAGE };
  }
  // Fila 2: posible acusación → siempre revisión humana.
  if (CRIME.test(text)) {
    return { estado: 'en_revision', categoria: 'ACU', motivo: ACU_MESSAGE };
  }
  return { estado: 'publicada' };
}

@Injectable()
export class MockReviewsApi extends ReviewsApi {
  private nextId = 1;

  publish(draft: ReviewDraft): Observable<PublishResult> {
    return this.simulate(this.nextId++, draft);
  }

  update(id: number, draft: ReviewDraft): Observable<PublishResult> {
    return this.simulate(id, draft);
  }

  remove(): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  mine(): Observable<MyReview[]> {
    return of([]);
  }

  private simulate(id: number, draft: ReviewDraft): Observable<PublishResult> {
    return of({ id, ...simulateModeration(`${draft.loBueno}\n${draft.aMejorar}`) }).pipe(delay(800));
  }
}

import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ReviewsApi } from '../core/api/reviews-api';
import { PublishResult, ReviewDraft } from '../core/models/review';

// PROTOTIPO: no guarda nada. Simula la moderación con una sola regla para que la demo muestre los dos estados.
// La moderación real (reglas + modelo de lenguaje + revisión humana) es la tarea 2.3.

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
/** Seis dígitos o más, con o sin separadores: teléfonos y números de cédula. */
const LONG_NUMBER = /\d(?:[\s.-]?\d){5,}/;

/** Devuelve el motivo de revisión si el texto parece tener datos personales. */
export function personalDataReason(text: string): string | undefined {
  if (EMAIL.test(text)) return 'El texto parece incluir un correo electrónico.';
  if (LONG_NUMBER.test(text)) return 'El texto parece incluir un número de teléfono o de documento.';
  return undefined;
}

@Injectable()
export class MockReviewsApi extends ReviewsApi {
  publish(draft: ReviewDraft): Observable<PublishResult> {
    const motivo = personalDataReason(`${draft.loBueno}\n${draft.aMejorar}`);
    const result: PublishResult = motivo ? { estado: 'en_revision', motivo } : { estado: 'publicada' };
    return of(result).pipe(delay(800));
  }
}

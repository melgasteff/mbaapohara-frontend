import { Observable } from 'rxjs';
import { MyReview, PublishResult, ReviewDraft } from '../models/review';

/**
 * Reseñas de quien escribe. La implementación HTTP (HttpReviewsApi, tarea 3.3) se enlaza en app.config.ts; el
 * simulador de src/app/mocks sirve para probar los componentes sin la API.
 */
export abstract class ReviewsApi {
  /** Publica una reseña nueva; responde el resultado de la moderación. */
  abstract publish(draft: ReviewDraft): Observable<PublishResult>;
  /** Guarda una versión nueva de una reseña propia (el local no cambia). */
  abstract update(id: number, draft: ReviewDraft): Observable<PublishResult>;
  /** Borra una reseña propia con todas sus versiones. */
  abstract remove(id: number): Observable<void>;
  /** Las reseñas propias, con la última versión de cada una. */
  abstract mine(): Observable<MyReview[]>;
}

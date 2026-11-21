import { Observable } from 'rxjs';
import { PublishResult, ReviewDraft } from '../models/review';

/**
 * Publicación de reseñas. La implementación HTTP (HttpReviewsApi, tarea 3.3) se enlaza en app.config.ts; el simulador
 * de src/app/mocks sirve para probar los componentes sin la API.
 */
export abstract class ReviewsApi {
  abstract publish(draft: ReviewDraft): Observable<PublishResult>;
}

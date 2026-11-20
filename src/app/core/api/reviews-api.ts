import { Observable } from 'rxjs';
import { PublishResult, ReviewDraft } from '../models/review';

/**
 * Publicación de reseñas. Hoy la implementa un simulador (src/app/mocks); en la Fase 3 (3.3) se enlaza la
 * implementación HTTP en app.config.ts sin tocar los componentes.
 */
export abstract class ReviewsApi {
  abstract publish(draft: ReviewDraft): Observable<PublishResult>;
}

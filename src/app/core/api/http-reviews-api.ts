import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublishResult, ReviewDraft } from '../models/review';
import { ReviewsApi } from './reviews-api';

/** Cuerpo de POST /reviews (mbaapohara-backend, tarea 3.3). */
export interface PublishReviewBody {
  idLocal: number;
  idCargo?: number;
  cargoPropuesto?: string;
  situacion: ReviewDraft['situacion'];
  ultimoAnio?: number;
  idTipoContrato: number;
  idModalidad: number;
  calificacion: number;
  loBueno: string;
  aMejorar: string;
  respuestas: Record<string, string>;
}

/** Arma el cuerpo de la API a partir del borrador del asistente. */
export function toPublishBody(draft: ReviewDraft): PublishReviewBody {
  return {
    idLocal: draft.local.id,
    // Cargo de la lista o propuesto por la persona: la API acepta uno de los dos.
    ...(draft.cargo.id !== null ? { idCargo: draft.cargo.id } : { cargoPropuesto: draft.cargo.nombre }),
    situacion: draft.situacion,
    // Solo el año, y solo si ya no trabaja ahí (anonimato, R5).
    ...(draft.situacion === 'ANTERIOR' ? { ultimoAnio: draft.ultimoAnio } : {}),
    idTipoContrato: draft.tipoContrato.id,
    idModalidad: draft.modalidad.id,
    calificacion: draft.calificacion,
    loBueno: draft.loBueno,
    aMejorar: draft.aMejorar,
    respuestas: draft.respuestas,
  };
}

/** Publicación real de reseñas: la API guarda la reseña, la modera y responde el resultado. */
@Injectable()
export class HttpReviewsApi extends ReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reviews`;

  publish(draft: ReviewDraft): Observable<PublishResult> {
    return this.http
      .post<PublishResult & { id: number }>(this.url, toPublishBody(draft))
      .pipe(map(({ estado, categoria, motivo }) => ({ estado, categoria, motivo })));
  }
}

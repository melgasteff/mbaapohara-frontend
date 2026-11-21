import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyReview, PublishResult, ReviewDraft } from '../models/review';
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

/** Reseñas contra la API: guarda, modera y responde el resultado (mbaapohara-backend, tarea 3.3). */
@Injectable()
export class HttpReviewsApi extends ReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reviews`;

  publish(draft: ReviewDraft): Observable<PublishResult> {
    return this.http.post<PublishResult>(this.url, toPublishBody(draft)).pipe(map(toResult));
  }

  update(id: number, draft: ReviewDraft): Observable<PublishResult> {
    // El local no se cambia al editar: la API no lo acepta.
    const { idLocal: _local, ...body } = toPublishBody(draft);
    return this.http.put<PublishResult>(`${this.url}/${id}`, body).pipe(map(toResult));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  mine(): Observable<MyReview[]> {
    return this.http.get<MyReview[]>(`${this.url}/mine`);
  }
}

function toResult({ id, estado, categoria, motivo }: PublishResult): PublishResult {
  return { id, estado, categoria, motivo };
}

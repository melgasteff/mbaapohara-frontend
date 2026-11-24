import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideLock, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { MyReview, REVIEW_STATUS_LABELS } from '../../../core/models/review';
import { confirmAction } from '../../../shared/confirm-action';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { ReviewCard } from '../../../shared/ui/review-card/review-card';
import { Tag } from '../../../shared/ui/tag/tag';

/** Metadatos sin género de la última versión: «Trabajó aquí · Cajera · Asunción · hasta 2025». */
export function myReviewMeta(review: MyReview): string[] {
  const v = review.ultimaVersion;
  return [
    v.situacion === 'ACTUAL' ? 'Trabaja aquí' : 'Trabajó aquí',
    v.cargo.aprobado ? v.cargo.descripcion : `${v.cargo.descripcion} (cargo en revisión)`,
    review.local.ciudad,
    ...(v.situacion === 'ANTERIOR' && v.ultimoAnio ? [`hasta ${v.ultimoAnio}`] : []),
  ];
}

/**
 * Mis reseñas (3.4): la última versión de cada reseña propia, con su estado y el motivo de la moderación
 * (política de moderación, sección 7). Desde acá se edita o se borra. Usa GET y DELETE /reviews.
 */
@Component({
  selector: 'app-my-reviews',
  imports: [
    DatePipe,
    RouterLink,
    PageState,
    ReviewCard,
    Tag,
    LucideCircleAlert,
    LucideLock,
    LucidePencil,
    LucideTrash2,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-reviews.html',
  styleUrl: './my-reviews.css',
})
export class MyReviews {
  private readonly api = inject(ReviewsApi);

  protected readonly reviews = rxResource({ stream: () => this.api.mine() });
  protected readonly meta = myReviewMeta;
  protected readonly statusLabels = REVIEW_STATUS_LABELS;
  private readonly config = inject(CriteriaApi).configResource();
  /** Reseña que se está borrando. */
  protected readonly deleting = signal<number | null>(null);
  protected readonly deleteError = signal<{ id: number; message: string } | null>(null);

  /** Palabra de la calificación; sin ella (si no cargó la configuración) queda solo el número. */
  protected word(rating: number): string | undefined {
    return this.config.hasValue() ? this.config.value().calificacionGeneral.palabras[rating] : undefined;
  }

  protected remove(review: MyReview): void {
    const question = `¿Borrar tu reseña de ${review.empresa.nombre} (${review.local.nombre})? Se borra de forma definitiva, con todas sus versiones.`;
    if (!confirmAction(question)) return;
    this.deleting.set(review.id);
    this.deleteError.set(null);
    this.api.remove(review.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.reviews.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(null);
        this.deleteError.set({ id: review.id, message: apiErrorMessage(error) });
      },
    });
  }
}

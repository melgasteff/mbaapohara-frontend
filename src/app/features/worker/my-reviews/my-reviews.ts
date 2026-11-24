import { formatDate } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, LOCALE_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert } from '@lucide/angular';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { MyReview, REVIEW_STATUS_LABELS } from '../../../core/models/review';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { CompanySeal } from '../../../shared/ui/company-seal/company-seal';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { ReviewCard } from '../../../shared/ui/review-card/review-card';
import { Tabs } from '../../../shared/ui/tabs/tabs';
import { Tag } from '../../../shared/ui/tag/tag';
import { inTab, MyReviewTab, myReviewTabs } from './my-review-tabs';

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
  imports: [RouterLink, CompanySeal, InlineConfirm, PageState, ReviewCard, Tabs, Tag, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-reviews.html',
  styleUrl: './my-reviews.css',
})
export class MyReviews {
  private readonly api = inject(ReviewsApi);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);

  protected readonly resource = rxResource({ stream: () => this.api.mine() });
  /** Al volver a pedir la lista después de borrar, la pantalla no parpadea. */
  protected readonly reviews = keepWhileLoading(this.resource);
  protected readonly tab = signal<MyReviewTab>('todas');
  protected readonly tabs = computed(() => myReviewTabs(this.reviews() ?? []));
  private readonly visible = computed(() => inTab(this.reviews() ?? [], this.tab()));
  /** Las que necesitan un cambio van arriba, en bloque. */
  protected readonly toFix = computed(() => this.visible().filter((review) => review.ultimaVersion.estado === 'rechazada'));
  protected readonly rows = computed(() => this.visible().filter((review) => review.ultimaVersion.estado !== 'rechazada'));

  protected readonly meta = myReviewMeta;
  protected readonly statusLabels = REVIEW_STATUS_LABELS;
  private readonly config = inject(CriteriaApi).configResource();
  /** Reseñas desplegadas con «Ver». */
  protected readonly open = signal<ReadonlySet<number>>(new Set());
  /** Reseña que espera la confirmación para borrarse, y la que se está borrando. */
  protected readonly confirming = signal<number | null>(null);
  protected readonly deleting = signal<number | null>(null);
  protected readonly deleteError = signal<{ id: number; message: string } | null>(null);
  protected readonly notice = signal('');

  /** Palabra de la calificación; sin ella (si no cargó la configuración) queda solo el número. */
  protected word(rating: number): string | undefined {
    return this.config.hasValue() ? this.config.value().calificacionGeneral.palabras[rating] : undefined;
  }

  /** «Centro, Asunción · enviada en noviembre de 2026». La API no da el mes en que se publicó. */
  protected place(review: MyReview): string {
    const sent = formatDate(review.ultimaVersion.fecha, "MMMM 'de' y", this.locale).toLocaleLowerCase('es');
    return `${review.local.nombre}, ${review.local.ciudad} · enviada en ${sent}`;
  }

  protected question(review: MyReview): string {
    const base = `¿Borrar tu reseña sobre ${review.empresa.nombre}?`;
    return review.publicada ? `${base} Deja de verse en el perfil y no se puede deshacer.` : `${base} No se puede deshacer.`;
  }

  protected setTab(tab: MyReviewTab): void {
    this.tab.set(tab);
    this.confirming.set(null);
  }

  protected toggle(id: number): void {
    this.open.update((open) => {
      const next = new Set(open);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  protected ask(id: number): void {
    if (this.deleting() !== null) return;
    this.deleteError.set(null);
    this.notice.set('');
    this.confirming.set(id);
  }

  protected cancel(id: number): void {
    this.confirming.set(null);
    this.focus(`#borrar-${id}`);
  }

  protected remove(review: MyReview): void {
    this.confirming.set(null);
    this.deleting.set(review.id);
    this.focus(`#borrar-${review.id}`);
    this.api.remove(review.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.notice.set(`Borramos tu reseña sobre ${review.empresa.nombre}.`);
        this.resource.reload();
        this.focus('h1');
      },
      error: (error: unknown) => {
        this.deleting.set(null);
        this.deleteError.set({ id: review.id, message: apiErrorMessage(error) });
      },
    });
  }

  private focus(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}

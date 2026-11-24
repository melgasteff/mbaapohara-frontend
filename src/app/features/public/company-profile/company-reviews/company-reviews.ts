import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CriteriaConfigResource } from '../../../../core/api/criteria-api';
import { PublicReviewsApi } from '../../../../core/api/public-reviews-api';
import { CompanyDetail } from '../../../../core/models/company';
import { Page } from '../../../../core/models/page';
import { PublicReview, PublicReviewFacets } from '../../../../core/models/review';
import { keepWhileLoading } from '../../../../shared/keep-while-loading';
import { FilterChip } from '../../../../shared/ui/filter-chip/filter-chip';
import { PageState } from '../../../../shared/ui/page-state/page-state';
import { Pager } from '../../../../shared/ui/pager/pager';
import { ReviewCard } from '../../../../shared/ui/review-card/review-card';
import { SentenceFilter } from '../../../../shared/ui/sentence-filter/sentence-filter';
import { ReviewActions } from './review-actions';
import { focusReviews, hasReviewFilters, ReviewFilterName, ReviewFilters, reviewFilterOptions, toFacetFilters, toReviewOrder } from './review-filters';
import { complianceGroups, publicationMonth, publicReviewMeta } from './review-view';

const PAGE_SIZE = 10;

/**
 * Reseñas publicadas de una empresa, con los filtros de RF5 (local, cargo, contrato, modalidad y situación) y sus conteos.
 * Los filtros viven en la URL del perfil, como en el directorio: «atrás» y los enlaces compartidos funcionan.
 */
@Component({
  selector: 'app-company-reviews',
  imports: [DecimalPipe, PageState, Pager, ReviewCard, ReviewActions, SentenceFilter, FilterChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-reviews.html',
  styleUrl: './company-reviews.css',
})
export class CompanyReviews {
  readonly company = input.required<CompanyDetail>();
  readonly filters = input.required<ReviewFilters>();
  /** Forma de la reseña y criterios, para las palabras y el detalle de derechos. */
  readonly config = input.required<CriteriaConfigResource>();

  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly api = inject(PublicReviewsApi);

  protected readonly reviews = this.api.listResource(
    computed(() => ({ ...this.filters(), empresa: this.company().id, pageSize: PAGE_SIZE })),
  );
  private readonly facetsResource = this.api.facetsResource(computed(() => toFacetFilters(this.company().id, this.filters())));
  // Conteos de la empresa sin filtros: dan el nombre de una opción elegida que otro filtro deja en cero.
  private readonly allFacets = this.api.facetsResource(computed(() => ({ empresa: this.company().id })));

  protected readonly result = keepWhileLoading<Page<PublicReview>>(this.reviews);
  private readonly facets = keepWhileLoading<PublicReviewFacets>(this.facetsResource);

  protected readonly options = computed(() =>
    reviewFilterOptions(this.filters(), this.facets(), this.allFacets.hasValue() ? this.allFacets.value() : undefined),
  );
  protected readonly active = computed(() => hasReviewFilters(this.filters()));
  protected readonly meta = publicReviewMeta;

  protected month(review: PublicReview): string {
    return publicationMonth(review.mesPublicacion, this.locale);
  }

  protected word(review: PublicReview): string | undefined {
    return this.config().hasValue() ? this.config().value().calificacionGeneral.palabras[review.calificacion] : undefined;
  }

  protected compliance(review: PublicReview) {
    return this.config().hasValue() ? complianceGroups(review, this.config().value()) : [];
  }

  protected select(name: ReviewFilterName, value: string | number | null): void {
    this.navigate({ [name]: value, page: null });
  }

  protected selectOrder(value: string): void {
    const orden = toReviewOrder(value);
    this.navigate({ orden: orden === 'recientes' ? null : orden, page: null });
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null }).then(focusReviews);
  }

  protected clearFilters(): void {
    this.navigate({ local: null, cargo: null, tipoContrato: null, modalidad: null, situacion: null, page: null });
  }

  /** Reintenta la lista y, si también fallaron, los conteos. */
  protected reload(): void {
    this.reviews.reload();
    for (const resource of [this.facetsResource, this.allFacets]) if (resource.error()) resource.reload();
  }

  private navigate(queryParams: Record<string, string | number | null>): Promise<boolean> {
    return this.router.navigate([], { queryParams, queryParamsHandling: 'merge', fragment: 'resenas' });
  }
}

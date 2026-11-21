import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleCheck,
  LucideCircleDot,
  LucideCircleQuestionMark,
  LucideCircleX,
} from '@lucide/angular';
import { ContractTypesApi } from '../../../../core/api/contract-types-api';
import { CriteriaApi } from '../../../../core/api/criteria-api';
import { JobsApi } from '../../../../core/api/jobs-api';
import { PublicReviewsApi } from '../../../../core/api/public-reviews-api';
import { WorkModesApi } from '../../../../core/api/work-modes-api';
import { CompanyDetail, Office } from '../../../../core/models/company';
import { PublicReview, WorkSituation } from '../../../../core/models/review';
import { toId } from '../../../../shared/route-params';
import { PageState } from '../../../../shared/ui/page-state/page-state';
import { ReviewCard } from '../../../../shared/ui/review-card/review-card';
import { ReviewActions } from './review-actions';
import { complianceGroups, publicationLabel, publicReviewMeta } from './review-view';

const PAGE_SIZE = 10;

/** Filtros de RF5 que se guardan en la URL del perfil. */
export interface ReviewFilters {
  local?: number;
  cargo?: number;
  tipoContrato?: number;
  modalidad?: number;
  situacion?: WorkSituation;
  page: number;
}

type FilterName = Exclude<keyof ReviewFilters, 'page'>;

/** Convierte el parámetro de la URL en una situación válida. */
export function toSituation(value: unknown): WorkSituation | undefined {
  return value === 'ACTUAL' || value === 'ANTERIOR' ? value : undefined;
}

/**
 * Reseñas publicadas de una empresa, con los filtros de RF5 (local, cargo, contrato, modalidad y situación).
 * Los filtros viven en la URL del perfil, como en el directorio: «atrás» y los enlaces compartidos funcionan.
 */
@Component({
  selector: 'app-company-reviews',
  imports: [
    DecimalPipe,
    RouterLink,
    PageState,
    ReviewCard,
    ReviewActions,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCircleCheck,
    LucideCircleDot,
    LucideCircleX,
    LucideCircleQuestionMark,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-reviews.html',
  styleUrl: './company-reviews.css',
})
export class CompanyReviews {
  readonly company = input.required<CompanyDetail>();
  readonly filters = input.required<ReviewFilters>();

  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  protected readonly config = inject(CriteriaApi).configResource();
  protected readonly jobs = inject(JobsApi).allResource();
  protected readonly contractTypes = inject(ContractTypesApi).allResource();
  protected readonly workModes = inject(WorkModesApi).allResource();
  protected readonly reviews = inject(PublicReviewsApi).listResource(
    computed(() => ({ ...this.filters(), empresa: this.company().id, pageSize: PAGE_SIZE })),
  );

  /** Locales agrupados por ciudad, para el filtro de local. */
  protected readonly officeGroups = computed(() => {
    const groups = new Map<string, Office[]>();
    for (const office of this.company().locales) {
      const city = office.ciudad.nombre ?? 'Sin ciudad';
      groups.set(city, [...(groups.get(city) ?? []), office]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'es')).map(([ciudad, locales]) => ({ ciudad, locales }));
  });

  protected readonly hasFilters = computed(() => {
    const { page: _page, ...rest } = this.filters();
    return Object.values(rest).some((value) => value !== undefined);
  });

  protected readonly totalPages = computed(() => {
    if (!this.reviews.hasValue()) return 1;
    const { total, pageSize } = this.reviews.value();
    return Math.max(1, Math.ceil(total / pageSize));
  });

  protected readonly meta = publicReviewMeta;

  protected footer(review: PublicReview): string {
    return publicationLabel(review.mesPublicacion, this.locale);
  }

  protected compliance(review: PublicReview) {
    return this.config.hasValue() ? complianceGroups(review, this.config.value()) : [];
  }

  protected select(name: FilterName, value: string): void {
    const parsed = name === 'situacion' ? toSituation(value) : toId(value);
    this.navigate({ [name]: parsed ?? null, page: null });
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  protected clearFilters(): void {
    this.navigate({ local: null, cargo: null, tipoContrato: null, modalidad: null, situacion: null, page: null });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge', preserveFragment: false, fragment: 'resenas' });
  }
}

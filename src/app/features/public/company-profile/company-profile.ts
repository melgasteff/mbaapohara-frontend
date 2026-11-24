import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { LucidePencil } from '@lucide/angular';
import { CompaniesApi } from '../../../core/api/companies-api';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { OfficeSummary } from '../../../core/models/company';
import { SECTOR_GROUPS } from '../../../core/models/sector-group';
import { toId } from '../../../shared/route-params';
import { CompanySeal } from '../../../shared/ui/company-seal/company-seal';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { CompanyReviews } from './company-reviews/company-reviews';
import { focusReviews, officesByCity, officesText, ReviewFilters, toReviewOrder, toSituation } from './company-reviews/review-filters';
import { CompanySummaryBand } from './company-summary/company-summary';

/**
 * Perfil de empresa: resumen y locales (GET /companies/:id) y sus reseñas publicadas con los filtros de RF5
 * (GET /reviews, tarea 3.5). Los filtros llegan como parámetros de la URL.
 */
@Component({
  selector: 'app-company-profile',
  imports: [RouterLink, PageState, CompanySeal, CompanySummaryBand, CompanyReviews, LucidePencil],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './company-profile.css',
  templateUrl: './company-profile.html',
})
export class CompanyProfile {
  readonly id = input(undefined, { transform: toId });
  // Filtros de las reseñas (?local, cargo, tipoContrato, modalidad, situacion, orden, page).
  readonly local = input(undefined, { transform: toId });
  readonly cargo = input(undefined, { transform: toId });
  readonly tipoContrato = input(undefined, { transform: toId });
  readonly modalidad = input(undefined, { transform: toId });
  readonly situacion = input(undefined, { transform: toSituation });
  readonly orden = input('recientes' as const, { transform: toReviewOrder });
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  private readonly router = inject(Router);

  protected readonly reviewFilters = computed<ReviewFilters>(() => ({
    local: this.local(),
    cargo: this.cargo(),
    tipoContrato: this.tipoContrato(),
    modalidad: this.modalidad(),
    situacion: this.situacion(),
    orden: this.orden(),
    page: this.page(),
  }));

  protected readonly company = inject(CompaniesApi).detailResource(this.id);
  protected readonly config = inject(CriteriaApi).configResource();
  protected readonly words = computed(() => (this.config.hasValue() ? this.config.value().calificacionGeneral.palabras : {}));
  protected readonly groups = SECTOR_GROUPS;
  protected readonly officesText = officesText;

  protected readonly notFound = computed(() => {
    const error = this.company.error();
    return !this.id() || (error instanceof HttpErrorResponse && error.status === 404);
  });

  // value() lanza un error si el recurso falló: siempre preguntar antes con hasValue().
  protected readonly cityGroups = computed(() => officesByCity(this.company.hasValue() ? this.company.value().locales : []));

  constructor() {
    const title = inject(Title);
    effect(() => {
      if (this.company.hasValue()) title.setTitle(`${this.company.value().nombre} · Mbaapohara`);
    });
  }

  /** Filtra las reseñas por el local; tocarlo de nuevo quita el filtro. */
  protected toggleOffice(office: OfficeSummary): void {
    const local = this.local() === office.id ? null : office.id;
    this.router.navigate([], { queryParams: { local, page: null }, queryParamsHandling: 'merge', fragment: 'resenas' }).then(focusReviews);
  }
}

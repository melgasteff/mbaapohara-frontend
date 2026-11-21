import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideMapPin } from '@lucide/angular';
import { CompaniesApi } from '../../../core/api/companies-api';
import { Office } from '../../../core/models/company';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { toId } from '../../../shared/route-params';
import { CompanyReviews, ReviewFilters, toSituation } from './company-reviews/company-reviews';

interface CityGroup {
  ciudad: string;
  locales: Office[];
}

/**
 * Perfil de empresa: datos y locales (GET /companies/:id) y sus reseñas publicadas con los filtros de RF5
 * (GET /reviews, tarea 3.5). Los filtros llegan como parámetros de la URL.
 */
@Component({
  selector: 'app-company-profile',
  imports: [RouterLink, PageState, CompanyReviews, LucideArrowLeft, LucideMapPin],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './company-profile.css',
  templateUrl: './company-profile.html',
})
export class CompanyProfile {
  readonly id = input(undefined, { transform: toId });
  // Filtros de las reseñas (?local, cargo, tipoContrato, modalidad, situacion, page).
  readonly local = input(undefined, { transform: toId });
  readonly cargo = input(undefined, { transform: toId });
  readonly tipoContrato = input(undefined, { transform: toId });
  readonly modalidad = input(undefined, { transform: toId });
  readonly situacion = input(undefined, { transform: toSituation });
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  protected readonly reviewFilters = computed<ReviewFilters>(() => ({
    local: this.local(),
    cargo: this.cargo(),
    tipoContrato: this.tipoContrato(),
    modalidad: this.modalidad(),
    situacion: this.situacion(),
    page: this.page(),
  }));

  protected readonly company = inject(CompaniesApi).detailResource(this.id);

  protected readonly notFound = computed(() => {
    const error = this.company.error();
    return !this.id() || (error instanceof HttpErrorResponse && error.status === 404);
  });

  /** Locales agrupados por ciudad, en orden alfabético. */
  protected readonly cityGroups = computed<CityGroup[]>(() => {
    const groups = new Map<string, Office[]>();
    // value() lanza un error si el recurso falló: siempre preguntar antes con hasValue().
    const locales = this.company.hasValue() ? this.company.value().locales : [];
    for (const office of locales) {
      const ciudad = office.ciudad.nombre ?? 'Sin ciudad';
      groups.set(ciudad, [...(groups.get(ciudad) ?? []), office]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([ciudad, locales]) => ({ ciudad, locales }));
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      if (this.company.hasValue()) title.setTitle(`${this.company.value().nombre} · Mbaapohara`);
    });
  }
}

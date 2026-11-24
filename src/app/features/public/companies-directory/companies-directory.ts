import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideX } from '@lucide/angular';
import { CitiesApi } from '../../../core/api/cities-api';
import { CompaniesApi } from '../../../core/api/companies-api';
import { DepartmentsApi } from '../../../core/api/departments-api';
import { CompanyFacets, CompanySummary } from '../../../core/models/company';
import { Page } from '../../../core/models/page';
import { SECTOR_GROUPS, SectorGroup } from '../../../core/models/sector-group';
import { CompanyRow } from '../../../shared/ui/company-row/company-row';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Pager } from '../../../shared/ui/pager/pager';
import { SentenceFilter } from '../../../shared/ui/sentence-filter/sentence-filter';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { toId } from '../../../shared/route-params';
import {
  DirectoryState, groupOptions, GROUPS, hasFilters, placeOptions, placeParams, placeValue, PlaceValue, reviewOptions, toFilters, toGroup, toOrder, toReviews,
} from './directory-filters';

const PAGE_SIZE = 10;

/**
 * Directorio de empresas. Los filtros viven en la URL (q, grupo, departamento, ciudad, resenas, orden y page), así el
 * buscador del encabezado, el botón «atrás» y los enlaces compartidos muestran el mismo resultado.
 */
@Component({
  selector: 'app-companies-directory',
  imports: [DecimalPipe, RouterLink, CompanyRow, PageState, Pager, SentenceFilter, LucideArrowRight, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './companies-directory.css',
  templateUrl: './companies-directory.html',
})
export class CompaniesDirectory {
  private readonly router = inject(Router);

  // Parámetros de la URL (withComponentInputBinding).
  readonly q = input<string | undefined>();
  readonly grupo = input(undefined, { transform: toGroup });
  readonly departamento = input(undefined, { transform: toId });
  readonly ciudad = input(undefined, { transform: toId });
  readonly resenas = input(undefined, { transform: toReviews });
  readonly orden = input('resenas' as const, { transform: toOrder });
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  protected readonly state = computed<DirectoryState>(() => ({
    q: this.q()?.trim() || undefined,
    grupo: this.grupo(),
    departamento: this.departamento(),
    ciudad: this.ciudad(),
    resenas: this.resenas(),
  }));
  private readonly filters = computed(() => toFilters(this.state()));
  protected readonly active = computed(() => hasFilters(this.state()));

  private readonly api = inject(CompaniesApi);
  private readonly departments = inject(DepartmentsApi).allResource();
  private readonly city = inject(CitiesApi).detailResource(this.ciudad);
  protected readonly companies = this.api.listResource(
    computed(() => ({ ...this.filters(), orden: this.orden(), page: this.page(), pageSize: PAGE_SIZE })),
  );
  private readonly facetsResource = this.api.facetsResource(this.filters);

  protected readonly facets = keepWhileLoading<CompanyFacets>(this.facetsResource);
  protected readonly result = keepWhileLoading<Page<CompanySummary>>(this.companies);

  protected readonly groupOptions = computed(() => groupOptions(this.facets()));
  protected readonly reviewOptions = computed(() => reviewOptions(this.facets()));
  protected readonly place = computed(() => placeValue(this.state()));
  protected readonly placeOptions = computed(() =>
    placeOptions(
      this.state(),
      this.facets(),
      this.departments.hasValue() ? this.departments.value().data : [],
      this.city.hasValue() ? this.city.value() : undefined,
    ),
  );
  protected readonly placeText = computed(() => this.placeOptions().find((option) => option.valor === this.place())?.etiqueta ?? 'todo el país');
  protected readonly cities = computed(() => this.facets()?.ciudades.opciones.slice(0, 5) ?? []);

  /** Fichas de rubro: las mismas opciones que la frase, con ilustración. */
  protected readonly tiles = computed(() => {
    const count = new Map(this.facets()?.grupos.opciones.map((option) => [option.grupo, option.cantidad]));
    return GROUPS.map((group) => ({ group, ...SECTOR_GROUPS[group], count: count.get(group) }));
  });

  protected selectGroup(grupo: SectorGroup | null): void {
    this.navigate({ grupo, page: null });
  }

  protected selectPlace(value: PlaceValue | null): void {
    this.navigate({ ...placeParams(value), page: null });
  }

  protected selectReviews(resenas: string | null): void {
    this.navigate({ resenas, page: null });
  }

  protected selectOrder(value: string): void {
    const orden = toOrder(value);
    this.navigate({ orden: orden === 'resenas' ? null : orden, page: null });
  }

  protected clearSearch(): void {
    this.navigate({ q: null, page: null });
  }

  protected clearFilters(): void {
    this.navigate({ q: null, grupo: null, departamento: null, ciudad: null, resenas: null, page: null });
  }

  /** Reintenta la lista y, si también fallaron, los conteos. */
  protected reload(): void {
    this.companies.reload();
    if (this.facetsResource.error()) this.facetsResource.reload();
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}

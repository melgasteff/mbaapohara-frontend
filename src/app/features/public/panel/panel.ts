import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CitiesApi } from '../../../core/api/cities-api';
import { DepartmentsApi } from '../../../core/api/departments-api';
import { InsightsApi } from '../../../core/api/insights-api';
import { Indicator, Insights } from '../../../core/models/insights';
import { SectorGroup } from '../../../core/models/sector-group';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { toId } from '../../../shared/route-params';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { SentenceFilter } from '../../../shared/ui/sentence-filter/sentence-filter';
import { PlaceValue, placeParams, toGroup } from '../companies-directory/directory-filters';
import { ANSWERS, groupOptions, indicatorText, placeOptions, segments } from './panel-view';

/**
 * Panel de indicadores (3.6, RF6). Por categoría y por criterio: Sí, En parte y No, y el % de «Sí» sin contar «No sé»
 * (R9). Los filtros viven en la URL, como en el directorio. Un valor aparece desde 3 reseñas: lo decide la API.
 */
@Component({
  selector: 'app-panel',
  imports: [DecimalPipe, RouterLink, PageState, SentenceFilter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './panel.css',
  templateUrl: './panel.html',
})
export class Panel {
  private readonly router = inject(Router);

  // Parámetros de la URL (withComponentInputBinding).
  readonly grupo = input(undefined, { transform: toGroup });
  readonly departamento = input(undefined, { transform: toId });
  readonly ciudad = input(undefined, { transform: toId });

  private readonly filters = computed(() => ({ grupo: this.grupo(), departamento: this.departamento(), ciudad: this.ciudad() }));
  protected readonly insightsResource = inject(InsightsApi).resource(this.filters);
  protected readonly insights = keepWhileLoading<Insights>(this.insightsResource);

  private readonly departments = inject(DepartmentsApi).allResource();
  private readonly city = inject(CitiesApi).detailResource(this.ciudad);

  protected readonly answers = ANSWERS;
  protected readonly groupOptions = groupOptions();
  protected readonly place = computed<PlaceValue | null>(() => {
    const ciudad = this.ciudad();
    if (ciudad) return `c${ciudad}`;
    const departamento = this.departamento();
    return departamento ? `d${departamento}` : null;
  });
  protected readonly placeOptions = computed(() =>
    placeOptions(
      this.departamento(),
      this.ciudad(),
      this.departments.hasValue() ? this.departments.value().data : [],
      this.city.hasValue() ? this.city.value() : undefined,
    ),
  );
  protected readonly filtered = computed(() => !!(this.grupo() || this.departamento() || this.ciudad()));

  protected readonly segments = segments;
  protected readonly text = indicatorText;

  protected selectGroup(grupo: SectorGroup | null): void {
    this.navigate({ grupo });
  }

  protected selectPlace(value: PlaceValue | null): void {
    this.navigate(placeParams(value));
  }

  protected clearFilters(): void {
    this.navigate({ grupo: null, departamento: null, ciudad: null });
  }

  /** Nombre accesible de una barra: la frase con todos los números. */
  protected label(name: string, indicator: Indicator): string {
    return `${name}: ${indicator.porcentajeSi} % de «Sí». ${indicatorText(indicator)}`;
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}

import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight, LucideSearch } from '@lucide/angular';
import { CitiesApi } from '../../../core/api/cities-api';
import { CompaniesApi } from '../../../core/api/companies-api';
import { DepartmentsApi } from '../../../core/api/departments-api';
import { CompanyRow } from '../../../shared/ui/company-row/company-row';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { toId } from '../../../shared/route-params';

const PAGE_SIZE = 12;

/**
 * Directorio de empresas. Los filtros viven en la URL (?q, departamento, ciudad, page), así el buscador del
 * encabezado, el botón «atrás» y los enlaces compartidos muestran el mismo resultado.
 */
@Component({
  selector: 'app-companies-directory',
  imports: [DecimalPipe, CompanyRow, PageState, LucideSearch, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './companies-directory.css',
  templateUrl: './companies-directory.html',
})
export class CompaniesDirectory {
  private readonly router = inject(Router);

  // Parámetros de la URL (withComponentInputBinding).
  readonly q = input<string | undefined>();
  readonly departamento = input(undefined, { transform: toId });
  readonly ciudad = input(undefined, { transform: toId });
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  protected readonly departments = inject(DepartmentsApi).allResource();
  protected readonly cities = inject(CitiesApi).byDepartmentResource(this.departamento);
  protected readonly companies = inject(CompaniesApi).listResource(
    computed(() => ({
      q: this.q()?.trim() || undefined,
      ciudad: this.ciudad(),
      page: this.page(),
      pageSize: PAGE_SIZE,
    })),
  );

  protected readonly totalPages = computed(() => {
    if (!this.companies.hasValue()) return 1;
    const { total, pageSize } = this.companies.value();
    return Math.max(1, Math.ceil(total / pageSize));
  });

  protected readonly hasFilters = computed(() => !!(this.q() || this.ciudad()));

  protected search(event: Event, term: string): void {
    event.preventDefault();
    this.navigate({ q: term.trim() || null, page: null });
  }

  protected selectDepartment(value: string): void {
    this.navigate({ departamento: toId(value) ?? null, ciudad: null, page: null });
  }

  protected selectCity(value: string): void {
    this.navigate({ ciudad: toId(value) ?? null, page: null });
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  protected clearFilters(): void {
    this.router.navigate(['/empresas']);
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}

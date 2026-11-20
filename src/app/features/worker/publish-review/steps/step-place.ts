import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideCircleAlert, LucideSearch } from '@lucide/angular';
import { CompaniesApi } from '../../../../core/api/companies-api';
import { CompaniesQuery, Company, Office } from '../../../../core/models/company';
import { PageState } from '../../../../shared/ui/page-state/page-state';
import { ReviewForm } from '../review-form';

const RESULTS = 8;

/** Paso 1: buscar la empresa (datos reales) y elegir el local. */
@Component({
  selector: 'app-step-place',
  imports: [ReactiveFormsModule, PageState, LucideSearch, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  template: `
    <form class="search" role="search" (submit)="search($event, term.value)">
      <label class="mb-search">
        <svg lucideSearch [size]="20"></svg>
        <span class="visually-hidden">Nombre de la empresa</span>
        <input #term type="search" placeholder="Buscá la empresa" autocomplete="off" />
      </label>
      <button type="submit" class="mb-btn mb-btn-secondary">Buscar</button>
    </form>

    <fieldset>
      <legend class="legend">Empresa</legend>
      @if (companies.error()) {
        <app-page-state kind="error" title="No pudimos cargar las empresas." (retry)="companies.reload()" />
      } @else if (companies.hasValue()) {
        @if (companies.value().data.length === 0) {
          <p class="body-sm">No encontramos empresas con ese nombre. Probá con otra palabra.</p>
        } @else {
          <ul class="options">
            @for (company of companies.value().data; track company.id) {
              <li>
                <label class="option">
                  <input
                    type="radio"
                    name="empresa"
                    [checked]="company.id === group().controls.empresa.value?.id"
                    (change)="selectCompany(company)"
                  />
                  <span>
                    {{ company.nombre }}
                    @if (company.rubro.nombre) { <small class="body-sm">{{ company.rubro.nombre }}</small> }
                  </span>
                </label>
              </li>
            }
          </ul>
        }
      } @else {
        <app-page-state kind="loading" message="Buscando empresas…" />
      }
      @if (show('empresa')) {
        <p class="mb-help error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí la empresa.</p>
      }
    </fieldset>

    @if (companyId()) {
      <fieldset>
        <legend class="legend">Local donde trabajás o trabajaste</legend>
        @if (detail.error()) {
          <app-page-state kind="error" title="No pudimos cargar los locales." (retry)="detail.reload()" />
        } @else if (detail.hasValue()) {
          @if (detail.value().locales.length === 0) {
            <p class="body-sm">Esta empresa todavía no tiene locales cargados.</p>
          } @else {
            <ul class="options">
              @for (office of detail.value().locales; track office.id) {
                <li>
                  <label class="option">
                    <input
                      type="radio"
                      name="local"
                      [checked]="office.id === group().controls.local.value?.id"
                      (change)="selectOffice(office)"
                    />
                    <span>
                      {{ office.nombre }}
                      @if (office.ciudad.nombre) { <small class="body-sm">{{ office.ciudad.nombre }}</small> }
                    </span>
                  </label>
                </li>
              }
            </ul>
          }
        } @else {
          <app-page-state kind="loading" message="Cargando locales…" />
        }
        @if (show('local')) {
          <p class="mb-help error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el local.</p>
        }
      </fieldset>
    }
  `,
  styles: `
    .search { display: flex; gap: var(--space-2); align-items: center; max-width: 560px; }
    .search .mb-search { flex: 1; max-width: none; }
  `,
})
export class StepPlace implements OnInit {
  readonly group = input.required<ReviewForm['controls']['lugar']>();
  readonly showErrors = input(false);

  private readonly api = inject(CompaniesApi);
  private readonly query = signal<CompaniesQuery>({ pageSize: RESULTS });
  protected readonly companies = this.api.listResource(this.query);
  protected readonly companyId = signal<number | undefined>(undefined);
  protected readonly detail = this.api.detailResource(this.companyId);

  ngOnInit(): void {
    this.companyId.set(this.group().controls.empresa.value?.id);
  }

  protected search(event: Event, term: string): void {
    event.preventDefault();
    this.query.set({ q: term.trim() || undefined, pageSize: RESULTS });
  }

  protected selectCompany(company: Company): void {
    this.group().controls.empresa.setValue(company);
    this.companyId.set(company.id);
  }

  protected selectOffice(office: Office): void {
    this.group().controls.local.setValue(office);
  }

  protected show(name: 'empresa' | 'local'): boolean {
    const control = this.group().controls[name];
    return control.invalid && (control.touched || this.showErrors());
  }
}

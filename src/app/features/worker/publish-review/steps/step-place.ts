import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideCircleAlert, LucideSearch } from '@lucide/angular';
import { debounceTime, Subject } from 'rxjs';
import { CompaniesApi } from '../../../../core/api/companies-api';
import { CompaniesQuery, Company, Office } from '../../../../core/models/company';
import { keepWhileLoading } from '../../../../shared/keep-while-loading';
import { CompanySeal } from '../../../../shared/ui/company-seal/company-seal';
import { PageState } from '../../../../shared/ui/page-state/page-state';
import { ReviewForm } from '../review-form';

const RESULTS = 8;
const TYPING_MS = 300;

/** Paso 1: buscar la empresa y elegir el local. Con un solo local, queda elegido. */
@Component({
  selector: 'app-step-place',
  imports: [PageState, CompanySeal, LucideSearch, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  styles: `
    .search { display: flex; flex-direction: column; gap: var(--space-2); }
    .search .mb-search { flex: none; max-width: none; height: 52px; padding: 0 14px; }
    .search input { font-size: 17px; height: 100%; }
    ul { list-style: none; margin: 0; padding: 0; }
    .rows { border-top: 1px solid var(--linea); }
    .row { position: relative; display: flex; align-items: center; gap: 14px; padding: 14px var(--space-3); border-bottom: 1px solid var(--linea); cursor: pointer; transition: background-color .15s ease; }
    .row:hover, .row.is-checked { background: var(--blanco); }
    .row.is-checked { box-shadow: inset 3px 0 0 var(--azul-texto); }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
    .card {
      position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); height: 100%; box-sizing: border-box;
      padding: var(--space-4); border: 2px solid var(--linea); border-radius: var(--radio-md); background: var(--blanco); cursor: pointer;
    }
    .card.is-checked { border-color: var(--azul-texto); }
    label:has(input:focus-visible) { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    .info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .info strong { font-size: 17px; line-height: 24px; }
    .card .info strong { font-size: 16px; }
    .info small { font-size: 14px; line-height: 20px; color: var(--noche-suave); }
    .none { margin: 0; padding: var(--space-4) 0; color: var(--noche-suave); }
    .where { margin: 0 0 10px; font-size: 22px; line-height: 28px; font-weight: 700; }
  `,
  template: `
    <div class="search">
      <label class="legend" for="empresa-q">Empresa</label>
      <div class="mb-search">
        <svg lucideSearch [size]="20" aria-hidden="true"></svg>
        <input #term id="empresa-q" type="search" placeholder="Escribí el nombre de la empresa" autocomplete="off" (input)="typed.next(term.value)" />
      </div>
    </div>

    <div>
      <p class="visually-hidden" role="status">{{ status() }}</p>
      @if (companies.error()) {
        <app-page-state kind="error" title="No pudimos cargar las empresas." (retry)="companies.reload()" />
      } @else if (found()) {
        <ul class="rows" role="radiogroup" aria-label="Resultados" [attr.aria-describedby]="show('empresa') ? 'empresa-error' : null">
          @for (company of rows(); track company.id) {
            <li role="presentation">
              <label class="row" [class.is-checked]="company.id === companyId()">
                <input class="visually-hidden" type="radio" name="empresa" [checked]="company.id === companyId()" (change)="selectCompany(company)" />
                <app-company-seal [name]="company.nombre" [group]="company.rubro.grupo" [size]="36" />
                <span class="info">
                  <strong>{{ company.nombre }}</strong>
                  @if (company.rubro.nombre) { <small>{{ company.rubro.nombre }}</small> }
                </span>
                <span class="mb-radio" aria-hidden="true"></span>
              </label>
            </li>
          }
        </ul>
        @if (found()!.length === 0) { <p class="none">No encontramos empresas con ese nombre. Probá con otra palabra.</p> }
      } @else {
        <app-page-state kind="loading" message="Buscando empresas…" />
      }
      @if (show('empresa')) {
        <p class="mb-help error" id="empresa-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí la empresa.</p>
      }
    </div>

    @if (companyId()) {
      <div class="mb-entra">
        <h2 class="where" id="local-titulo">¿En qué local?</h2>
        @if (detail.error()) {
          <app-page-state kind="error" title="No pudimos cargar los locales." (retry)="detail.reload()" />
        } @else if (detail.hasValue()) {
          @if (detail.value().locales.length === 0) {
            <p class="none">Esta empresa todavía no tiene locales cargados.</p>
          } @else {
            <ul class="cards" role="radiogroup" aria-labelledby="local-titulo" [attr.aria-describedby]="show('local') ? 'local-error' : null">
              @for (office of detail.value().locales; track office.id) {
                <li role="presentation">
                  <label class="card" [class.is-checked]="office.id === officeId()">
                    <input class="visually-hidden" type="radio" name="local" [checked]="office.id === officeId()" (change)="selectOffice(office)" />
                    <span class="info">
                      <strong>{{ office.nombre }}</strong>
                      @if (office.ciudad.nombre) { <small>{{ office.ciudad.nombre }}</small> }
                    </span>
                    <span class="mb-radio" aria-hidden="true"></span>
                  </label>
                </li>
              }
            </ul>
          }
        } @else {
          <app-page-state kind="loading" message="Cargando locales…" />
        }
        @if (show('local')) {
          <p class="mb-help error" id="local-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el local.</p>
        }
      </div>
    }
  `,
})
export class StepPlace {
  readonly group = input.required<ReviewForm['controls']['lugar']>();
  readonly showErrors = input(false);
  /** Empresa y local elegidos, como los tiene el formulario. */
  readonly company = input<Company | null>(null);
  readonly office = input<Office | null>(null);

  private readonly api = inject(CompaniesApi);
  private readonly query = signal<CompaniesQuery>({ pageSize: RESULTS });
  protected readonly typed = new Subject<string>();
  protected readonly companies = this.api.listResource(this.query);
  protected readonly companyId = computed(() => this.company()?.id);
  protected readonly officeId = computed(() => this.office()?.id);
  protected readonly detail = this.api.detailResource(this.companyId);

  private readonly page = keepWhileLoading(this.companies);
  protected readonly found = computed(() => this.page()?.data);
  /** La empresa elegida está siempre en la lista, aunque la búsqueda ya no la encuentre. */
  protected readonly rows = computed<Company[]>(() => {
    const found = this.found() ?? [];
    const chosen = this.company();
    return chosen && !found.some((item) => item.id === chosen.id) ? [chosen, ...found] : found;
  });
  protected readonly status = computed(() => {
    const found = this.found();
    if (!found) return '';
    return found.length === 1 ? '1 empresa' : `${found.length} empresas`;
  });

  constructor() {
    this.typed
      .pipe(debounceTime(TYPING_MS), takeUntilDestroyed())
      .subscribe((term) => this.query.set({ q: term.trim() || undefined, pageSize: RESULTS }));
    effect(() => {
      if (!this.detail.hasValue()) return;
      const { id, locales } = this.detail.value();
      untracked(() => {
        if (locales.length === 1 && id === this.companyId() && !this.officeId()) this.selectOffice(locales[0]);
      });
    });
  }

  protected selectCompany(company: Company): void {
    this.group().controls.empresa.setValue(company);
  }

  protected selectOffice(office: Office): void {
    this.group().controls.local.setValue(office);
  }

  protected show(name: 'empresa' | 'local'): boolean {
    return this.showErrors() && this.group().controls[name].invalid;
  }
}

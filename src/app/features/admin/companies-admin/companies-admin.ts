import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucidePlus, LucideSearch } from '@lucide/angular';
import { AdminCounts } from '../../../core/api/admin-counts';
import { CompaniesAdminApi } from '../../../core/api/companies-admin-api';
import { Company, ProposalStatus } from '../../../core/models/company';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { toId } from '../../../shared/route-params';
import { CompanySeal } from '../../../shared/ui/company-seal/company-seal';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Pager } from '../../../shared/ui/pager/pager';
import { TabItem, Tabs } from '../../../shared/ui/tabs/tabs';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { OfficesPending } from '../offices-pending/offices-pending';

const PAGE_SIZE = 20;
type CompanyTab = ProposalStatus | 'locales';
const TABS: { valor: CompanyTab; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'aprobada', etiqueta: 'Aprobadas' },
  { valor: 'rechazada', etiqueta: 'Rechazadas' },
  { valor: 'locales', etiqueta: 'Locales pendientes' },
];
const EMPTY: Record<ProposalStatus, string> = {
  pendiente: 'No hay empresas pendientes de revisión',
  aprobada: 'No hay empresas aprobadas',
  rechazada: 'No hay empresas rechazadas',
};

/** Empresas por estado (aprobar, rechazar, gestionar, eliminar) y locales pendientes. La pestaña y la búsqueda van en la URL. */
@Component({
  selector: 'app-companies-admin',
  imports: [RouterLink, CompanySeal, InlineConfirm, PageState, Pager, Tabs, AdminNotice, OfficesPending, LucidePlus, LucideSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <div class="head">
      <h1 class="title" tabindex="-1">Empresas</h1>
      <a class="mb-btn mb-btn-primary" routerLink="/admin/empresas/nueva"><svg lucidePlus [size]="18" aria-hidden="true"></svg>Nueva empresa</a>
    </div>
    <app-tabs label="Estado" panelId="empresas" [tabs]="tabs()" [value]="tab()" (valueChange)="select($event)" />

    <div class="panel" id="empresas" role="tabpanel" [attr.aria-labelledby]="'empresas-' + tab()">
      @if (tab() === 'locales') {
        <app-offices-pending />
      } @else {
        <app-admin-notice [notice]="actions.notice()" />
        <form class="toolbar" role="search" (submit)="search($event, term.value)">
          <label class="mb-search">
            <svg lucideSearch [size]="20" aria-hidden="true"></svg>
            <span class="visually-hidden">Nombre de la empresa</span>
            <input #term type="search" [value]="q() ?? ''" placeholder="Buscá por nombre" />
          </label>
          <button type="submit" class="mb-btn mb-btn-secondary">Buscar</button>
        </form>

        @if (companies.error()) {
          <app-page-state kind="error" title="No pudimos cargar las empresas." (retry)="companies.reload()" />
        } @else if (data(); as result) {
          @if (result.total === 0) {
            <app-page-state kind="empty" [title]="emptyText()" />
          } @else {
            <ul class="rows">
              @for (company of result.data; track company.id) {
                <li>
                  <div class="row">
                    <app-company-seal [name]="company.nombre" [group]="company.rubro.grupo" [size]="36" />
                    <div class="row__main">
                      <h2 class="row__title">{{ company.nombre }}</h2>
                      @if (company.rubro.nombre; as sector) { <p class="small">{{ sector }}</p> }
                    </div>
                    <div class="row__actions">
                      @if (company.estado === 'pendiente') {
                        <button type="button" class="mb-btn mb-btn-primary" (click)="approve(company)">
                          {{ actions.busy() === 'aprobar-' + company.id ? 'Aprobando…' : 'Aprobar' }}<span class="visually-hidden"> {{ company.nombre }}</span>
                        </button>
                        <button type="button" class="mb-btn mb-btn-borrar" [attr.data-accion]="'rechazar-' + company.id" (click)="actions.ask('rechazar-' + company.id)">
                          Rechazar<span class="visually-hidden"> {{ company.nombre }}</span>
                        </button>
                      } @else {
                        @if (company.estado === 'aprobada') {
                          <a class="mb-btn mb-btn-secondary" [routerLink]="['/admin/empresas', company.id]">Gestionar<span class="visually-hidden"> {{ company.nombre }}</span></a>
                        }
                        <button type="button" class="mb-btn mb-btn-texto delete" [attr.data-accion]="'eliminar-' + company.id" (click)="actions.ask('eliminar-' + company.id)">
                          Eliminar<span class="visually-hidden"> {{ company.nombre }}</span>
                        </button>
                      }
                    </div>
                  </div>
                  @if (actions.confirming() === 'rechazar-' + company.id) {
                    <app-inline-confirm
                      confirmLabel="Sí, rechazar"
                      [message]="'¿Rechazar «' + company.nombre + '»? También se rechazan sus locales pendientes.'"
                      (confirmed)="reject(company)"
                      (cancelled)="actions.cancel()"
                    />
                  } @else if (actions.confirming() === 'eliminar-' + company.id) {
                    <app-inline-confirm
                      confirmLabel="Sí, eliminar"
                      [message]="'¿Eliminar «' + company.nombre + '»? No se puede deshacer.'"
                      (confirmed)="remove(company)"
                      (cancelled)="actions.cancel()"
                    />
                  }
                </li>
              }
            </ul>
            <app-pager label="Páginas de empresas" [page]="page()" [pageSize]="result.pageSize" [total]="result.total" (pageChange)="goToPage($event)" />
          }
        } @else {
          <app-page-state kind="loading" skeleton="row" message="Cargando empresas…" />
        }
      }
    </div>
  `,
  styles: `
    .panel { display: flex; flex-direction: column; gap: 20px; }
    .delete { color: var(--naranja-texto); }
  `,
})
export class CompaniesAdmin {
  private readonly api = inject(CompaniesAdminApi);
  private readonly router = inject(Router);
  protected readonly actions = inject(AdminActions);

  readonly estado = input<string>();
  readonly q = input<string>();
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  protected readonly tab = computed<CompanyTab>(() => TABS.find((tab) => tab.valor === this.estado())?.valor ?? 'pendiente');
  private readonly currentState = computed<ProposalStatus>(() => {
    const tab = this.tab();
    return tab === 'locales' ? 'pendiente' : tab;
  });
  private readonly pendingCompanies = inject(AdminCounts).count('empresas');
  private readonly pendingOffices = inject(AdminCounts).count('locales');
  protected readonly tabs = computed<TabItem<CompanyTab>[]>(() =>
    TABS.map((tab) => ({ ...tab, cantidad: tab.valor === 'pendiente' ? this.pendingCompanies() : tab.valor === 'locales' ? this.pendingOffices() : undefined })),
  );
  protected readonly companies = this.api.listResource(
    computed(() => ({ estado: this.currentState(), q: this.q()?.trim() || undefined, page: this.page(), pageSize: PAGE_SIZE })),
  );
  private readonly kept = keepWhileLoading(this.companies);
  /** Al cambiar de pestaña, las filas de la anterior no se muestran con las acciones de la nueva. */
  protected readonly data = computed(() => {
    const page = this.kept();
    if (page?.data.length === 0 && !this.companies.hasValue()) return undefined;
    return page?.data.every((company) => company.estado === this.currentState()) ? page : undefined;
  });
  protected readonly emptyText = computed(() => (this.q()?.trim() ? 'No encontramos empresas con ese nombre' : EMPTY[this.currentState()]));

  protected select(tab: CompanyTab): void {
    this.actions.notice.set(null);
    this.actions.confirming.set(null);
    this.router.navigate([], { queryParams: { estado: tab === 'pendiente' ? null : tab, page: null }, queryParamsHandling: 'merge' });
  }

  protected search(event: Event, term: string): void {
    event.preventDefault();
    this.router.navigate([], { queryParams: { q: term.trim() || null, page: null }, queryParamsHandling: 'merge' });
  }

  protected goToPage(page: number): void {
    this.router.navigate([], { queryParams: { page: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected approve(company: Company): void {
    this.run(`aprobar-${company.id}`, this.api.approve(company.id), `Aprobaste «${company.nombre}» y sus locales pendientes.`);
  }

  protected reject(company: Company): void {
    this.run(`rechazar-${company.id}`, this.api.reject(company.id), `Rechazaste «${company.nombre}».`);
  }

  protected remove(company: Company): void {
    this.run(`eliminar-${company.id}`, this.api.remove(company.id), `Eliminaste «${company.nombre}».`);
  }

  private run(key: string, action: ReturnType<CompaniesAdminApi['approve']> | ReturnType<CompaniesAdminApi['remove']>, success: string): void {
    this.actions.run(key, action, success, {
      done: () => {
        // Si era la única de la página, se vuelve a la anterior.
        if (this.data()?.data.length === 1 && this.page() > 1) this.goToPage(this.page() - 1);
        else this.companies.reload();
        this.actions.focus('h1');
      },
    });
  }
}

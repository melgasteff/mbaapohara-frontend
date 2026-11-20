import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideCircleCheck, LucideSearch } from '@lucide/angular';
import { Observable } from 'rxjs';
import { CompaniesAdminApi } from '../../../core/api/companies-admin-api';
import { Company, ProposalStatus } from '../../../core/models/company';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { toId } from '../../../shared/route-params';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice, STATUS } from '../status';

const PAGE_SIZE = 20;
const STATES: ProposalStatus[] = ['pendiente', 'aprobada', 'rechazada'];

/** Empresas por estado: aprobar o rechazar las pendientes, gestionar las aprobadas, eliminar. */
@Component({
  selector: 'app-companies-admin',
  imports: [RouterLink, PageState, LucideSearch, LucideCircleCheck, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Empresas</h1>

    <div class="toolbar">
      <nav class="tabs" aria-label="Estado">
        @for (state of states; track state) {
          <a
            class="mb-chip"
            routerLink="/admin/empresas"
            [queryParams]="{ estado: state }"
            [attr.aria-current]="state === currentState() ? 'page' : null"
          >{{ status[state].label }}s</a>
        }
      </nav>
      <form role="search" (submit)="search($event, term.value)">
        <label class="mb-search">
          <svg lucideSearch [size]="20"></svg>
          <span class="visually-hidden">Nombre de la empresa</span>
          <input #term type="search" [value]="q() ?? ''" placeholder="Buscá por nombre" />
        </label>
        <button type="submit" class="mb-btn mb-btn-secondary">Buscar</button>
      </form>
    </div>

    <div role="status">
      @if (notice(); as n) {
        <p class="notice body-sm" [class.notice--ok]="n.kind === 'ok'" [class.notice--error]="n.kind === 'error'">
          @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          {{ n.text }}
        </p>
      }
    </div>

    @if (companies.error()) {
      <app-page-state kind="error" title="No pudimos cargar las empresas." (retry)="companies.reload()" />
    } @else if (companies.hasValue()) {
      @let result = companies.value();
      @if (result.total === 0) {
        <app-page-state kind="empty" [title]="emptyText()" />
      } @else {
        <ul class="rows">
          @for (company of result.data; track company.id) {
            <li class="row">
              <div class="row__main">
                <span class="row__title">{{ company.nombre }}</span>
                <span class="mb-meta"><span>{{ company.rubro.nombre }}</span></span>
              </div>
              <span [class]="status[company.estado].tag">{{ status[company.estado].label }}</span>
              <div class="row__actions">
                @if (company.estado === 'pendiente') {
                  <button type="button" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === company.id" (click)="approve(company)">Aprobar</button>
                  <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="busy() === company.id" (click)="reject(company)">Rechazar</button>
                }
                @if (company.estado === 'aprobada') {
                  <a class="mb-btn mb-btn-secondary mb-btn-sm" [routerLink]="['/admin/empresas', company.id]">Gestionar</a>
                }
                @if (company.estado !== 'pendiente') {
                  <button type="button" class="mb-btn mb-btn-ghost mb-btn-sm" [disabled]="busy() === company.id" (click)="remove(company)">Eliminar</button>
                }
              </div>
            </li>
          }
        </ul>
        @if (totalPages() > 1) {
          <nav class="pager" aria-label="Páginas">
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() <= 1" (click)="goToPage(page() - 1)">Anterior</button>
            <span class="body-sm">Página {{ page() }} de {{ totalPages() }}</span>
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() >= totalPages()" (click)="goToPage(page() + 1)">Siguiente</button>
          </nav>
        }
      }
    } @else {
      <app-page-state kind="loading" message="Cargando empresas…" />
    }
  `,
})
export class CompaniesAdmin {
  private readonly api = inject(CompaniesAdminApi);
  private readonly router = inject(Router);

  readonly estado = input<string>();
  readonly q = input<string>();
  readonly page = input(1, { transform: (value: unknown) => toId(value) ?? 1 });

  protected readonly states = STATES;
  protected readonly status = STATUS;
  protected readonly currentState = computed<ProposalStatus>(() =>
    STATES.includes(this.estado() as ProposalStatus) ? (this.estado() as ProposalStatus) : 'pendiente',
  );
  protected readonly companies = this.api.listResource(
    computed(() => ({ estado: this.currentState(), q: this.q()?.trim() || undefined, page: this.page(), pageSize: PAGE_SIZE })),
  );
  protected readonly totalPages = computed(() =>
    this.companies.hasValue() ? Math.max(1, Math.ceil(this.companies.value().total / PAGE_SIZE)) : 1,
  );
  protected readonly emptyText = computed(() =>
    this.currentState() === 'pendiente' ? 'No hay empresas pendientes de revisión.' : `No hay empresas ${STATUS[this.currentState()].label.toLowerCase()}s.`,
  );
  protected readonly busy = signal<number | null>(null);
  protected readonly notice = signal<Notice | null>(null);

  protected search(event: Event, term: string): void {
    event.preventDefault();
    this.router.navigate([], { queryParams: { q: term.trim() || null, page: null }, queryParamsHandling: 'merge' });
  }

  protected goToPage(page: number): void {
    this.router.navigate([], { queryParams: { page: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected approve(company: Company): void {
    this.run(company, this.api.approve(company.id), `Aprobaste «${company.nombre}» y sus locales pendientes.`);
  }

  protected reject(company: Company): void {
    if (!confirmAction(`¿Rechazar «${company.nombre}»? También se rechazan sus locales pendientes.`)) return;
    this.run(company, this.api.reject(company.id), `Rechazaste «${company.nombre}».`);
  }

  protected remove(company: Company): void {
    if (!confirmAction(`¿Eliminar «${company.nombre}»? No se puede deshacer.`)) return;
    this.run(company, this.api.remove(company.id), `Eliminaste «${company.nombre}».`);
  }

  private run(company: Company, action: Observable<unknown>, success: string): void {
    this.busy.set(company.id);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.companies.reload();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }
}

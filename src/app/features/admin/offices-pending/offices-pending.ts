import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { Observable } from 'rxjs';
import { OfficesAdminApi } from '../../../core/api/offices-admin-api';
import { Office } from '../../../core/models/company';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice } from '../status';

/** Cola de locales propuestos para empresas ya existentes. */
@Component({
  selector: 'app-offices-pending',
  imports: [PageState, LucideCircleCheck, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Locales pendientes</h1>
    <p class="body">Locales propuestos para empresas. Un local se aprueba solo si su empresa ya está aprobada.</p>

    <div role="status">
      @if (notice(); as n) {
        <p class="notice body-sm" [class.notice--ok]="n.kind === 'ok'" [class.notice--error]="n.kind === 'error'">
          @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          {{ n.text }}
        </p>
      }
    </div>

    @if (offices.error()) {
      <app-page-state kind="error" title="No pudimos cargar los locales." (retry)="offices.reload()" />
    } @else if (offices.hasValue()) {
      @if (offices.value().total === 0) {
        <app-page-state kind="empty" title="No hay locales pendientes de revisión." />
      } @else {
        <ul class="rows">
          @for (office of offices.value().data; track office.id) {
            <li class="row">
              <div class="row__main">
                <span class="row__title">{{ office.nombre }}</span>
                <span class="mb-meta">
                  <span>{{ office.empresa?.nombre }}</span>
                  @if (office.ciudad.nombre) { <span>{{ office.ciudad.nombre }}</span> }
                  @if (office.direccionReferencia) { <span>{{ office.direccionReferencia }}</span> }
                </span>
              </div>
              <div class="row__actions">
                <button type="button" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === office.id" (click)="approve(office)">Aprobar</button>
                <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="busy() === office.id" (click)="reject(office)">Rechazar</button>
              </div>
            </li>
          }
        </ul>
      }
    } @else {
      <app-page-state kind="loading" message="Cargando locales…" />
    }
  `,
})
export class OfficesPending {
  private readonly api = inject(OfficesAdminApi);
  protected readonly offices = this.api.listResource(computed(() => ({ estado: 'pendiente' as const, pageSize: 100 })));
  protected readonly busy = signal<number | null>(null);
  protected readonly notice = signal<Notice | null>(null);

  protected approve(office: Office): void {
    this.run(office, this.api.approve(office.id), `Aprobaste el local «${office.nombre}».`);
  }

  protected reject(office: Office): void {
    if (!confirmAction(`¿Rechazar el local «${office.nombre}»?`)) return;
    this.run(office, this.api.reject(office.id), `Rechazaste el local «${office.nombre}».`);
  }

  private run(office: Office, action: Observable<unknown>, success: string): void {
    this.busy.set(office.id);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.offices.reload();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }
}

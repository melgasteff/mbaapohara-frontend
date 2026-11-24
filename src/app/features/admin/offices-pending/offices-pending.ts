import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OfficesAdminApi } from '../../../core/api/offices-admin-api';
import { Office } from '../../../core/models/company';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';

/** Locales propuestos para empresas ya existentes: una pestaña de Empresas. */
@Component({
  selector: 'app-offices-pending',
  imports: [InlineConfirm, PageState, AdminNotice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <p class="lead" tabindex="-1">Un local se aprueba solo si su empresa ya está aprobada.</p>
    <app-admin-notice [notice]="actions.notice()" />

    @if (offices.error()) {
      <app-page-state kind="error" title="No pudimos cargar los locales." (retry)="offices.reload()" />
    } @else if (data(); as result) {
      @if (result.total === 0) {
        <app-page-state kind="empty" title="No hay locales pendientes de revisión" />
      } @else {
        <ul class="rows">
          @for (office of result.data; track office.id) {
            <li>
              <div class="row">
                <div class="row__main">
                  <h2 class="row__title">{{ office.nombre }}</h2>
                  <p class="small">{{ meta(office) }}</p>
                </div>
                <div class="row__actions">
                  <button type="button" class="mb-btn mb-btn-primary" (click)="approve(office)">
                    {{ actions.busy() === 'aprobar-' + office.id ? 'Aprobando…' : 'Aprobar' }}<span class="visually-hidden"> {{ office.nombre }}</span>
                  </button>
                  <button type="button" class="mb-btn mb-btn-borrar" [attr.data-accion]="'rechazar-' + office.id" (click)="actions.ask('rechazar-' + office.id)">
                    Rechazar<span class="visually-hidden"> {{ office.nombre }}</span>
                  </button>
                </div>
              </div>
              @if (actions.confirming() === 'rechazar-' + office.id) {
                <app-inline-confirm confirmLabel="Sí, rechazar" [message]="'¿Rechazar el local «' + office.nombre + '»?'" (confirmed)="reject(office)" (cancelled)="actions.cancel()" />
              }
            </li>
          }
        </ul>
      }
    } @else {
      <app-page-state kind="loading" skeleton="row" message="Cargando locales…" />
    }
  `,
})
export class OfficesPending {
  private readonly api = inject(OfficesAdminApi);
  protected readonly actions = inject(AdminActions);
  protected readonly offices = this.api.listResource(computed(() => ({ estado: 'pendiente' as const, pageSize: 100 })));
  protected readonly data = keepWhileLoading(this.offices);

  protected meta(office: Office): string {
    return [office.empresa?.nombre, office.ciudad.nombre, office.direccionReferencia].filter(Boolean).join(' · ');
  }

  protected approve(office: Office): void {
    this.run(`aprobar-${office.id}`, this.api.approve(office.id), `Aprobaste el local «${office.nombre}».`);
  }

  protected reject(office: Office): void {
    this.run(`rechazar-${office.id}`, this.api.reject(office.id), `Rechazaste el local «${office.nombre}».`);
  }

  private run(key: string, action: ReturnType<OfficesAdminApi['approve']>, success: string): void {
    this.actions.run(key, action, success, {
      done: () => {
        this.offices.reload();
        this.actions.focus('.lead');
      },
    });
  }
}

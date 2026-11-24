import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModerationAdminApi } from '../../api/moderation-admin-api';

/** Navegación de la administración, segunda fila del encabezado `admin`. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    nav { display: flex; gap: 28px; overflow-x: auto; }
    a {
      display: inline-flex; align-items: center; gap: var(--space-2); min-height: 48px; white-space: nowrap;
      color: var(--noche); text-decoration: none; font-size: 15px; font-weight: 600;
    }
    a[aria-current='page'] { color: var(--azul-texto); box-shadow: inset 0 -3px 0 var(--azul-texto); }
    a:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; }
    .count {
      min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--radio-pildora); background: var(--naranja); color: var(--noche); font-size: 12px; font-weight: 700;
    }
  `,
  template: `
    <nav aria-label="Administración">
      <a routerLink="/admin/moderacion" routerLinkActive ariaCurrentWhenActive="page">
        Moderación
        @if (pending.hasValue() && pending.value().total > 0) {
          <span class="count">{{ pending.value().total }}<span class="visually-hidden"> pendientes</span></span>
        }
      </a>
      <a routerLink="/admin/reportes" routerLinkActive ariaCurrentWhenActive="page">Reportes</a>
      <a routerLink="/admin/solicitudes" routerLinkActive ariaCurrentWhenActive="page">Solicitudes</a>
      <a routerLink="/admin/empresas" routerLinkActive ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">Empresas</a>
      <a routerLink="/admin/locales" routerLinkActive ariaCurrentWhenActive="page">Locales pendientes</a>
      <a routerLink="/admin/empresas/nueva" routerLinkActive ariaCurrentWhenActive="page">Nueva empresa</a>
      <a routerLink="/admin/cargos" routerLinkActive ariaCurrentWhenActive="page">Cargos</a>
      <a routerLink="/admin/criterios" routerLinkActive ariaCurrentWhenActive="page">Criterios</a>
    </nav>
  `,
})
export class AdminNav {
  /** Cantidad de reseñas en revisión; se vuelve a pedir con cada decisión. */
  protected readonly pending = inject(ModerationAdminApi).pendingResource();
}

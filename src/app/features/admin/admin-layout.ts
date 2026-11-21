import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ModerationAdminApi } from '../../core/api/moderation-admin-api';

/** Marco de la administración: navegación propia y la pantalla elegida debajo. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .admin-nav { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--line); }
    .admin-nav a { text-decoration: none; color: var(--ink); font-weight: 600; padding: var(--space-1) 0; }
    .admin-nav a[aria-current='page'] { color: var(--yerba-text); box-shadow: inset 0 -2px 0 var(--yerba); }
    .caption { color: var(--ink-muted); margin: 0; }
    .count {
      display: inline-block; min-width: 20px; padding: 0 var(--space-1); margin-left: var(--space-1);
      border-radius: var(--radius-pill); background: var(--warning-soft); color: var(--warning);
      font-size: 12px; line-height: 20px; text-align: center;
    }
  `,
  template: `
    <div class="page">
      <p class="caption">Administración</p>
      <nav class="admin-nav" aria-label="Administración">
        <a routerLink="/admin/moderacion" routerLinkActive ariaCurrentWhenActive="page">
          Moderación
          @if (pending.hasValue() && pending.value().total > 0) {
            <span class="count" [attr.aria-label]="pending.value().total + ' pendientes'">{{ pending.value().total }}</span>
          }
        </a>
        <a routerLink="/admin/empresas" routerLinkActive ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">Empresas</a>
        <a routerLink="/admin/locales" routerLinkActive ariaCurrentWhenActive="page">Locales pendientes</a>
        <a routerLink="/admin/empresas/nueva" routerLinkActive ariaCurrentWhenActive="page">Nueva empresa</a>
        <a routerLink="/admin/cargos" routerLinkActive ariaCurrentWhenActive="page">Cargos</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export class AdminLayout {
  /** Cantidad de reseñas en revisión; se vuelve a pedir con cada decisión. */
  protected readonly pending = inject(ModerationAdminApi).pendingResource();
}

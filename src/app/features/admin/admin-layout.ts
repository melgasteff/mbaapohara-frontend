import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  `,
  template: `
    <div class="page">
      <p class="caption">Administración</p>
      <nav class="admin-nav" aria-label="Administración">
        <a routerLink="/admin/empresas" routerLinkActive ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">Empresas</a>
        <a routerLink="/admin/locales" routerLinkActive ariaCurrentWhenActive="page">Locales pendientes</a>
        <a routerLink="/admin/empresas/nueva" routerLinkActive ariaCurrentWhenActive="page">Nueva empresa</a>
        <a routerLink="/admin/cargos" routerLinkActive ariaCurrentWhenActive="page">Cargos</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export class AdminLayout {}

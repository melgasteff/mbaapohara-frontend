import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    footer {
      background: var(--surface-raised);
      border-top: 1px solid var(--line);
    }
    .inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-5) var(--space-4);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-5);
      align-items: center;
    }
    p { margin: 0; }
    .muted { color: var(--ink-muted); }
    .mb-link { margin-left: auto; display: inline-flex; align-items: center; min-height: 44px; }
    @media (min-width: 1024px) {
      .inner { padding-left: var(--space-6); padding-right: var(--space-6); }
    }
  `,
  template: `
    <footer>
      <div class="inner">
        <p class="label">Mbaapohara · Tu experiencia vale</p>
        <p class="body-sm muted">Proyecto Final de Grado · Ingeniería en Informática · FCyT-UNCA</p>
        <!-- Acceso visible solo para la demo: todavía no hay roles (fuera de alcance). -->
        <a class="mb-link" routerLink="/admin/empresas">Administración</a>
      </div>
    </footer>
  `,
})
export class SiteFooter {}

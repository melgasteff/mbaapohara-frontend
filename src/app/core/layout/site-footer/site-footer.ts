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
    .links { margin-left: auto; display: flex; flex-wrap: wrap; gap: 0 var(--space-4); }
    .mb-link { display: inline-flex; align-items: center; min-height: 44px; }
    @media (min-width: 1024px) {
      .inner { padding-left: var(--space-6); padding-right: var(--space-6); }
    }
  `,
  template: `
    <footer>
      <div class="inner">
        <p class="label">Mbaapohara · Tu experiencia vale</p>
        <p class="body-sm muted">Proyecto Final de Grado · Ingeniería en Informática · FCyT-UNCA</p>
        <nav class="links" aria-label="Información">
          <a class="mb-link" routerLink="/como-moderamos">Cómo moderamos</a>
          <a class="mb-link" routerLink="/privacidad">Privacidad</a>
          <a class="mb-link" routerLink="/terminos">Términos</a>
        </nav>
      </div>
    </footer>
  `,
})
export class SiteFooter {}

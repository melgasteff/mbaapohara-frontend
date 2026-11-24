import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    footer {
      background: var(--noche);
      color: var(--blanco);
    }
    .inner {
      max-width: var(--ancho-pagina);
      margin: 0 auto;
      padding: var(--space-5) var(--space-4);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-5);
      align-items: center;
    }
    p { margin: 0; }
    .muted { color: var(--pie-texto); }
    .links { margin-left: auto; display: flex; flex-wrap: wrap; gap: 0 var(--space-4); }
    .mb-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--blanco); }
    .mb-link:focus-visible { outline-color: var(--blanco); }
    @media (min-width: 1024px) {
      .inner { padding-left: var(--space-7); padding-right: var(--space-7); }
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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './core/layout/site-footer/site-footer';
import { SiteHeader } from './core/layout/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }
    main { flex: 1; }
  `,
  template: `
    <a class="skip-link mb-btn mb-btn-secondary" href="#contenido">Saltar al contenido</a>
    <app-site-header />
    <main id="contenido" tabindex="-1">
      <router-outlet />
    </main>
    <app-site-footer />
  `,
})
export class App {}

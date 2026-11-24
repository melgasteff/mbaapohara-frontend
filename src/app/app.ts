import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { HeaderVariant, routeData } from './core/layout/header-variant';
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
    @if (variant() !== 'ninguno') { <app-site-header [variant]="variant()" [task]="task()" /> }
    <main id="contenido" tabindex="-1">
      <router-outlet />
    </main>
    @if (variant() === 'normal' || variant() === 'inicio') { <app-site-footer /> }
  `,
})
export class App {
  private readonly router = inject(Router);
  private readonly route = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.routerState.snapshot.root),
    ),
    { initialValue: this.router.routerState.snapshot.root },
  );
  protected readonly variant = computed(() => routeData<HeaderVariant>(this.route(), 'encabezado') ?? 'normal');
  protected readonly task = computed(() => routeData<string>(this.route(), 'tarea') ?? '');
}

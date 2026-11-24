import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCircleAlert, LucideRotateCcw, LucideSearchX } from '@lucide/angular';
import { Skeleton, SkeletonShape } from '../skeleton/skeleton';

export type PageStateKind = 'loading' | 'empty' | 'error';

/**
 * Carga, vacío o error de un listado. La carga es un esqueleto con la forma del contenido; el vacío, un bloque blanco
 * con ilustración y una acción; el error, un bloque naranja suave que ofrece reintentar.
 */
@Component({
  selector: 'app-page-state',
  imports: [LucideSearchX, LucideCircleAlert, LucideRotateCcw, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    p { margin: 0; }
    .title { font-size: 21px; line-height: 28px; font-weight: 700; color: var(--noche); }
    .empty {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: 40px var(--space-5); text-align: center;
      background: var(--blanco); border-radius: var(--radio-md); color: var(--noche-suave);
    }
    .empty p { max-width: 45ch; }
    .empty img { width: 104px; height: 104px; }
    .error { display: flex; gap: var(--space-4); align-items: flex-start; padding: var(--space-5); background: var(--naranja-suave); border-radius: var(--radio-md); color: var(--noche); }
    .error > svg { flex: none; color: var(--naranja-texto); }
    .error > div { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
    .error p { color: var(--noche); }
    .error .title { font-size: 19px; line-height: 26px; }
    .error button { margin-top: var(--space-2); }
  `,
  template: `
    @switch (kind()) {
      @case ('loading') {
        <div role="status"><span class="visually-hidden">{{ message() || 'Cargando…' }}</span><app-skeleton [shape]="skeleton()" /></div>
      }
      @case ('empty') {
        <div class="empty" role="status">
          @if (illustration(); as file) {
            <img [src]="'/marca/iconos/' + file + '.svg'" alt="" />
          } @else {
            <svg lucideSearchX [size]="32" aria-hidden="true"></svg>
          }
          <p class="title">{{ title() }}</p>
          @if (message()) { <p class="body">{{ message() }}</p> }
          <ng-content />
        </div>
      }
      @case ('error') {
        <div class="error" role="alert">
          <svg lucideCircleAlert [size]="28" aria-hidden="true"></svg>
          <div>
            <p class="title">{{ title() || 'No pudimos cargar los datos' }}</p>
            <p>{{ message() || 'Revisá tu conexión y volvé a intentar.' }}</p>
            <button type="button" class="mb-btn mb-btn-secondary" (click)="retry.emit()">
              <svg lucideRotateCcw [size]="18" aria-hidden="true"></svg>Volver a intentar
            </button>
          </div>
        </div>
      }
    }
  `,
})
export class PageState {
  readonly kind = input.required<PageStateKind>();
  readonly title = input('');
  readonly message = input('');
  /** Ilustración del estado vacío (archivo de public/marca/iconos, sin extensión). */
  readonly illustration = input<string>();
  /** Forma del contenido que se carga. */
  readonly skeleton = input<SkeletonShape>('lines');
  readonly retry = output<void>();
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCircleAlert, LucideMessageSquare, LucideRotateCcw, LucideSearchX } from '@lucide/angular';

export type PageStateKind = 'loading' | 'empty' | 'error';

/**
 * Mensaje de carga, vacío o error de un listado. El error ofrece reintentar.
 * Los colores de estado siempre van con palabra e ícono, como pide el manual.
 */
@Component({
  selector: 'app-page-state',
  imports: [LucideSearchX, LucideMessageSquare, LucideCircleAlert, LucideRotateCcw],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    .state {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
      padding: var(--space-7) var(--space-4); text-align: center;
      background: var(--surface-sunken); border-radius: var(--radius-lg); color: var(--ink-muted);
    }
    .state p { margin: 0; max-width: 45ch; }
    .state strong { color: var(--ink); }
  `,
  template: `
    @switch (kind()) {
      @case ('loading') {
        <div class="state" role="status"><p class="body">{{ message() || 'Cargando…' }}</p></div>
      }
      @case ('empty') {
        <div class="state" role="status">
          @if (icon() === 'reviews') {
            <svg lucideMessageSquare [size]="32" aria-hidden="true"></svg>
          } @else {
            <svg lucideSearchX [size]="32" aria-hidden="true"></svg>
          }
          <p class="body"><strong>{{ title() }}</strong></p>
          @if (message()) { <p class="body-sm">{{ message() }}</p> }
          <ng-content />
        </div>
      }
      @case ('error') {
        <div class="state" role="alert">
          <svg lucideCircleAlert [size]="32" aria-hidden="true"></svg>
          <p class="body"><strong>{{ title() || 'No pudimos cargar los datos.' }}</strong></p>
          <p class="body-sm">{{ message() || 'Revisá tu conexión e intentá de nuevo.' }}</p>
          <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="retry.emit()">
            <svg lucideRotateCcw [size]="16" aria-hidden="true"></svg>
            Intentar de nuevo
          </button>
        </div>
      }
    }
  `,
})
export class PageState {
  readonly kind = input.required<PageStateKind>();
  readonly title = input('');
  readonly message = input('');
  /** Ícono del estado vacío: búsqueda sin resultados o falta de reseñas. */
  readonly icon = input<'search' | 'reviews'>('search');
  readonly retry = output<void>();
}

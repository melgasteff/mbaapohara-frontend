import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

/**
 * Confirmación en línea, debajo de la acción que no se puede deshacer (reemplaza a window.confirm).
 * Quien la usa la muestra con `@if` y devuelve el foco a su botón al cancelar.
 */
@Component({
  selector: 'app-inline-confirm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alert', '(keydown.escape)': 'cancelled.emit()' },
  styles: `
    :host {
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4);
      background: var(--naranja-suave); color: var(--noche); border-radius: var(--radio-sm); font-size: 15px; line-height: 22px;
      animation: entra .2s ease-out;
    }
    .message { flex: 1 1 200px; }
    @keyframes entra { from { opacity: 0; transform: translateY(6px); } }
    @media (prefers-reduced-motion: reduce) { :host { animation: none; } }
  `,
  template: `
    <span class="message">{{ message() }}</span>
    <button type="button" class="mb-btn mb-btn-peligro" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
    <button #cancel type="button" class="mb-btn mb-btn-texto" (click)="cancelled.emit()">Cancelar</button>
  `,
})
export class InlineConfirm {
  readonly message = input.required<string>();
  readonly confirmLabel = input('Sí, borrar');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancel = viewChild.required<ElementRef<HTMLButtonElement>>('cancel');

  constructor() {
    // El foco va a «Cancelar»: un Enter de más no confirma algo que no se puede deshacer.
    afterNextRender(() => this.cancel().nativeElement.focus());
  }
}

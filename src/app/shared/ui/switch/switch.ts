import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Interruptor. No cambia solo: avisa, y quien lo usa decide (puede pedir confirmación). */
@Component({
  selector: 'app-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    button { display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer; }
    .track { display: flex; box-sizing: border-box; width: 46px; height: 26px; padding: 3px; border-radius: var(--radio-pildora); background: var(--borde-control); transition: background-color .15s ease; }
    .knob { width: 20px; height: 20px; border-radius: 50%; background: var(--blanco); transition: transform .15s ease; }
    [aria-checked='true'] .track { background: var(--azul-texto); }
    [aria-checked='true'] .knob { transform: translateX(20px); }
    button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; border-radius: var(--radio-sm); }
    @media (prefers-reduced-motion: reduce) { .track, .knob { transition: none; } }
  `,
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" [attr.aria-label]="label()" [attr.data-accion]="action() || null" (click)="toggled.emit()">
      <span class="track"><span class="knob"></span></span>
    </button>
  `,
})
export class Switch {
  readonly checked = input.required<boolean>();
  readonly label = input.required<string>();
  /** Clave de su confirmación, para devolverle el foco al cancelar. */
  readonly action = input<string>();
  readonly toggled = output<void>();
}

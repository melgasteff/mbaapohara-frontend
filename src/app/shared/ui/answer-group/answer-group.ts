import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReviewOption } from '../../../core/models/review';

let nextId = 0;

/**
 * Respuesta a un criterio (Sí / En parte / No / No sé o no aplica). Se ve como `.mb-chip`, pero es un grupo
 * de radios nativos para que funcione con teclado (ADAPTACIONES.md). Ninguna opción usa `danger`.
 */
@Component({
  selector: 'app-answer-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AnswerGroup), multi: true }],
  styles: `
    .options { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .mb-chip:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
    /* Mismo aspecto que .mb-chip[aria-pressed="true"] del manual, para un radio marcado. */
    .mb-chip.is-checked { background: var(--yerba-soft); border-color: var(--yerba); color: var(--yerba-text); }
  `,
  template: `
    <div class="options" role="radiogroup" [attr.aria-labelledby]="labelledBy()">
      @for (option of options(); track option.valor) {
        <label class="mb-chip" [class.is-checked]="value() === option.valor">
          <input
            class="visually-hidden"
            type="radio"
            [name]="name"
            [value]="option.valor"
            [checked]="value() === option.valor"
            [disabled]="disabled()"
            (change)="select(option.valor)"
            (blur)="onTouched()"
          />
          {{ option.etiqueta }}
        </label>
      }
    </div>
  `,
})
export class AnswerGroup implements ControlValueAccessor {
  readonly options = input.required<ReviewOption[]>();
  /** Id del elemento con el texto del criterio. */
  readonly labelledBy = input.required<string>();

  protected readonly name = `respuesta-${nextId++}`;
  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(valor: string): void {
    this.value.set(valor);
    this.onChange(valor);
  }

  writeValue(value: string | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}

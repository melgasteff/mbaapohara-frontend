import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { ReviewOption } from '../../../core/models/review';

let nextId = 0;

/**
 * Respuesta a un criterio (Sí / En parte / No / No sé o no aplica). Botones grandes en grilla de
 * dos columnas (una en móvil); por dentro son radios nativos, para que funcione con teclado (ADAPTACIONES.md).
 */
@Component({
  selector: 'app-answer-group',
  imports: [LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AnswerGroup), multi: true }],
  styles: `
    .options { display: grid; gap: 10px; }
    .answer {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); min-height: 56px; box-sizing: border-box;
      padding: var(--space-2) 18px; border: 2px solid var(--borde-control); border-radius: var(--radio-sm); background: var(--blanco);
      color: var(--noche); font-size: 17px; line-height: 24px; font-weight: 600; cursor: pointer; transition: background-color .12s ease, border-color .12s ease;
    }
    .answer:hover { background: var(--azul-suave); }
    .answer.is-checked { background: var(--azul-suave); border-color: var(--azul-texto); color: var(--azul-texto); }
    .answer:has(input:focus-visible) { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    @media (min-width: 600px) { .options { grid-template-columns: 1fr 1fr; } }
  `,
  template: `
    <div class="options" role="radiogroup" [attr.aria-labelledby]="labelledBy()">
      @for (option of options(); track option.valor) {
        <label class="answer" [class.is-checked]="value() === option.valor">
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
          @if (value() === option.valor) { <svg lucideCheck [size]="20" aria-hidden="true"></svg> }
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

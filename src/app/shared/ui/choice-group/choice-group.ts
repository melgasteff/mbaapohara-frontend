import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';

export interface Choice<T = unknown> {
  valor: T;
  etiqueta: string;
}

let nextId = 0;

/** Elección única sobre radios nativos, como chips (opciones cortas) o como tarjetas. */
@Component({
  selector: 'app-choice-group',
  imports: [LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChoiceGroup), multi: true }],
  styles: `
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .chips .mb-chip { position: relative; height: auto; min-height: 44px; font-size: 15px; transition: background-color .15s ease, border-color .15s ease; }
    .cards { display: grid; gap: 10px; }
    .card {
      position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-4);
      border: 2px solid var(--linea); border-radius: var(--radio-md); background: var(--blanco); font-size: 16px; line-height: 24px; font-weight: 600; cursor: pointer;
      transition: border-color .15s ease;
    }
    .card:hover { border-color: var(--borde-control); }
    .card.is-checked { border-color: var(--azul-texto); }
    label:has(input:focus-visible) { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    @media (min-width: 600px) { .cards { grid-template-columns: 1fr 1fr; } }
  `,
  template: `
    <div
      role="radiogroup"
      [class]="look()"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="describedBy() || null"
      [attr.aria-invalid]="describedBy() ? true : null"
    >
      @for (option of options(); track option.valor) {
        <label [class]="look() === 'chips' ? 'mb-chip' : 'card'" [class.is-checked]="value() === option.valor">
          <input
            class="visually-hidden"
            type="radio"
            [name]="name"
            [checked]="value() === option.valor"
            [disabled]="disabled()"
            (change)="select(option.valor)"
            (blur)="onTouched()"
          />
          @if (look() === 'chips') {
            @if (value() === option.valor) { <svg lucideCheck [size]="16" aria-hidden="true"></svg> }
            {{ option.etiqueta }}
          } @else {
            <span>{{ option.etiqueta }}</span><span class="mb-radio" aria-hidden="true"></span>
          }
        </label>
      }
    </div>
  `,
})
export class ChoiceGroup<T = unknown> implements ControlValueAccessor {
  readonly options = input.required<Choice<T>[]>();
  /** Id del texto de la pregunta. */
  readonly labelledBy = input.required<string>();
  /** Id del mensaje de error, si lo hay. */
  readonly describedBy = input<string>();
  readonly look = input<'chips' | 'cards'>('chips');

  protected readonly name = `eleccion-${nextId++}`;
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}

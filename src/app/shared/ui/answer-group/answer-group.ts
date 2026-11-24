import { ChangeDetectionStrategy, Component, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { ReviewOption } from '../../../core/models/review';

let nextId = 0;

/**
 * Respuesta a un criterio (Sí / En parte / No / No sé o no aplica). Botones grandes en grilla de
 * dos columnas (una en móvil); por dentro son radios nativos, para que funcione con teclado (ADAPTACIONES.md).
 *
 * `picked` avisa que la persona terminó de elegir, para pasar a la pregunta siguiente: con clic, Enter o espacio. Las
 * flechas también marcan (así funcionan los radios), pero sin avisar: si no, no se podría recorrer las opciones.
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
    <div
      class="options"
      role="radiogroup"
      [attr.aria-labelledby]="labelledBy()"
      (keydown)="onKeydown($event)"
      (keyup)="clearArrow()"
      (pointerdown)="clearArrow()"
    >
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
            (click)="pick(option.valor)"
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

  /** Respuesta elegida con clic, Enter o espacio (también si ya estaba marcada). */
  readonly picked = output<string>();

  protected readonly name = `respuesta-${nextId++}`;
  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  /** El navegador también dispara «click» cuando una flecha cambia el radio, después de mover el foco. */
  private byArrow = false;

  /** En un método: una expresión de plantilla que vale `false` cancela el evento, y con él el espacio. */
  protected clearArrow(): void {
    this.byArrow = false;
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.byArrow = event.key.startsWith('Arrow');
    const value = this.value();
    // Sobre un radio ya marcado, el navegador no dispara nada con Enter ni con espacio.
    const confirms = event.key === 'Enter' || (event.key === ' ' && (event.target as HTMLInputElement).checked);
    if (confirms && value !== null) {
      event.preventDefault();
      this.picked.emit(value);
    }
  }

  /** El clic llega antes que el cambio: se guarda el valor y después se avisa. */
  protected pick(valor: string): void {
    if (this.byArrow) return;
    this.select(valor);
    this.picked.emit(valor);
  }

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

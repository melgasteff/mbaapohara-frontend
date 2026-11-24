import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/**
 * Entrada de calificación de 1 a N estrellas (componente Calificacion del manual). Por dentro son radios
 * nativos: funcionan con flechas del teclado y lector de pantalla. Muestra la palabra del valor.
 */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRating), multi: true }],
  styles: `
    .stars { display: inline-flex; gap: var(--space-1); }
    label { cursor: pointer; display: inline-flex; border-radius: var(--radio-sm); }
    label:has(input:focus-visible) { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    svg { width: 40px; height: 40px; margin: var(--space-1); transition: transform .18s cubic-bezier(.3, 1.6, .5, 1); }
    .is-last svg { transform: scale(1.12); }
    @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
    .summary { margin-left: var(--space-2); }
    .summary strong { font-size: 20px; line-height: 28px; color: var(--noche); }
    .mb-star-input legend { font-size: 15px; line-height: 22px; }
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-2); }
  `,
  template: `
    <fieldset class="mb-star-input" [attr.aria-describedby]="describedBy() || null">
      <legend>{{ legend() }}</legend>
      <div class="row">
        <span class="stars" (mouseleave)="hovered.set(0)">
          @for (n of values(); track n) {
            <label [class.is-last]="!hovered() && value() === n" (mouseenter)="hovered.set(n)">
              <input
                class="visually-hidden"
                type="radio"
                [name]="name"
                [value]="n"
                [checked]="value() === n"
                [disabled]="disabled()"
                (change)="select(n)"
                (blur)="onTouched()"
              />
              <span class="visually-hidden">{{ n }} de {{ max() }} · {{ words()[n] }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <g [class]="n <= shown() ? 'mb-star-full' : 'mb-star-empty'">
                  <path d="M12 2.8l2.8 5.8 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z" />
                </g>
              </svg>
            </label>
          }
        </span>
        <span class="mb-rating-count summary" aria-live="polite">
          @if (value(); as v) { <strong>{{ words()[v] }}</strong><span class="visually-hidden">, {{ v }} de {{ max() }}</span> } @else { Elegí de 1 a {{ max() }} estrellas }
        </span>
      </div>
    </fieldset>
  `,
})
export class StarRating implements ControlValueAccessor {
  readonly legend = input.required<string>();
  readonly max = input(5);
  /** Palabra de cada valor: { "1": "Muy malo", … }. */
  readonly words = input<Record<string, string>>({});
  readonly describedBy = input<string>();

  protected readonly name = `estrellas-${nextId++}`;
  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal(false);
  protected readonly values = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));

  /** Estrella bajo el cursor; 0 si no hay. */
  protected readonly hovered = signal(0);
  protected readonly shown = computed(() => this.hovered() || (this.value() ?? 0));

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(n: number): void {
    this.hovered.set(0);
    this.value.set(n);
    this.onChange(n);
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}

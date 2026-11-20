import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Cinco estrellas de solo lectura, con el trazo del manual (Calificacion). */
@Component({
  selector: 'app-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mb-stars', '[class.mb-stars-lg]': 'large()', 'aria-hidden': 'true' },
  template: `
    @for (full of stars(); track $index) {
      <svg viewBox="0 0 24 24">
        <g [class]="full ? 'mb-star-full' : 'mb-star-empty'">
          <path d="M12 2.8l2.8 5.8 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z" />
        </g>
      </svg>
    }
  `,
})
export class Stars {
  readonly value = input(0);
  readonly max = input(5);
  readonly large = input(false);

  protected readonly stars = computed(() =>
    Array.from({ length: this.max() }, (_, i) => i < Math.round(this.value())),
  );
}

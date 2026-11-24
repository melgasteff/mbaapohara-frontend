import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Forma del contenido que se está cargando. */
export type SkeletonShape = 'row' | 'review' | 'lines';

/** Esqueleto con la forma del contenido. Quien lo usa anuncia el texto de carga (app-page-state). */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: block; }
    .b { display: block; background: var(--neutro-suave); border-radius: var(--radio-xs); animation: brillo 1.2s ease-in-out infinite; }
    .row { display: grid; grid-template-columns: 44px 1fr 90px; gap: var(--space-4); align-items: center; padding: 18px 0; border-bottom: 1px solid var(--linea); }
    .row .b, .review .b, .lines .b { height: 12px; }
    .row .seal { height: 46px; border-radius: 50% 50% 50% var(--radio-xs); }
    .col { display: flex; flex-direction: column; gap: var(--space-2); }
    .review { padding: 22px; margin-bottom: var(--space-4); background: var(--blanco); border: 1px solid var(--linea); border-radius: var(--radio-resena); }
    .lines { padding: var(--space-4) 0; }
    .w30 { width: 30%; } .w45 { width: 45%; } .w70 { width: 70%; } .w90 { width: 90%; }
    @keyframes brillo { 50% { opacity: .5; } }
    @media (prefers-reduced-motion: reduce) { .b { animation: none; } }
  `,
  template: `
    @for (i of items(); track i) {
      @switch (shape()) {
        @case ('row') {
          <div class="row"><span class="b seal"></span><span class="col"><span class="b w70"></span><span class="b w45"></span></span><span class="b"></span></div>
        }
        @case ('review') {
          <div class="review col"><span class="b w30"></span><span class="b w45"></span><span class="b w90"></span><span class="b w70"></span></div>
        }
        @default {
          <div class="lines col"><span class="b w45"></span><span class="b w90"></span><span class="b w70"></span></div>
        }
      }
    }
  `,
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('lines');
  protected readonly items = computed(() => Array.from({ length: this.shape() === 'row' ? 5 : this.shape() === 'review' ? 3 : 1 }, (_, i) => i));
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideCheck, LucideCircleDot, LucideCircleQuestionMark, LucideClock, LucideX } from '@lucide/angular';

/** Respuestas a un criterio (valores de la API) y estados de una reseña. */
export type TagKind = 'SI' | 'EN_PARTE' | 'NO' | 'NO_SABE' | 'publicada' | 'en_revision' | 'rechazada';

const TONES: Record<TagKind, string> = {
  SI: 'mb-tag mb-tag-success',
  publicada: 'mb-tag mb-tag-success',
  EN_PARTE: 'mb-tag mb-tag-warning',
  en_revision: 'mb-tag mb-tag-warning',
  NO: 'mb-tag mb-tag-naranja',
  rechazada: 'mb-tag mb-tag-naranja',
  NO_SABE: 'mb-tag mb-tag-neutro',
};

/** Valor de una respuesta como tipo de etiqueta; uno desconocido se muestra neutro. */
export function answerKind(value: string): TagKind {
  return value === 'SI' || value === 'EN_PARTE' || value === 'NO' ? value : 'NO_SABE';
}

/** Etiqueta de respuesta o de estado: siempre palabra (contenido) e ícono, nunca solo color. */
@Component({
  selector: 'app-tag',
  imports: [LucideCheck, LucideClock, LucideCircleDot, LucideX, LucideCircleQuestionMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'tone()' },
  template: `
    @switch (kind()) {
      @case ('EN_PARTE') { <svg lucideCircleDot aria-hidden="true"></svg> }
      @case ('en_revision') { <svg lucideClock aria-hidden="true"></svg> }
      @case ('NO') { <svg lucideX aria-hidden="true"></svg> }
      @case ('rechazada') { <svg lucideX aria-hidden="true"></svg> }
      @case ('NO_SABE') { <svg lucideCircleQuestionMark aria-hidden="true"></svg> }
      @default { <svg lucideCheck aria-hidden="true"></svg> }
    }
    <ng-content />
  `,
})
export class Tag {
  readonly kind = input.required<TagKind>();
  protected readonly tone = computed(() => TONES[this.kind()]);
}

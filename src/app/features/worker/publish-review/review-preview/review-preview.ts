import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { LucideMinus, LucidePlus, LucideX } from '@lucide/angular';
import { ReviewOption } from '../../../../core/models/review';
import { Stars } from '../../../../shared/ui/stars/stars';
import { answerKind, Tag } from '../../../../shared/ui/tag/tag';

const MAX = 140;

/** «Así se va a ver tu reseña»: la tarjeta armada en vivo, con lo que falta en gris. */
@Component({
  selector: 'app-review-preview',
  imports: [Stars, Tag, LucidePlus, LucideMinus, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    aside { display: flex; flex-direction: column; gap: 14px; }
    h2, p { margin: 0; }
    h2 { color: var(--noche-suave); letter-spacing: .12em; }
    article { padding: 18px; gap: 10px; }
    .head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); }
    .small { font-size: 13px; line-height: 18px; color: var(--noche-suave); }
    .company { font-size: 14px; line-height: 20px; font-weight: 700; }
    .block { display: flex; flex-direction: column; gap: var(--space-2); padding-top: 10px; border-top: 1px solid var(--linea-suave); font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
    .label { display: flex; align-items: center; gap: var(--space-1); font-weight: 700; }
    .empty { color: var(--noche-suave); font-style: italic; }
    .rights { flex-flow: row wrap; align-items: center; gap: 6px; }
    .rights app-tag { padding: 2px 8px; font-size: 13px; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 14px; line-height: 20px; color: var(--noche-suave); }
    li { display: flex; align-items: center; gap: var(--space-2); }
    li svg { flex: none; color: var(--naranja-texto); }
  `,
  template: `
    <aside aria-label="Vista previa">
      <h2 class="sobretitulo">Así se va a ver tu reseña</h2>
      <article class="mb-review">
        <div class="head">
          <app-stars [value]="rating() ?? 0" />
          <span class="visually-hidden">{{ rating() ? rating() + ' de 5 estrellas' : 'Sin calificación todavía' }}</span>
          <span class="small">{{ month }}</span>
        </div>
        <p class="company">{{ company() || 'Empresa' }}</p>
        <p class="small">{{ meta().join(' · ') }}</p>
        <div class="block">
          <div>
            <p class="label mb-pro"><svg lucidePlus [size]="16" aria-hidden="true"></svg>Lo bueno</p>
            <p [class.empty]="!good().trim()">{{ shortGood() }}</p>
          </div>
          <div>
            <p class="label mb-con"><svg lucideMinus [size]="16" aria-hidden="true"></svg>A mejorar</p>
            <p [class.empty]="!toImprove().trim()">{{ shortToImprove() }}</p>
          </div>
        </div>
        <div class="block rights">
          <span class="small">Derechos:</span>
          @for (answer of answers(); track answer.valor) {
            <app-tag [kind]="kind(answer.valor)">{{ answer.cantidad }} {{ answer.etiqueta }}</app-tag>
          } @empty {
            <span class="empty small">Se completa en el paso 3</span>
          }
        </div>
      </article>
      <h2 class="sobretitulo">Nunca se muestra</h2>
      <ul>
        <li><svg lucideX [size]="16" aria-hidden="true"></svg>Tu nombre ni tu correo</li>
        <li><svg lucideX [size]="16" aria-hidden="true"></svg>El día exacto en que publicaste</li>
      </ul>
    </aside>
  `,
})
export class ReviewPreview {
  readonly company = input('');
  readonly meta = input<string[]>([]);
  readonly rating = input<number | null>(null);
  readonly good = input('');
  readonly toImprove = input('');
  /** Respuestas contadas. Como en la tarjeta publicada, «No sé o no aplica» no se muestra. */
  readonly answers = input<(ReviewOption & { cantidad: number })[]>([]);

  protected readonly kind = answerKind;
  protected readonly month = currentMonth(inject(LOCALE_ID));
  protected readonly shortGood = computed(() => short(this.good()));
  protected readonly shortToImprove = computed(() => short(this.toImprove()));
}

function short(text: string): string {
  const clean = text.trim();
  if (!clean) return 'Lo escribís en el paso 4';
  return clean.length > MAX ? `${clean.slice(0, MAX).trimEnd()}…` : clean;
}

/** «Noviembre de 2026»: en público solo se muestra el mes. */
function currentMonth(locale: string): string {
  const text = formatDate(new Date(), "MMMM 'de' y", locale);
  return text.charAt(0).toLocaleUpperCase('es') + text.slice(1);
}

import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LucideChevronDown, LucideMinus, LucidePlus } from '@lucide/angular';
import { ComplianceGroup } from '../../../core/models/review';
import { Stars } from '../stars/stars';
import { answerKind, Tag } from '../tag/tag';
import { answerCounts } from './answer-counts';

let nextId = 0;

/**
 * Tarjeta de reseña: la única con la «esquina de diálogo». Sin autor, sin título y sin género en los metadatos.
 * El pie (reportar, pedir una revisión) va como contenido.
 */
@Component({
  selector: 'app-review-card',
  imports: [Stars, Tag, LucidePlus, LucideMinus, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './review-card.css',
  template: `
    <article class="mb-review" [attr.aria-label]="'Reseña con ' + rating() + ' de 5 estrellas'">
      <div class="head">
        <div>
          <div class="mb-rating">
            <app-stars [value]="rating()" />
            <span class="mb-rating-value">{{ rating() }}@if (word()) { · {{ word() }} }</span>
          </div>
          <p class="meta body-sm">{{ meta().join(' · ') }}</p>
        </div>
        @if (when()) { <span class="when">{{ when() }}</span> }
      </div>
      <div class="texts">
        <div>
          <p class="label mb-pro"><svg lucidePlus [size]="18" aria-hidden="true"></svg>Lo bueno</p>
          <p class="text">{{ good() }}</p>
        </div>
        <div>
          <p class="label mb-con"><svg lucideMinus [size]="18" aria-hidden="true"></svg>A mejorar</p>
          <p class="text">{{ toImprove() }}</p>
        </div>
      </div>
      @if (compliance().length) {
        <div class="rights">
          <button type="button" class="rights__toggle" [attr.aria-expanded]="open()" [attr.aria-controls]="detailId" (click)="open.set(!open())">
            <span class="muted">Derechos:</span>
            <app-tag kind="SI">{{ counts().si }} Sí</app-tag>
            <app-tag kind="EN_PARTE">{{ counts().enParte }} En parte</app-tag>
            <app-tag kind="NO">{{ counts().no }} No</app-tag>
            <span class="rights__more">{{ open() ? 'Ocultar' : 'Ver detalle' }}<svg lucideChevronDown [size]="16" [class.is-open]="open()" aria-hidden="true"></svg></span>
          </button>
          <div [id]="detailId" [hidden]="!open()">
            @if (complianceContext()) { <p class="body-sm muted">{{ complianceContext() }}</p> }
            @for (group of compliance(); track group.categoria) {
              <h3 class="rights__category">{{ group.categoria }}</h3>
              <ul>
                @for (row of group.filas; track row.codigo) {
                  <li><span class="body-sm">{{ row.texto }}</span><app-tag [kind]="kind(row.valor)">{{ row.etiqueta }}</app-tag></li>
                }
              </ul>
            }
          </div>
        </div>
      }
      <ng-content />
    </article>
  `,
})
export class ReviewCard {
  readonly rating = input.required<number>();
  /** Palabra de la calificación, del JSON de la reseña («Bueno»). */
  readonly word = input<string>();
  readonly meta = input<string[]>([]);
  /** Mes de publicación, a la derecha. En «Mis reseñas», cuándo se envió. */
  readonly when = input<string>();
  readonly good = input.required<string>();
  readonly toImprove = input.required<string>();
  readonly compliance = input<ComplianceGroup[]>([]);
  readonly complianceContext = input<string>();

  protected readonly detailId = `derechos-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly counts = computed(() => answerCounts(this.compliance()));
  protected readonly kind = answerKind;
}

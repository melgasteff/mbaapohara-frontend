import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleMinus, LucideCirclePlus } from '@lucide/angular';
import { Stars } from '../stars/stars';

/**
 * Tarjeta de reseña del manual (TarjetaResena), con las adaptaciones del proyecto: sin título, sin
 * «Empleo verificado» y sin botón «Útil». Los metadatos no tienen género («Trabajó aquí · Cajera · hasta 2025»).
 */
@Component({
  selector: 'app-review-card',
  imports: [DecimalPipe, Stars, LucideCirclePlus, LucideCircleMinus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `:host { display: block; } .mb-review { max-width: none; }`,
  template: `
    <article class="mb-review" [attr.aria-label]="'Reseña con ' + rating() + ' de 5 estrellas'">
      <div class="mb-review-head">
        <div class="mb-rating">
          <app-stars [value]="rating()" />
          <span class="mb-rating-value">{{ rating() | number: '1.1-1' }}</span>
        </div>
        <ng-content select="[tag]" />
      </div>
      <div class="mb-meta">
        @for (item of meta(); track $index) { <span>{{ item }}</span> }
      </div>
      <div class="mb-review-section">
        <span class="mb-pro"><svg lucideCirclePlus [size]="20" aria-hidden="true"></svg></span>
        <p><strong>Lo bueno</strong>{{ good() }}</p>
      </div>
      <div class="mb-review-section">
        <span class="mb-con"><svg lucideCircleMinus [size]="20" aria-hidden="true"></svg></span>
        <p><strong>A mejorar</strong>{{ toImprove() }}</p>
      </div>
      @if (footer()) {
        <div class="mb-review-foot">
          <span class="mb-meta"><span>{{ footer() }}</span></span>
        </div>
      }
    </article>
  `,
})
export class ReviewCard {
  readonly rating = input.required<number>();
  readonly meta = input<string[]>([]);
  readonly good = input.required<string>();
  readonly toImprove = input.required<string>();
  readonly footer = input<string>();
}

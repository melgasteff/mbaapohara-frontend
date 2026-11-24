import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { CompanyDetail } from '../../../../core/models/company';
import { MIN_REVIEWS_FOR_TOPICS } from '../../../../shared/ui/company-row/company-row';
import { Stars } from '../../../../shared/ui/stars/stars';

/** Temas que se ven sin desplegar. */
const VISIBLE_TOPICS = 4;

/**
 * Franja de resumen del perfil. Con 3 reseñas o más: calificación, distribución y temas. Con 1 o 2: la calificación y
 * cuántas faltan. Sin reseñas: la invitación a contar la primera.
 */
@Component({
  selector: 'app-company-summary',
  imports: [DecimalPipe, RouterLink, Stars, LucideArrowRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './company-summary.css',
  templateUrl: './company-summary.html',
})
export class CompanySummaryBand {
  readonly company = input.required<CompanyDetail>();
  /** Palabra de cada calificación, del JSON de la reseña. */
  readonly words = input<Record<string, string>>({});

  protected readonly needed = MIN_REVIEWS_FOR_TOPICS;
  protected readonly total = computed(() => this.company().cantidadResenas);
  protected readonly missing = computed(() => this.needed - this.total());
  protected readonly steps = Array.from({ length: MIN_REVIEWS_FOR_TOPICS }, (_, i) => i + 1);

  protected readonly distribution = computed(() =>
    this.company().distribucion.map((row) => ({ ...row, percent: (row.cantidad * 100) / this.total() })),
  );

  protected readonly allTopics = signal(false);
  protected readonly hiddenTopics = computed(() => this.company().temas.length > VISIBLE_TOPICS);
  protected readonly topics = computed(() => (this.allTopics() ? this.company().temas : this.company().temas.slice(0, VISIBLE_TOPICS)));
}

import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideClock, LucideFlaskConical } from '@lucide/angular';
import { PublishResult as Result, ReviewDraft } from '../../../../core/models/review';
import { ReviewCard } from '../../../../shared/ui/review-card/review-card';
import { draftMeta } from '../review-form';

/** Resultado del envío: publicada o en revisión. PROTOTIPO hasta la tarea 3.3. */
@Component({
  selector: 'app-publish-result',
  imports: [RouterLink, ReviewCard, LucideCircleCheck, LucideClock, LucideFlaskConical],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (result().estado === 'publicada') {
      <p class="status">
        <span class="mb-tag mb-tag-success"><svg lucideCircleCheck aria-hidden="true"></svg>Publicada</span>
        <span class="body">Gracias por contar. Así se va a ver tu reseña en el perfil de {{ draft().empresa.nombre }}.</span>
      </p>
    } @else {
      <p class="status">
        <span class="mb-tag mb-tag-warning"><svg lucideClock aria-hidden="true"></svg>En revisión</span>
        <span class="body">Tu reseña está en revisión. Te avisamos en 48 horas.</span>
      </p>
      @if (result().motivo) {
        <p class="body-sm reason">{{ result().motivo }} Una persona del equipo la va a revisar antes de publicarla.</p>
      }
    }

    <app-review-card
      [rating]="draft().calificacion"
      [meta]="meta()"
      [good]="draft().loBueno"
      [toImprove]="draft().aMejorar"
      [footer]="footer()"
    >
      <span tag class="mb-tag"><svg lucideFlaskConical aria-hidden="true"></svg>Prototipo</span>
    </app-review-card>

    <p class="body-sm prototype">
      Prototipo: esta reseña no se guardó. La publicación y la moderación reales llegan en las próximas tareas.
    </p>

    <div class="actions">
      <a class="mb-btn mb-btn-primary" [routerLink]="['/empresas', draft().empresa.id]">Ver {{ draft().empresa.nombre }}</a>
      <button type="button" class="mb-btn mb-btn-secondary" (click)="restart.emit()">Escribir otra reseña</button>
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--space-4); max-width: 640px; }
    .status { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); margin: 0; }
    .reason, .prototype { margin: 0; color: var(--ink-muted); }
    .actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
  `,
})
export class PublishResult {
  readonly draft = input.required<ReviewDraft>();
  readonly result = input.required<Result>();
  readonly restart = output<void>();

  private readonly locale = inject(LOCALE_ID);
  protected readonly meta = computed(() => draftMeta(this.draft()));
  protected readonly footer = computed(() =>
    this.result().estado === 'publicada'
      ? `Publicada en ${formatDate(new Date(), "MMMM 'de' y", this.locale)}`
      : undefined,
  );
}

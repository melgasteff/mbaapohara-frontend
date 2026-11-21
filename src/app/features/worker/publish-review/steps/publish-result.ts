import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideCircleX, LucideClock } from '@lucide/angular';
import { PublishResult as Result, ReviewDraft } from '../../../../core/models/review';
import { ReviewCard } from '../../../../shared/ui/review-card/review-card';
import { draftMeta } from '../review-form';

/**
 * Resultado del envío según la política de moderación (sección 7): publicada, en revisión o rechazada con lo que
 * hay que corregir. Lo decide la moderación del backend (tareas 2.3 y 3.3).
 */
@Component({
  selector: 'app-publish-result',
  imports: [RouterLink, ReviewCard, LucideCircleCheck, LucideCircleX, LucideClock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (result().estado === 'publicada') {
      <p class="status">
        <span class="mb-tag mb-tag-success"><svg lucideCircleCheck aria-hidden="true"></svg>Publicada</span>
        <span class="body">Gracias por contar. Así se va a ver tu reseña en el perfil de {{ draft().empresa.nombre }}.</span>
      </p>
    } @else if (result().estado === 'en_revision') {
      <p class="status">
        <span class="mb-tag mb-tag-warning"><svg lucideClock aria-hidden="true"></svg>En revisión</span>
        <span class="body">{{ result().motivo || 'Tu reseña está en revisión. Te avisamos en 48 horas.' }}</span>
      </p>
      <p class="body-sm reason">Una persona del equipo la revisa sin saber quién la escribió. Podés ver cómo va en «Mis reseñas».</p>
    } @else {
      <p class="status">
        <span class="mb-tag mb-tag-danger"><svg lucideCircleX aria-hidden="true"></svg>Rechazada</span>
        <span class="body">{{ result().motivo }}</span>
      </p>
      <p class="body-sm reason">Solo vos ves esta reseña. Corregila y volvé a enviarla: lo que escribiste no se perdió.</p>
    }

    @if (result().estado !== 'rechazada') {
      <app-review-card
        [rating]="draft().calificacion"
        [meta]="meta()"
        [good]="draft().loBueno"
        [toImprove]="draft().aMejorar"
        [footer]="footer()"
      />
    }

    <div class="actions">
      @if (result().estado === 'rechazada') {
        <button type="button" class="mb-btn mb-btn-primary" (click)="edit.emit()">Editar y volver a enviar</button>
      } @else {
        <a class="mb-btn mb-btn-primary" [routerLink]="['/empresas', draft().empresa.id]">Ver {{ draft().empresa.nombre }}</a>
      }
      <a class="mb-btn mb-btn-secondary" routerLink="/mis-resenas">Mis reseñas</a>
      <button type="button" class="mb-btn mb-btn-secondary" (click)="restart.emit()">Escribir otra reseña</button>
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--space-4); max-width: 640px; }
    .status { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); margin: 0; }
    .reason { margin: 0; color: var(--ink-muted); }
    .actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
  `,
})
export class PublishResult {
  readonly draft = input.required<ReviewDraft>();
  readonly result = input.required<Result>();
  readonly restart = output<void>();
  /** Volver al paso 4 con lo escrito, para corregir una reseña rechazada. */
  readonly edit = output<void>();

  private readonly locale = inject(LOCALE_ID);
  protected readonly meta = computed(() => draftMeta(this.draft()));
  protected readonly footer = computed(() =>
    this.result().estado === 'publicada'
      ? `Publicada en ${formatDate(new Date(), "MMMM 'de' y", this.locale)}`
      : undefined,
  );
}

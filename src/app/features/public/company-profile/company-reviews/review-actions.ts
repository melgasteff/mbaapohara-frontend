import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideCircleCheck, LucideFlag } from '@lucide/angular';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { PublicReviewsApi } from '../../../../core/api/public-reviews-api';
import { SessionService } from '../../../../core/auth/session.service';
import { REPORT_CATEGORIES, REPORT_LABELS, ReportCategory } from '../../../../core/models/moderation';

/**
 * Acciones de una reseña publicada (3.9b): reportarla (con sesión) y, para la empresa, pedir una revisión con el
 * formulario público. La reseña sigue visible mientras se revisa (política de moderación, sección 8).
 */
@Component({
  selector: 'app-review-actions',
  imports: [ReactiveFormsModule, RouterLink, LucideFlag, LucideCircleAlert, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (done(); as message) {
      <p class="body-sm ok" role="status"><svg lucideCircleCheck [size]="16" aria-hidden="true"></svg>{{ message }}</p>
    } @else if (open()) {
      <form class="report" (submit)="send($event)" novalidate>
        <fieldset>
          <legend class="body-sm"><strong>¿Qué regla rompe esta reseña?</strong></legend>
          @for (category of categories; track category) {
            <label class="body-sm choice">
              <input type="radio" [value]="category" [formControl]="reportCategory" [name]="'motivo-' + reviewId()" />{{ labels[category] }}
            </label>
          }
        </fieldset>
        <div class="mb-field" [class.mb-field-error]="commentMissing()">
          <label [for]="'comentario-' + reviewId()">Comentario {{ reportCategory.value === 'OTRO' ? '' : '(opcional)' }}</label>
          <textarea [id]="'comentario-' + reviewId()" class="mb-input" rows="2" maxlength="500" [formControl]="comment"></textarea>
          @if (commentMissing()) { <span class="mb-help">Contanos por qué la reportás.</span> }
        </div>
        <p class="body-sm hint">La reseña sigue visible mientras la revisamos. Una reseña no se retira por ser negativa.</p>
        @if (error(); as message) {
          <p class="body-sm error" role="alert"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>{{ message }}</p>
        }
        <div class="buttons">
          <button type="submit" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="sending() || !reportCategory.value">Enviar reporte</button>
          <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="open.set(false)">Cancelar</button>
        </div>
      </form>
    } @else {
      <div class="links">
        @if (session.isAuthenticated()) {
          <button type="button" class="mb-btn mb-btn-ghost mb-btn-sm" (click)="open.set(true)">
            <svg lucideFlag [size]="16" aria-hidden="true"></svg>Reportar
          </button>
        } @else {
          <a class="mb-btn mb-btn-ghost mb-btn-sm" routerLink="/ingresar" [queryParams]="{ volver: returnUrl() }">
            <svg lucideFlag [size]="16" aria-hidden="true"></svg>Reportar
          </a>
        }
        <a class="mb-link body-sm" routerLink="/solicitud-revision" [queryParams]="{ tipo: 'revision_resena', resena: reviewId() }">
          ¿Sos de la empresa? Pedí una revisión
        </a>
      </div>
    }
  `,
  styles: `
    :host { display: block; border-top: 1px solid var(--line); padding-top: var(--space-3); }
    .links { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-2); }
    .report { display: flex; flex-direction: column; gap: var(--space-3); }
    fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: var(--space-1); }
    legend { padding: 0; margin-bottom: var(--space-1); }
    .choice { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .choice input { accent-color: var(--yerba); margin: 0; }
    .mb-field { width: 100%; }
    .hint { margin: 0; color: var(--ink-muted); }
    .buttons { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .ok, .error { display: flex; align-items: center; gap: var(--space-1); margin: 0; }
    .ok { color: var(--success); }
    .error { color: var(--danger); }
  `,
})
export class ReviewActions {
  readonly reviewId = input.required<number>();

  protected readonly session = inject(SessionService);
  private readonly api = inject(PublicReviewsApi);
  private readonly router = inject(Router);

  protected readonly categories = REPORT_CATEGORIES;
  protected readonly labels = REPORT_LABELS;
  protected readonly open = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal<string | null>(null);
  protected readonly attempted = signal(false);

  protected readonly reportCategory = new FormControl<ReportCategory | null>(null, Validators.required);
  protected readonly comment = new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) });

  /** Volver a esta misma página después de ingresar. */
  protected readonly returnUrl = computed(() => this.router.url.split('#')[0]);

  protected commentMissing(): boolean {
    return this.attempted() && this.reportCategory.value === 'OTRO' && !this.comment.value.trim();
  }

  protected send(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    const category = this.reportCategory.value;
    if (!category || this.commentMissing()) return;
    this.sending.set(true);
    this.error.set(null);
    this.api.report(this.reviewId(), category, this.comment.value.trim() || undefined).subscribe({
      next: ({ mensaje }) => {
        this.sending.set(false);
        this.done.set(mensaje);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideChevronLeft, LucideChevronRight, LucideCircleAlert, LucideCircleCheck, LucideClock, LucideEyeOff } from '@lucide/angular';
import { Observable } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CATEGORIES, CATEGORY_LABELS, FAILURE_LABELS, QueueItem, REJECTION_MESSAGES, RULE_LABELS } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage } from '../api-error';
import { Notice } from '../status';

/** Plazo que se le anuncia a la persona (política de moderación, sección 6). */
export const TARGET_HOURS = 48;

/** Confianzas del modelo de mayor a menor, como porcentaje. */
export function sortedScores(item: QueueItem): { category: ModerationCategory; label: string; percent: number }[] {
  const scores = item.senales?.scores;
  if (!scores) return [];
  return CATEGORIES.map((category) => ({ category, label: CATEGORY_LABELS[category], percent: Math.round((scores[category] ?? 0) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

/**
 * Cola de revisión humana (política de moderación, sección 6; tarea 3.9a): el texto, las señales de la moderación
 * automática y las acciones publicar o rechazar con una categoría y un motivo. No muestra quién escribió.
 */
@Component({
  selector: 'app-moderation-queue',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    PageState,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideClock,
    LucideEyeOff,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../admin.css', './moderation-queue.css'],
  host: { class: 'admin-screen' },
  templateUrl: './moderation-queue.html',
})
export class ModerationQueue {
  private readonly api = inject(ModerationAdminApi);

  protected readonly page = signal(1);
  protected readonly queue = this.api.queueResource(this.page);
  protected readonly busy = signal<number | null>(null);
  protected readonly notice = signal<Notice | null>(null);

  protected readonly categories = CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly ruleLabels = RULE_LABELS;
  protected readonly failureLabels = FAILURE_LABELS;
  protected readonly targetHours = TARGET_HOURS;
  protected readonly scores = sortedScores;

  /** Categoría anterior, para saber si el motivo es el mensaje propuesto o uno escrito a mano. */
  private lastCategory: ModerationCategory = 'DP';
  /** Versión cuyo rechazo se está escribiendo. */
  protected readonly rejecting = signal<number | null>(null);
  protected readonly category = new FormControl<ModerationCategory>('DP', { nonNullable: true });
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
  });

  constructor() {
    // Al cambiar de categoría se propone su mensaje, salvo que se haya escrito otro.
    this.category.valueChanges.pipe(takeUntilDestroyed()).subscribe((current) => {
      if (this.reason.value.trim() === REJECTION_MESSAGES[this.lastCategory]) this.reason.setValue(REJECTION_MESSAGES[current]);
      this.lastCategory = current;
    });
  }

  protected publish(item: QueueItem): void {
    this.run(item, this.api.publish(item.idVersion), `Publicaste la reseña de ${item.empresa.nombre}.`);
  }

  /** Abre el rechazo con la categoría que marcó la moderación y su mensaje de la política. */
  protected startReject(item: QueueItem): void {
    const category = item.senales?.category ?? 'TER';
    this.lastCategory = category;
    this.category.setValue(category, { emitEvent: false });
    this.reason.reset(REJECTION_MESSAGES[category]);
    this.rejecting.set(item.idVersion);
  }

  protected confirmReject(event: Event, item: QueueItem): void {
    event.preventDefault();
    this.reason.markAsTouched();
    if (this.reason.invalid) return;
    this.run(
      item,
      this.api.reject(item.idVersion, this.category.value, this.reason.value.trim()),
      `Rechazaste la reseña de ${item.empresa.nombre}. Quien la escribió va a ver el motivo.`,
    );
  }

  protected goToPage(page: number): void {
    this.page.set(Math.max(1, page));
  }

  protected totalPages(): number {
    if (!this.queue.hasValue()) return 1;
    const { total, pageSize } = this.queue.value();
    return Math.max(1, Math.ceil(total / pageSize));
  }

  private run(item: QueueItem, action: Observable<unknown>, success: string): void {
    this.busy.set(item.idVersion);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.rejecting.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.queue.reload();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
        // Otra decisión pudo llegar antes: se vuelve a pedir la cola.
        this.queue.reload();
      },
    });
  }
}

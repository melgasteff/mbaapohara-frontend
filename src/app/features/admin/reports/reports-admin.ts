import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideChevronLeft, LucideChevronRight, LucideCircleAlert, LucideCircleCheck, LucideEyeOff } from '@lucide/angular';
import { Observable } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CATEGORIES, CATEGORY_LABELS, REJECTION_MESSAGES, REPORT_LABELS, ReportedReview } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice } from '../status';

/** Categoría más reportada que corresponde a la política (para proponer el motivo del retiro). */
export function mostReported(item: ReportedReview): ModerationCategory {
  const counts = new Map<ModerationCategory, number>();
  for (const { categoria } of item.reportes) {
    if (categoria !== 'OTRO') counts.set(categoria, (counts.get(categoria) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'TER';
}

/**
 * Reportes de reseñas publicadas (política de moderación, sección 8; 3.9b), agrupados por reseña. Mantener cierra
 * los reportes; retirar oculta la reseña con un motivo que lee quien la escribió. No muestra quién reportó ni el autor.
 */
@Component({
  selector: 'app-reports-admin',
  imports: [DatePipe, ReactiveFormsModule, PageState, LucideCircleAlert, LucideCircleCheck, LucideEyeOff, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../admin.css', '../moderation-queue/moderation-queue.css'],
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Reportes</h1>
    <p class="body">
      Reseñas publicadas que alguien reportó. Siguen visibles mientras decidís. Retirá una reseña solo si incumple las reglas,
      nunca por ser negativa.
    </p>
    <p class="mb-help anon"><svg lucideEyeOff [size]="16" aria-hidden="true"></svg>No se muestra quién escribió la reseña ni quién la reportó.</p>

    <div role="status">
      @if (notice(); as n) {
        <p class="notice body-sm" [class.notice--ok]="n.kind === 'ok'" [class.notice--error]="n.kind === 'error'">
          @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          {{ n.text }}
        </p>
      }
    </div>

    @if (reports.error()) {
      <app-page-state kind="error" title="No pudimos cargar los reportes." (retry)="reports.reload()" />
    } @else if (reports.hasValue()) {
      @if (reports.value().total === 0) {
        <app-page-state kind="empty" title="No hay reportes pendientes." />
      } @else {
        <ul class="rows">
          @for (item of reports.value().data; track item.idResena) {
            <li class="item">
              <div class="item__head">
                <div class="row__main">
                  <span class="row__title">{{ item.empresa.nombre }} · {{ item.local.nombre }}, {{ item.local.ciudad }}</span>
                  <span class="mb-meta"><span>Primer reporte: {{ item.primerReporte | date: 'short' }}</span></span>
                </div>
                <span class="mb-tag mb-tag-warning">{{ item.cantidad }} {{ item.cantidad === 1 ? 'reporte' : 'reportes' }}</span>
              </div>

              @if (item.publicada) {
                <div class="texts">
                  <div><strong class="body-sm">Lo bueno</strong><p class="body">{{ item.loBueno }}</p></div>
                  <div><strong class="body-sm">A mejorar</strong><p class="body">{{ item.aMejorar }}</p></div>
                </div>
              } @else {
                <p class="body-sm hint">Esta reseña ya no está publicada. Podés cerrar sus reportes.</p>
              }

              <section class="signals" aria-label="Reportes recibidos">
                <h2 class="signals__title">Qué reportaron</h2>
                <ul class="signals__list body-sm">
                  @for (entry of item.reportes; track $index) {
                    <li>
                      {{ reportLabels[entry.categoria] }}
                      @if (entry.comentario) { : «{{ entry.comentario }}» }
                    </li>
                  }
                </ul>
              </section>

              @if (retiring() === item.idResena) {
                <form class="reject" (submit)="confirmRetire($event, item)" novalidate>
                  <div class="mb-field">
                    <label [for]="'cat-' + item.idResena">Regla que incumple</label>
                    <select [id]="'cat-' + item.idResena" class="mb-input" [formControl]="category">
                      @for (c of categories; track c) { <option [value]="c">{{ categoryLabels[c] }}</option> }
                    </select>
                  </div>
                  <div class="mb-field" [class.mb-field-error]="reason.invalid && reason.touched">
                    <label [for]="'motivo-' + item.idResena">Motivo que va a leer quien la escribió</label>
                    <textarea [id]="'motivo-' + item.idResena" class="mb-input" rows="3" maxlength="500" [formControl]="reason"></textarea>
                    <span class="mb-help">De 10 a 500 caracteres. Puede corregirla y volver a enviarla.</span>
                  </div>
                  <div class="row__actions">
                    <button type="submit" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === item.idResena">Retirar la reseña</button>
                    <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="retiring.set(null)">Cancelar</button>
                  </div>
                </form>
              } @else {
                <div class="row__actions">
                  <button type="button" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === item.idResena" (click)="keep(item)">Mantener</button>
                  @if (item.publicada) {
                    <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="busy() === item.idResena" (click)="startRetire(item)">Retirar…</button>
                  }
                </div>
              }
            </li>
          }
        </ul>
        @if (totalPages() > 1) {
          <nav class="pager" aria-label="Páginas de reportes">
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() <= 1" (click)="page.set(page() - 1)">
              <svg lucideChevronLeft [size]="16" aria-hidden="true"></svg>Anterior
            </button>
            <span class="body-sm">Página {{ page() }} de {{ totalPages() }}</span>
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">
              Siguiente<svg lucideChevronRight [size]="16" aria-hidden="true"></svg>
            </button>
          </nav>
        }
      }
    } @else {
      <app-page-state kind="loading" message="Cargando reportes…" />
    }
  `,
})
export class ReportsAdmin {
  private readonly api = inject(ModerationAdminApi);
  protected readonly page = signal(1);
  protected readonly reports = this.api.reportsResource(this.page);
  protected readonly busy = signal<number | null>(null);
  protected readonly notice = signal<Notice | null>(null);
  protected readonly retiring = signal<number | null>(null);

  protected readonly categories = CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly reportLabels = REPORT_LABELS;
  protected readonly category = new FormControl<ModerationCategory>('TER', { nonNullable: true });
  protected readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)] });

  protected totalPages(): number {
    if (!this.reports.hasValue()) return 1;
    const { total, pageSize } = this.reports.value();
    return Math.max(1, Math.ceil(total / pageSize));
  }

  protected keep(item: ReportedReview): void {
    if (!confirmAction(`¿Mantener la reseña de ${item.empresa.nombre}? Se cierran sus ${item.cantidad} reportes.`)) return;
    this.run(item, this.api.keepReported(item.idResena), `Mantuviste la reseña de ${item.empresa.nombre}.`);
  }

  protected startRetire(item: ReportedReview): void {
    const category = mostReported(item);
    this.category.setValue(category);
    this.reason.reset(REJECTION_MESSAGES[category]);
    this.retiring.set(item.idResena);
  }

  protected confirmRetire(event: Event, item: ReportedReview): void {
    event.preventDefault();
    this.reason.markAsTouched();
    if (this.reason.invalid) return;
    this.run(
      item,
      this.api.retire(item.idResena, this.category.value, this.reason.value.trim()),
      `Retiraste la reseña de ${item.empresa.nombre}. Quien la escribió va a ver el motivo.`,
    );
  }

  private run(item: ReportedReview, action: Observable<unknown>, success: string): void {
    this.busy.set(item.idResena);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.retiring.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.reports.reload();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
        this.reports.reload();
      },
    });
  }
}

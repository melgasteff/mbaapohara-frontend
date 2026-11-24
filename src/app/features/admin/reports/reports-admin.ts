import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideEyeOff, LucideMinus, LucidePlus } from '@lucide/angular';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { REPORT_LABELS, ReportCategory, ReportedReview } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Pager } from '../../../shared/ui/pager/pager';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { RejectForm, Rejection } from '../reject-form/reject-form';

/** Categoría más reportada que corresponde a la política (para proponer el motivo del retiro). */
export function mostReported(item: ReportedReview): ModerationCategory {
  const counts = new Map<ModerationCategory, number>();
  for (const { categoria } of item.reportes) {
    if (categoria !== 'OTRO') counts.set(categoria, (counts.get(categoria) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'TER';
}

/** «Nombra o señala a una persona (2) · Otro motivo (1)», de la más reportada a la menos. */
export function reportSummary(item: ReportedReview): string {
  const counts = new Map<ReportCategory, number>();
  for (const { categoria } of item.reportes) counts.set(categoria, (counts.get(categoria) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `${REPORT_LABELS[category]} (${count})`)
    .join(' · ');
}

/**
 * Reportes de reseñas publicadas (política de moderación, sección 8; 3.9b), agrupados por reseña. Mantener cierra
 * los reportes; retirar oculta la reseña con un motivo que lee quien la escribió. No muestra quién reportó ni el autor.
 */
@Component({
  selector: 'app-reports-admin',
  imports: [DatePipe, PageState, Pager, InlineConfirm, AdminNotice, RejectForm, LucideEyeOff, LucidePlus, LucideMinus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <div class="head">
      <h1 class="title" tabindex="-1">Reportes</h1>
      <p class="anon"><svg lucideEyeOff [size]="16" aria-hidden="true"></svg>No se muestra quién escribió ni quién reportó</p>
    </div>
    <p class="lead">
      Agrupados por reseña. Se decide con las mismas reglas de la moderación, nunca por ser negativa. Mientras tanto, la reseña sigue visible.
    </p>
    <app-admin-notice [notice]="actions.notice()" />

    @if (reports.error()) {
      <app-page-state kind="error" title="No pudimos cargar los reportes." (retry)="reports.reload()" />
    } @else if (data(); as result) {
      @if (result.total === 0) {
        <app-page-state kind="empty" title="No hay reportes pendientes" />
      } @else {
        <ul class="rows">
          @for (item of result.data; track item.idResena) {
            @let key = 'mantener-' + item.idResena;
            <li>
              <div class="row">
                <div class="row__main">
                  <h2 class="row__title">{{ item.empresa.nombre }} · {{ item.local.nombre }}, {{ item.local.ciudad }}</h2>
                  <p class="small">{{ summary(item) }} · desde el {{ item.primerReporte | date: 'shortDate' }}</p>
                </div>
                <span class="mb-tag mb-tag-naranja">{{ item.cantidad }} {{ item.cantidad === 1 ? 'reporte' : 'reportes' }}</span>
                <div class="row__actions">
                  <button type="button" class="mb-btn mb-btn-secondary" [attr.data-accion]="key" (click)="askKeep(item)">
                    {{ actions.busy() === key ? 'Cerrando…' : 'Mantener' }}<span class="visually-hidden"> la reseña sobre {{ item.empresa.nombre }}</span>
                  </button>
                  @if (item.publicada) {
                    <button type="button" class="mb-btn mb-btn-borrar" [attr.data-accion]="'retirar-' + item.idResena" [attr.aria-expanded]="retiring() === item.idResena" (click)="startRetire(item)">
                      Retirar…<span class="visually-hidden"> la reseña sobre {{ item.empresa.nombre }}</span>
                    </button>
                  }
                </div>
              </div>
              @if (actions.confirming() === key) {
                <app-inline-confirm
                  tone="neutro"
                  confirmLabel="Sí, mantener"
                  [message]="'¿Mantener la reseña? Se ' + (item.cantidad === 1 ? 'cierra su reporte.' : 'cierran sus ' + item.cantidad + ' reportes.')"
                  (confirmed)="keep(item)"
                  (cancelled)="actions.cancel()"
                />
              }
              @if (item.publicada) {
                <div class="texts">
                  <div><strong class="mb-pro"><svg lucidePlus [size]="18" aria-hidden="true"></svg>Lo bueno</strong><p>{{ item.loBueno }}</p></div>
                  <div><strong class="mb-con"><svg lucideMinus [size]="18" aria-hidden="true"></svg>A mejorar</strong><p>{{ item.aMejorar }}</p></div>
                </div>
              } @else {
                <p class="small">Esta reseña ya no está publicada. Podés cerrar sus reportes con «Mantener».</p>
              }
              @if (comments(item); as list) {
                @if (list.length) {
                  <ul class="bullets small" aria-label="Comentarios de los reportes">
                    @for (comment of list; track $index) { <li>«{{ comment }}»</li> }
                  </ul>
                }
              }
              @if (retiring() === item.idResena) {
                <app-reject-form
                  categoryLabel="Regla que incumple"
                  submitLabel="Retirar la reseña"
                  [initial]="mostReported(item)"
                  [busy]="actions.busy() !== null"
                  (confirmed)="retire(item, $event)"
                  (cancelled)="cancelRetire(item)"
                />
              }
            </li>
          }
        </ul>
        <app-pager label="Páginas de reportes" [page]="page()" [pageSize]="result.pageSize" [total]="result.total" (pageChange)="page.set($event)" />
      }
    } @else {
      <app-page-state kind="loading" message="Cargando reportes…" />
    }
  `,
})
export class ReportsAdmin {
  private readonly api = inject(ModerationAdminApi);
  protected readonly actions = inject(AdminActions);
  protected readonly page = signal(1);
  protected readonly reports = this.api.reportsResource(this.page);
  protected readonly data = keepWhileLoading(this.reports);
  /** Reseña cuyo retiro se está escribiendo. */
  protected readonly retiring = signal<number | null>(null);
  protected readonly mostReported = mostReported;
  protected readonly summary = reportSummary;

  protected comments(item: ReportedReview): string[] {
    return item.reportes.flatMap(({ comentario }) => (comentario ? [comentario] : []));
  }

  protected askKeep(item: ReportedReview): void {
    this.retiring.set(null);
    this.actions.ask(`mantener-${item.idResena}`);
  }

  protected keep(item: ReportedReview): void {
    this.run(`mantener-${item.idResena}`, this.api.keepReported(item.idResena), `Mantuviste la reseña sobre ${item.empresa.nombre}.`);
  }

  protected startRetire(item: ReportedReview): void {
    if (this.actions.busy() !== null) return;
    this.actions.confirming.set(null);
    this.retiring.set(item.idResena);
  }

  protected cancelRetire(item: ReportedReview): void {
    this.retiring.set(null);
    this.actions.focus(`[data-accion="retirar-${item.idResena}"]`);
  }

  protected retire(item: ReportedReview, { categoria, motivo }: Rejection): void {
    this.run(
      `retirar-${item.idResena}`,
      this.api.retire(item.idResena, categoria, motivo),
      `Retiraste la reseña sobre ${item.empresa.nombre}. Quien la escribió ve el motivo.`,
    );
  }

  private run(key: string, action: ReturnType<ModerationAdminApi['retire']>, success: string): void {
    const reload = () => {
      // Si era la única de la página, se vuelve a la anterior.
      if (this.data()?.data.length === 1 && this.page() > 1) this.page.update((page) => page - 1);
      else this.reports.reload();
    };
    this.actions.run(key, action, success, {
      done: () => {
        this.retiring.set(null);
        reload();
        this.actions.focus('h1');
      },
      failed: () => this.reports.reload(),
    });
  }
}

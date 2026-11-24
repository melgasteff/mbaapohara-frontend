import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { LucideEyeOff, LucideMinus, LucidePlus } from '@lucide/angular';
import { Observable } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CATEGORIES, CATEGORY_LABELS, FAILURE_LABELS, QueueItem, RULE_LABELS } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Pager } from '../../../shared/ui/pager/pager';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { RejectForm, Rejection } from '../reject-form/reject-form';

/** Objetivo interno para resolver una reseña (política de moderación, sección 6). */
export const TARGET_HOURS = 48;
const PAGE_SIZE = 10;

/** Confianzas del modelo de mayor a menor, como porcentaje. */
export function sortedScores(item: QueueItem): { category: ModerationCategory; label: string; percent: number }[] {
  const scores = item.senales?.scores;
  if (!scores) return [];
  return CATEGORIES.map((category) => ({ category, label: CATEGORY_LABELS[category], percent: Math.round((scores[category] ?? 0) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

/** Por qué está en la fila, en una línea: categoría y regla, o la falla del modelo. */
export function shortReason(item: QueueItem): string {
  const signals = item.senales;
  if (!signals) return 'Sin registro de la revisión automática';
  const parts = [
    ...(signals.category ? [CATEGORY_LABELS[signals.category]] : []),
    ...signals.rules.map((rule) => RULE_LABELS[rule] ?? rule),
    ...(signals.failure ? [FAILURE_LABELS[signals.failure] ?? signals.failure] : []),
  ];
  return parts.join(' · ') || 'Para revisar';
}

/**
 * Revisión humana (política de moderación, sección 6; tarea 3.9a) en dos paneles: la fila, con la más antigua primero, y la
 * reseña elegida. Al decidir pasa a la siguiente. No muestra quién escribió.
 */
@Component({
  selector: 'app-moderation-queue',
  imports: [DatePipe, PageState, Pager, AdminNotice, RejectForm, LucideEyeOff, LucidePlus, LucideMinus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrls: ['../admin.css', './moderation-queue.css'],
  host: { class: 'admin-screen' },
  templateUrl: './moderation-queue.html',
})
export class ModerationQueue {
  private readonly api = inject(ModerationAdminApi);
  protected readonly actions = inject(AdminActions);

  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly queue = this.api.queueResource(this.page);
  private readonly data = keepWhileLoading(this.queue);
  /** Ya decididas: salen de la fila sin esperar a que se vuelva a pedir. */
  private readonly resolved = signal<ReadonlySet<number>>(new Set());
  protected readonly loaded = computed(() => this.data() !== undefined);
  protected readonly items = computed(() => (this.data()?.data ?? []).filter((item) => !this.resolved().has(item.idVersion)));
  protected readonly total = computed(() => {
    const page = this.data();
    if (!page) return 0;
    return Math.max(0, page.total - (page.data.length - this.items().length));
  });

  private readonly selectedId = signal<number | null>(null);
  private readonly index = signal(0);
  /** La elegida; si ya no está, la que quedó en su lugar. */
  protected readonly selected = computed<QueueItem | undefined>(() => {
    const items = this.items();
    return items.find((item) => item.idVersion === this.selectedId()) ?? items[Math.min(this.index(), items.length - 1)];
  });
  protected readonly rejecting = signal(false);

  protected readonly targetHours = TARGET_HOURS;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly ruleLabels = RULE_LABELS;
  protected readonly failureLabels = FAILURE_LABELS;
  protected readonly shortReason = shortReason;
  protected readonly scores = computed(() => {
    const item = this.selected();
    return item ? sortedScores(item) : [];
  });
  /** La confianza de la categoría marcada o, si no hay, la más alta. */
  protected readonly mainScore = computed(() => {
    const scores = this.scores();
    const marked = this.selected()?.senales?.category;
    return scores.find((score) => score.category === marked) ?? scores[0];
  });

  constructor() {
    // Si se decidió la última de una página que no es la primera, se vuelve a la anterior.
    effect(() => {
      const empty = this.queue.hasValue() && this.queue.value().data.length === 0 && this.page() > 1;
      if (empty) untracked(() => this.page.update((page) => page - 1));
    });
  }

  protected wait(item: QueueItem): string {
    if (item.horasEsperando >= TARGET_HOURS) return `Más de ${TARGET_HOURS} h`;
    return item.horasEsperando < 1 ? 'Hace menos de 1 h' : `Hace ${item.horasEsperando} h`;
  }

  protected meta(item: QueueItem): string {
    return [
      item.situacion === 'ACTUAL' ? 'Trabaja aquí' : 'Trabajó aquí',
      item.cargo.descripcion + (item.cargo.aprobado ? '' : ' (cargo propuesto, pendiente)'),
      `${item.local.nombre}, ${item.local.ciudad}`,
      ...(item.situacion === 'ANTERIOR' && item.ultimoAnio ? [`hasta ${item.ultimoAnio}`] : []),
      item.tipoContrato.nombre,
      item.modalidad.nombre,
      `${item.calificacion} de 5 estrellas`,
    ].join(' · ');
  }

  protected select(item: QueueItem, index: number): void {
    this.selectedId.set(item.idVersion);
    this.index.set(index);
    this.rejecting.set(false);
    this.actions.notice.set(null);
    this.actions.focus('.detail h2');
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    this.selectedId.set(null);
    this.index.set(0);
    this.rejecting.set(false);
  }

  protected startReject(): void {
    if (this.actions.busy() === null) this.rejecting.set(true);
  }

  protected cancelReject(): void {
    this.rejecting.set(false);
    this.actions.focus('[data-accion="rechazar"]');
  }

  protected publish(item: QueueItem): void {
    this.decide(item, this.api.publish(item.idVersion), `Publicaste la reseña sobre ${item.empresa.nombre}.`);
  }

  protected reject(item: QueueItem, { categoria, motivo }: Rejection): void {
    this.decide(item, this.api.reject(item.idVersion, categoria, motivo), `Pediste un cambio en la reseña sobre ${item.empresa.nombre}. Quien la escribió ve el motivo.`);
  }

  private decide(item: QueueItem, action: Observable<unknown>, success: string): void {
    const position = this.items().findIndex((other) => other.idVersion === item.idVersion);
    const more = this.items().length > 1;
    this.actions.run(`decidir-${item.idVersion}`, action, success + (more ? ' Sigue la próxima de la fila.' : ''), {
      done: () => {
        this.index.set(Math.max(0, position));
        this.selectedId.set(null);
        this.rejecting.set(false);
        this.resolved.update((set) => new Set(set).add(item.idVersion));
        this.queue.reload();
        this.actions.focus(more ? '.detail h2' : 'h1');
      },
      // Otra decisión pudo llegar antes: se vuelve a pedir la fila.
      failed: () => this.queue.reload(),
    });
  }
}

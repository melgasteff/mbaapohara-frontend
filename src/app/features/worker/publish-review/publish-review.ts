import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideArrowRight, LucideCircleAlert, LucideLock } from '@lucide/angular';
import { finalize } from 'rxjs';
import { apiErrorMessage, apiProblems, isConflict } from '../../../core/api/api-error';
import { ContractTypesApi } from '../../../core/api/contract-types-api';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { JobsApi } from '../../../core/api/jobs-api';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { WorkModesApi } from '../../../core/api/work-modes-api';
import { PublishResult as Result, ReviewDraft } from '../../../core/models/review';
import { toId } from '../../../shared/route-params';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { applyCriteriaConfig, createReviewForm, fromMyReview, linkConditionalFields, toDraft } from './review-form';
import { PublishResult } from './steps/publish-result';
import { StepCriteria } from './steps/step-criteria';
import { StepPlace } from './steps/step-place';
import { StepRating } from './steps/step-rating';
import { StepRelation } from './steps/step-relation';

const STEPS = ['Empresa y local', 'Relación laboral', 'Cumplimiento', 'Calificación y experiencia'] as const;
type StepGroup = 'lugar' | 'relacion' | 'criterios' | 'texto';
const GROUPS: StepGroup[] = ['lugar', 'relacion', 'criterios', 'texto'];

/** Error de un envío, para mostrarlo con lo que hay que corregir. */
interface SendError {
  message: string;
  problems: string[];
  /** Ya hay una reseña de ese local: se ofrece ir a «Mis reseñas». */
  conflict: boolean;
}

/**
 * Asistente de publicación en 4 pasos (1.7; real desde la 3.3 y la 3.4). Con `/publicar/:id/editar` edita una
 * reseña propia: carga su última versión y empieza en el paso 2, porque el local no se cambia.
 */
@Component({
  selector: 'app-publish-review',
  imports: [
    RouterLink,
    PageState,
    StepPlace,
    StepRelation,
    StepCriteria,
    StepRating,
    PublishResult,
    LucideLock,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCircleAlert,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './publish-review.css',
  templateUrl: './publish-review.html',
})
export class PublishReview {
  /** Id de la reseña a editar (ruta `/publicar/:id/editar`); sin él, es una reseña nueva. */
  readonly id = input(undefined, { transform: toId });

  private readonly reviews = inject(ReviewsApi);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  protected readonly config = inject(CriteriaApi).configResource();
  protected readonly jobs = inject(JobsApi).allResource();
  protected readonly contractTypes = inject(ContractTypesApi).allResource();
  protected readonly workModes = inject(WorkModesApi).allResource();
  /** Mis reseñas, solo en modo edición (sin id no se pide): de ahí sale la versión a editar. */
  protected readonly mine = rxResource({
    params: () => this.id(),
    stream: () => this.reviews.mine(),
  });

  protected readonly form = createReviewForm();
  protected readonly steps = STEPS;
  /** Paso actual, de 1 a 4. */
  protected readonly step = signal(1);
  /** Pasos en los que la persona intentó avanzar: ahí se muestran todos los errores. */
  protected readonly attempted = signal<ReadonlySet<number>>(new Set());
  protected readonly sending = signal(false);
  protected readonly sendError = signal<SendError | null>(null);
  protected readonly published = signal<{ draft: ReviewDraft; result: Result } | null>(null);
  /** Reseña ya guardada: la edición o una reseña rechazada que se corrige se envían con PUT. */
  private readonly savedId = signal<number | null>(null);

  private readonly stepHeading = viewChild<ElementRef<HTMLElement>>('stepHeading');

  protected readonly editing = computed(() => this.id() !== undefined);
  /** La reseña a editar, si es de esta persona. */
  protected readonly editable = computed(() => {
    const id = this.id();
    return id === undefined || !this.mine.hasValue() ? undefined : this.mine.value().find((review) => review.id === id);
  });
  /** En la edición el paso 1 (el local) no se cambia. */
  protected readonly firstStep = computed(() => (this.editing() ? 2 : 1));

  /** Todo lo que el asistente necesita para empezar. */
  protected readonly ready = computed(
    () =>
      this.config.hasValue() &&
      this.jobs.hasValue() &&
      this.contractTypes.hasValue() &&
      this.workModes.hasValue() &&
      (!this.editing() || this.mine.hasValue()),
  );
  protected readonly loadError = computed(
    () =>
      !!(this.config.error() || this.jobs.error() || this.contractTypes.error() || this.workModes.error() || this.mine.error()),
  );
  /** Motivo por el que no se puede editar: no es una reseña propia, o está en revisión. */
  protected readonly cannotEdit = computed<'not-found' | 'in-review' | null>(() => {
    if (!this.editing() || !this.ready() || this.published()) return null;
    const review = this.editable();
    if (!review) return 'not-found';
    return review.ultimaVersion.estado === 'en_revision' ? 'in-review' : null;
  });

  constructor() {
    linkConditionalFields(this.form, inject(DestroyRef));
    effect(() => {
      if (this.config.hasValue()) applyCriteriaConfig(this.form, this.config.value());
    });
    // Modo edición: carga la versión una sola vez, cuando ya están los criterios y los cargos.
    let loaded = false;
    effect(() => {
      const review = this.editable();
      if (loaded || !review || !this.config.hasValue() || !this.jobs.hasValue()) return;
      loaded = true;
      fromMyReview(this.form, review, this.jobs.value().data);
      this.savedId.set(review.id);
      this.step.set(2);
    });
  }

  protected showErrors(step: number): boolean {
    return this.attempted().has(step);
  }

  /** Grupo del formulario que corresponde al paso actual. */
  protected currentGroup() {
    return this.form.controls[GROUPS[this.step() - 1]];
  }

  protected next(): void {
    const group = this.currentGroup();
    if (group.invalid) {
      group.markAllAsTouched();
      this.attempted.update((set) => new Set(set).add(this.step()));
      return;
    }
    if (this.step() < STEPS.length) {
      this.goTo(this.step() + 1);
    } else {
      this.publish();
    }
  }

  protected back(): void {
    this.goTo(this.step() - 1);
  }

  /** Empieza una reseña nueva. Desde la edición, vuelve al asistente vacío. */
  protected restart(): void {
    if (this.editing()) {
      this.router.navigate(['/publicar']);
      return;
    }
    this.form.reset();
    this.attempted.set(new Set());
    this.published.set(null);
    this.savedId.set(null);
    this.sendError.set(null);
    this.goTo(1);
  }

  /** Vuelve al último paso con todo lo escrito, para corregir una reseña rechazada. */
  protected editRejected(): void {
    this.published.set(null);
    this.form.controls.texto.controls.aceptaReglas.setValue(false);
    this.goTo(STEPS.length);
  }

  protected reloadAll(): void {
    for (const resource of [this.config, this.jobs, this.contractTypes, this.workModes, this.mine]) {
      if (resource.error()) resource.reload();
    }
  }

  private publish(): void {
    const draft = toDraft(this.form, {
      jobs: this.jobs.value()!.data,
      contractTypes: this.contractTypes.value()!.data,
      workModes: this.workModes.value()!.data,
    });
    const savedId = this.savedId();
    this.sending.set(true);
    this.sendError.set(null);
    (savedId === null ? this.reviews.publish(draft) : this.reviews.update(savedId, draft))
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: (result) => {
          this.savedId.set(result.id);
          this.published.set({ draft, result });
          this.focusHeading();
        },
        error: (error: unknown) =>
          this.sendError.set({ message: apiErrorMessage(error), problems: apiProblems(error), conflict: isConflict(error) }),
      });
  }

  private goTo(step: number): void {
    this.step.set(step);
    this.focusHeading();
  }

  /** Lleva el foco y la vista al título del paso, para teclado y lector de pantalla. */
  private focusHeading(): void {
    afterNextRender(
      () => {
        const heading = this.stepHeading()?.nativeElement;
        heading?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      { injector: this.injector },
    );
  }
}

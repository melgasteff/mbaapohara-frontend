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
  signal,
  viewChild,
} from '@angular/core';
import { LucideArrowLeft, LucideArrowRight, LucideCircleAlert, LucideLock } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ContractTypesApi } from '../../../core/api/contract-types-api';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { JobsApi } from '../../../core/api/jobs-api';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { WorkModesApi } from '../../../core/api/work-modes-api';
import { PublishResult as Result, ReviewDraft } from '../../../core/models/review';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { applyCriteriaConfig, createReviewForm, linkConditionalFields, toDraft } from './review-form';
import { PublishResult } from './steps/publish-result';
import { StepCriteria } from './steps/step-criteria';
import { StepPlace } from './steps/step-place';
import { StepRating } from './steps/step-rating';
import { StepRelation } from './steps/step-relation';

const STEPS = ['Empresa y local', 'Relación laboral', 'Cumplimiento', 'Calificación y experiencia'] as const;
type StepGroup = 'lugar' | 'relacion' | 'criterios' | 'texto';
const GROUPS: StepGroup[] = ['lugar', 'relacion', 'criterios', 'texto'];

/**
 * Asistente de publicación en 4 pasos (1.7, paso 3 de FRONTEND-DEMO.md). Empresas, locales y catálogos son
 * reales; los criterios vienen del JSON provisional y el envío es simulado (ReviewsApi → MockReviewsApi).
 */
@Component({
  selector: 'app-publish-review',
  imports: [
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
  private readonly reviews = inject(ReviewsApi);
  private readonly injector = inject(Injector);

  protected readonly config = inject(CriteriaApi).configResource();
  protected readonly jobs = inject(JobsApi).allResource();
  protected readonly contractTypes = inject(ContractTypesApi).allResource();
  protected readonly workModes = inject(WorkModesApi).allResource();

  protected readonly form = createReviewForm();
  protected readonly steps = STEPS;
  /** Paso actual, de 1 a 4. */
  protected readonly step = signal(1);
  /** Pasos en los que la persona intentó avanzar: ahí se muestran todos los errores. */
  protected readonly attempted = signal<ReadonlySet<number>>(new Set());
  protected readonly sending = signal(false);
  protected readonly sendError = signal(false);
  protected readonly published = signal<{ draft: ReviewDraft; result: Result } | null>(null);

  private readonly stepHeading = viewChild<ElementRef<HTMLElement>>('stepHeading');

  /** Todo lo que el asistente necesita para empezar. */
  protected readonly ready = computed(
    () => this.config.hasValue() && this.jobs.hasValue() && this.contractTypes.hasValue() && this.workModes.hasValue(),
  );
  protected readonly loadError = computed(
    () => !!(this.config.error() || this.jobs.error() || this.contractTypes.error() || this.workModes.error()),
  );

  constructor() {
    linkConditionalFields(this.form, inject(DestroyRef));
    effect(() => {
      if (this.config.hasValue()) applyCriteriaConfig(this.form, this.config.value());
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

  protected restart(): void {
    this.form.reset();
    this.attempted.set(new Set());
    this.published.set(null);
    this.goTo(1);
  }

  protected reloadAll(): void {
    for (const resource of [this.config, this.jobs, this.contractTypes, this.workModes]) {
      if (resource.error()) resource.reload();
    }
  }

  private publish(): void {
    const draft = toDraft(this.form, {
      jobs: this.jobs.value()!.data,
      contractTypes: this.contractTypes.value()!.data,
      workModes: this.workModes.value()!.data,
    });
    this.sending.set(true);
    this.sendError.set(false);
    this.reviews
      .publish(draft)
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: (result) => {
          this.published.set({ draft, result });
          this.focusHeading();
        },
        error: () => this.sendError.set(true),
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

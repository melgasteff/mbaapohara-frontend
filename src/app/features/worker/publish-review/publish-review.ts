import { HttpErrorResponse } from '@angular/common/http';
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
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircleAlert } from '@lucide/angular';
import { finalize, map } from 'rxjs';
import { apiErrorMessage, apiProblems, isConflict } from '../../../core/api/api-error';
import { CompaniesApi } from '../../../core/api/companies-api';
import { ContractTypesApi } from '../../../core/api/contract-types-api';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { JobsApi } from '../../../core/api/jobs-api';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { WorkModesApi } from '../../../core/api/work-modes-api';
import { ReviewDraftStore, SavedDraft } from '../../../core/drafts/review-draft-store';
import { FocusExit } from '../../../core/layout/focus-exit';
import { PublishResult as Result, ReviewDraft } from '../../../core/models/review';
import { toId } from '../../../shared/route-params';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { advance, answeredCount, answerSummary, CriteriaPosition, enterCategory, enterCriteria, firstPending, totals } from './criteria-progress';
import {
  applyCriteriaConfig,
  createReviewForm,
  DraftLookups,
  fromMyReview,
  fromSavedDraft,
  hasContent,
  jobText,
  linkConditionalFields,
  missingMessage,
  previewMeta,
  resumeStep,
  toDraft,
  toSavedDraft,
} from './review-form';
import { ReviewPreview } from './review-preview/review-preview';
import { PublishResult } from './steps/publish-result';
import { StepCriteria } from './steps/step-criteria';
import { StepPlace } from './steps/step-place';
import { StepRating } from './steps/step-rating';
import { StepRelation } from './steps/step-relation';
import { WizardNav, WizardStep } from './wizard-nav/wizard-nav';

const STEPS = ['Empresa y local', 'Tu trabajo', 'Tus derechos', 'Tu opinión'] as const;
const CRITERIA_STEP = 3;
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
 * reseña propia: carga su última versión y empieza en el paso 2, porque el local no se cambia. Una reseña nueva se guarda
 * sola como borrador en este dispositivo; `?empresa=` la empieza con la empresa elegida.
 */
@Component({
  selector: 'app-publish-review',
  imports: [
    RouterLink,
    PageState,
    InlineConfirm,
    WizardNav,
    ReviewPreview,
    StepPlace,
    StepRelation,
    StepCriteria,
    StepRating,
    PublishResult,
    LucideArrowLeft,
    LucideCircleAlert,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './publish-review.css',
  templateUrl: './publish-review.html',
})
export class PublishReview {
  /** Id de la reseña a editar (ruta `/publicar/:id/editar`); sin él, es una reseña nueva. */
  readonly id = input(undefined, { transform: toId });
  /** Empresa elegida desde el perfil o el directorio (parámetro de la URL). */
  readonly empresa = input(undefined, { transform: toId });

  private readonly reviews = inject(ReviewsApi);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly drafts = inject(ReviewDraftStore);
  private readonly exit = inject(FocusExit);

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
  /** Valor del formulario como signal: de acá salen los resúmenes, la vista previa y el borrador. */
  protected readonly value = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  protected readonly stepCount = STEPS.length;
  /** Paso actual, de 1 a 4, y el más lejano al que se llegó. */
  protected readonly step = signal(1);
  protected readonly maxStep = signal(1);
  protected readonly position = signal<CriteriaPosition>({ categoria: 0, pregunta: 0, cerrada: false });
  /** Pasos en los que la persona intentó avanzar: ahí se muestran todos los errores. */
  protected readonly attempted = signal<ReadonlySet<number>>(new Set());
  /** Lo que falta para seguir, después de intentarlo. */
  protected readonly missing = signal('');
  protected readonly sending = signal(false);
  protected readonly sendError = signal<SendError | null>(null);
  protected readonly published = signal<{ draft: ReviewDraft; result: Result } | null>(null);
  /** Reseña ya guardada: la edición o una reseña rechazada que se corrige se envían con PUT. */
  private readonly savedId = signal<number | null>(null);

  // Comienzo de una reseña nueva.
  /** Borrador que se encontró al entrar. */
  protected readonly saved = signal<SavedDraft | null>(null);
  /** Hay un borrador de otra empresa: la persona elige con cuál sigue. */
  protected readonly choosing = signal(false);
  /** El comienzo está resuelto: desde acá se guarda el borrador. */
  protected readonly started = signal(false);
  /** Se retomó un borrador: se avisa y se ofrece empezar de nuevo. */
  protected readonly resumed = signal(false);
  protected readonly confirmRestart = signal(false);
  /** La empresa pedida o la del borrador ya no está publicada. */
  protected readonly companyGone = signal(false);
  private readonly restartButton = viewChild<ElementRef<HTMLButtonElement>>('restartButton');
  private readonly startCompany = signal<number | undefined>(undefined);
  private readonly companies = inject(CompaniesApi);
  protected readonly company = this.companies.detailResource(this.startCompany);

  protected readonly editing = computed(() => this.id() !== undefined);
  /** La reseña a editar, si es de esta persona. */
  protected readonly editable = computed(() => {
    const id = this.id();
    return id === undefined || !this.mine.hasValue() ? undefined : this.mine.value().find((review) => review.id === id);
  });
  /** En la edición el paso 1 (el local) no se cambia. */
  protected readonly firstStep = computed(() => (this.editing() ? 2 : 1));

  private readonly catalogsReady = computed(
    () => this.config.hasValue() && this.jobs.hasValue() && this.contractTypes.hasValue() && this.workModes.hasValue(),
  );
  /** Todo lo que el asistente necesita para empezar. */
  protected readonly ready = computed(() => this.catalogsReady() && (this.editing() ? this.mine.hasValue() : this.started()));
  /** La empresa del comienzo no se pudo pedir. Que ya no exista (404) no es un error: se elige otra. */
  private readonly companyError = computed(() => {
    const error = this.company.error();
    return !!error && !isNotFound(error);
  });
  protected readonly loadError = computed(
    () =>
      !!(
        this.config.error() || this.jobs.error() || this.contractTypes.error() || this.workModes.error() || this.mine.error() ||
        (!this.started() && this.companyError())
      ),
  );
  /** Motivo por el que no se puede editar: no es una reseña propia, o está en revisión. */
  protected readonly cannotEdit = computed<'not-found' | 'in-review' | null>(() => {
    if (!this.editing() || !this.ready() || this.published()) return null;
    const review = this.editable();
    if (!review) return 'not-found';
    return review.ultimaVersion.estado === 'en_revision' ? 'in-review' : null;
  });

  // Avance.
  protected readonly categories = computed(() => (this.config.hasValue() ? this.config.value().categorias : []));
  protected readonly totals = computed(() => totals(this.categories(), this.value().criterios));
  protected readonly categoryProgress = computed(() =>
    this.categories().map((category) => ({
      nombre: category.nombre,
      respondidas: answeredCount(category, this.value().criterios),
      total: category.items.length,
    })),
  );
  protected readonly navSteps = computed<WizardStep[]>(() => {
    const { lugar, texto } = this.value();
    const { respondidas, total } = this.totals();
    const details = [
      [lugar.empresa?.nombre, lugar.local?.nombre].filter(Boolean).join(' · '),
      this.jobName(),
      respondidas ? `${respondidas} de ${total} respuestas` : '',
      texto.calificacion ? `${texto.calificacion} ${texto.calificacion === 1 ? 'estrella' : 'estrellas'}` : '',
    ];
    return STEPS.map((nombre, index) => ({
      paso: index + 1,
      nombre,
      detalle: details[index],
      hecho: this.form.controls[GROUPS[index]].valid && (index + 1 < this.maxStep() || index + 1 < this.firstStep()),
      alcanzable: index + 1 >= this.firstStep() && index + 1 <= this.maxStep(),
    }));
  });
  protected readonly title = computed(() => {
    switch (this.step()) {
      case 1:
        return '¿Dónde trabajaste?';
      case 2:
        return 'Contanos de tu trabajo';
      case CRITERIA_STEP:
        return this.categories()[this.position().categoria]?.nombre ?? 'Tus derechos';
      default:
        return 'Tu opinión';
    }
  });
  protected readonly stepName = computed(() => STEPS[this.step() - 1]);
  protected readonly allAnswered = computed(() => this.totals().respondidas === this.totals().total);
  /** Categoría con la que se sigue después de cerrar la actual; `undefined` si no queda ninguna. */
  private readonly nextCategory = computed(() => this.categories()[firstPending(this.categories(), this.value().criterios)]);
  protected readonly nextLabel = computed(() => {
    if (this.step() === STEPS.length) return this.editing() ? 'Guardar cambios' : 'Enviar reseña';
    if (this.step() !== CRITERIA_STEP) return 'Seguir';
    if (this.allAnswered()) return 'Seguir con tu opinión';
    return this.position().cerrada ? `Seguir con ${this.nextCategory()?.nombre}` : 'Seguir';
  });
  protected readonly hint = computed(() => {
    const { lugar } = this.value();
    const left = this.totals().total - this.totals().respondidas;
    switch (this.step()) {
      case 1:
        if (!lugar.empresa) return 'Buscá y elegí la empresa.';
        return lugar.local ? 'Todo listo. Seguí con tu trabajo.' : 'Elegí el local donde trabajaste.';
      case 2:
        return 'Estos datos se muestran sin tu nombre.';
      case CRITERIA_STEP:
        if (left === 0) return 'Respondiste todo. Seguí con tu opinión.';
        return left === 1 ? '1 pregunta por responder en total' : `${left} preguntas por responder en total`;
      default:
        return 'Revisá la vista previa antes de enviar.';
    }
  });

  // Vista previa.
  private readonly jobList = computed(() => (this.jobs.hasValue() ? this.jobs.value().data : []));
  private readonly jobName = computed(() => jobText(this.value().relacion, this.jobList()));
  protected readonly meta = computed(() => previewMeta(this.value(), this.jobList()));
  /** Como en la tarjeta publicada: sin «No sé o no aplica». */
  protected readonly previewAnswers = computed(() =>
    this.config.hasValue()
      ? answerSummary(this.categories(), this.value().criterios, this.config.value().opcionesRespuesta).filter((item) => item.valor !== 'NO_SABE')
      : [],
  );

  /** Se guarda solo una reseña nueva que todavía no se envió. */
  private readonly keepsDraft = computed(() => !this.editing() && this.started() && !this.published() && this.savedId() === null);
  protected readonly note = computed(() =>
    this.keepsDraft() && this.drafts.available() ? 'Lo que respondés se guarda solo en este dispositivo. Podés salir y seguir otro día.' : '',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    linkConditionalFields(this.form, destroyRef);
    effect(() => {
      if (this.config.hasValue()) applyCriteriaConfig(this.form, this.config.value());
    });
    // Modo edición: carga la versión una sola vez, cuando ya están los criterios y los cargos.
    let loaded = false;
    effect(() => {
      const review = this.editable();
      if (loaded || !review || !this.config.hasValue() || !this.jobs.hasValue()) return;
      loaded = true;
      untracked(() => {
        fromMyReview(this.form, review, this.jobs.value()!.data);
        this.savedId.set(review.id);
        this.step.set(2);
        // Todo está respondido: se puede ir a cualquier paso.
        this.maxStep.set(STEPS.length);
        this.position.set(enterCriteria(this.categories(), this.form.controls.criterios.getRawValue()));
      });
    });
    // Reseña nueva: decide una vez si retoma un borrador, elige la empresa pedida o empieza vacía.
    let decided = false;
    effect(() => {
      if (decided || this.editing()) return;
      decided = true;
      const wanted = this.empresa();
      untracked(() => this.begin(wanted));
    });
    // Termina de empezar cuando están las listas y, si hace falta, la empresa confirmada por la API.
    effect(() => {
      if (this.editing() || this.started() || this.choosing() || !this.catalogsReady()) return;
      const needsCompany = this.startCompany() !== undefined;
      if (needsCompany && !this.company.hasValue() && !isNotFound(this.company.error())) return;
      untracked(() => this.start());
    });
    // Al corregir, el aviso de lo que faltaba deja de valer.
    effect(() => {
      this.value();
      untracked(() => this.missing.set(''));
    });
    effect(() => {
      const value = this.value();
      const step = this.step();
      if (!this.keepsDraft()) return;
      const draft = toSavedDraft(value, step, this.jobList());
      if (draft) untracked(() => this.drafts.save(draft));
    });
    effect(() =>
      this.exit.label.set(
        this.keepsDraft() && this.drafts.available() ? 'Guardar y salir' : this.published() || !this.ready() ? 'Volver al inicio' : 'Salir sin guardar',
      ),
    );
    destroyRef.onDestroy(() => this.exit.label.set('Volver al inicio'));
  }

  protected showErrors(step: number): boolean {
    return this.attempted().has(step);
  }

  protected lookups(): DraftLookups {
    return {
      jobs: this.jobs.value()!.data,
      contractTypes: this.contractTypes.value()!.data,
      workModes: this.workModes.value()!.data,
    };
  }

  protected next(): void {
    this.missing.set('');
    this.sendError.set(null);
    if (this.step() === CRITERIA_STEP) {
      this.nextInCriteria();
      return;
    }
    const group = this.form.controls[GROUPS[this.step() - 1]];
    if (group.invalid) {
      group.markAllAsTouched();
      this.attempted.update((set) => new Set(set).add(this.step()));
      this.missing.set(missingMessage(this.form, this.step(), this.config.value().textos));
      return;
    }
    if (this.step() < STEPS.length) this.goTo(this.step() + 1);
    else this.sendIfComplete();
  }

  protected back(): void {
    this.goTo(this.step() - 1);
  }

  protected goTo(step: number): void {
    this.missing.set('');
    this.sendError.set(null);
    if (step === CRITERIA_STEP) this.position.set(enterCriteria(this.categories(), this.value().criterios));
    this.step.set(step);
    this.maxStep.update((max) => Math.max(max, step));
    this.focusHeading();
  }

  protected goToCategory(index: number): void {
    this.missing.set('');
    this.position.set(enterCategory(this.categories(), index, this.value().criterios));
    this.step.set(CRITERIA_STEP);
    this.focusHeading();
  }

  protected setPosition(position: CriteriaPosition): void {
    this.missing.set('');
    this.position.set(position);
  }

  /** Sigue con el borrador que se encontró. */
  protected keepDraft(): void {
    this.startCompany.set(this.saved()!.empresa.id);
    this.choosing.set(false);
  }

  /** Deja el borrador y empieza con la empresa pedida en la URL. */
  protected discardDraft(): void {
    this.drafts.clear();
    this.saved.set(null);
    this.startCompany.set(this.empresa());
    this.choosing.set(false);
  }

  /** Borra lo retomado y empieza una reseña vacía. */
  protected restart(): void {
    this.drafts.clear();
    this.form.reset();
    this.saved.set(null);
    this.resumed.set(false);
    this.confirmRestart.set(false);
    this.companyGone.set(false);
    this.attempted.set(new Set());
    this.maxStep.set(1);
    this.goTo(1);
    // Sin el parámetro, recargar no vuelve a elegir la empresa.
    if (this.empresa() !== undefined) this.router.navigate([], { queryParams: { empresa: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected cancelRestart(): void {
    this.confirmRestart.set(false);
    afterNextRender(() => this.restartButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Vuelve al último paso con todo lo escrito, para corregir una reseña rechazada. */
  protected editRejected(): void {
    this.published.set(null);
    this.form.controls.texto.controls.aceptaReglas.setValue(false);
    this.attempted.set(new Set());
    this.goTo(STEPS.length);
  }

  protected reloadAll(): void {
    for (const resource of [this.config, this.jobs, this.contractTypes, this.workModes, this.mine, this.company]) {
      if (resource.error()) resource.reload();
    }
  }

  private begin(wanted: number | undefined): void {
    const saved = this.drafts.load();
    if (saved && wanted !== undefined && wanted !== saved.empresa.id) {
      if (hasContent(saved)) {
        this.saved.set(saved);
        this.choosing.set(true);
      } else {
        this.startCompany.set(wanted);
      }
      return;
    }
    this.saved.set(saved);
    this.startCompany.set(saved?.empresa.id ?? wanted);
  }

  private start(): void {
    const company = this.company.hasValue() ? this.company.value() : null;
    const saved = this.saved();
    this.companyGone.set(this.startCompany() !== undefined && !company);
    if (saved) {
      fromSavedDraft(this.form, saved, company, this.lookups());
      const step = resumeStep(this.form, saved.paso);
      this.step.set(step);
      this.maxStep.set(step);
      this.position.set(enterCriteria(this.categories(), this.form.controls.criterios.getRawValue()));
      this.resumed.set(hasContent(saved));
    } else if (company) {
      this.form.controls.lugar.controls.empresa.setValue(company);
    }
    this.started.set(true);
  }

  private nextInCriteria(): void {
    const answers = this.value().criterios;
    if (this.allAnswered()) {
      this.goTo(STEPS.length);
      return;
    }
    const { categoria, pregunta, cerrada } = this.position();
    const pending = firstPending(this.categories(), answers);
    if (cerrada) {
      this.goToCategory(pending);
    } else if (answers[this.categories()[categoria].items[pregunta].codigo]) {
      // Respondida con las flechas del teclado: «Seguir» pasa a la próxima sin respuesta.
      this.setPosition(advance(this.categories(), this.position(), answers));
      this.focusQuestion();
    } else {
      this.missing.set('Respondé la pregunta para seguir. Si no sabés, elegí «No sé o no aplica».');
    }
  }

  /** Al editar o al volver atrás puede haber quedado algo sin responder en un paso anterior. */
  private sendIfComplete(): void {
    const pending = GROUPS.findIndex((name) => this.form.controls[name].invalid);
    if (pending < 0) {
      this.publish();
      return;
    }
    this.goTo(pending + 1);
    this.attempted.update((set) => new Set(set).add(pending + 1));
    this.missing.set(
      pending + 1 === CRITERIA_STEP
        ? 'Faltan preguntas por responder. Si no sabés, elegí «No sé o no aplica».'
        : missingMessage(this.form, pending + 1, this.config.value().textos),
    );
  }

  private publish(): void {
    // Un doble clic no envía dos veces; el botón no se deshabilita.
    if (this.sending()) return;
    const draft = toDraft(this.form, this.lookups());
    const savedId = this.savedId();
    this.sending.set(true);
    this.sendError.set(null);
    (savedId === null ? this.reviews.publish(draft) : this.reviews.update(savedId, draft))
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: (result) => {
          // Ya está en el servidor, en cualquier estado: el borrador no hace falta.
          if (savedId === null) this.drafts.clear();
          this.savedId.set(result.id);
          this.published.set({ draft, result });
          this.resumed.set(false);
          this.focusHeading();
        },
        error: (error: unknown) => {
          this.sendError.set({ message: apiErrorMessage(error), problems: apiProblems(error), conflict: isConflict(error) });
          // En móvil el aviso queda debajo de la barra: se lleva a la vista.
          afterNextRender(() => this.host.nativeElement.querySelector('.send-error')?.scrollIntoView?.({ block: 'center' }), { injector: this.injector });
        },
      });
  }

  /** Lleva el foco y la vista al título del paso o del resultado, para teclado y lector de pantalla. */
  private focusHeading(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0 });
      },
      { injector: this.injector },
    );
  }

  private focusQuestion(): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('app-step-criteria h2')?.focus(), { injector: this.injector });
  }
}

function isNotFound(error: unknown): boolean {
  // Un error de httpResource puede venir envuelto: se mira también su causa.
  const cause = error instanceof Error && error.cause ? error.cause : error;
  return cause instanceof HttpErrorResponse && cause.status === 404;
}

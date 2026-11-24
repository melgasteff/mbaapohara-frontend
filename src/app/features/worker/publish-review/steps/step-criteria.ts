import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, model, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideArrowLeft, LucideCircleCheck } from '@lucide/angular';
import { CriteriaCategory, ReviewOption } from '../../../../core/models/review';
import { AnswerGroup } from '../../../../shared/ui/answer-group/answer-group';
import { answerKind, Tag } from '../../../../shared/ui/tag/tag';
import { advance, Answers, answeredCount, answerSummary, CriteriaPosition, firstPending } from '../criteria-progress';
import { ReviewForm } from '../review-form';

/** Respondidas que se ven sin abrir la lista completa. */
const RECENT = 2;

/** Paso 3: una pregunta a la vez (R2, todas obligatorias). Los criterios vienen de la API, nunca del código. */
@Component({
  selector: 'app-step-criteria',
  imports: [ReactiveFormsModule, AnswerGroup, Tag, LucideArrowLeft, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  styles: `
    :host { gap: var(--space-4); }
    ol, ul { list-style: none; margin: 0; padding: 0; }
    p, h2 { margin: 0; }
    .muted { font-size: 14px; line-height: 20px; color: var(--noche-suave); }
    /* Cada segmento se ve de 10px y se toca en 44px. */
    .segments { display: flex; gap: var(--space-1); margin: calc(-1 * var(--space-4)) 0 calc(-1 * var(--space-3)); }
    .segments li { flex: 1; min-width: 0; }
    .segment { display: flex; align-items: center; width: 100%; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer; }
    .segment span { flex: 1; height: 10px; border-radius: var(--radio-xs); background: var(--linea); }
    .segment.SI span { background: var(--azul-texto); }
    .segment.EN_PARTE span { background: var(--amarillo); }
    .segment.NO span { background: var(--naranja-texto); }
    .segment.NO_SABE span { background: var(--borde-control); }
    .segment[aria-current] span { outline: 2px solid var(--noche); outline-offset: 2px; }
    .segment:focus-visible { outline: 2px solid var(--azul-texto); }
    .answered li {
      display: grid; grid-template-columns: 24px minmax(0, 1fr) auto auto; gap: var(--space-1) var(--space-3); align-items: center; min-height: 44px;
      border-bottom: 1px solid var(--linea); font-size: 14px; line-height: 20px; color: var(--noche-suave);
    }
    .answered .text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .answered app-tag { padding: 2px 8px; font-size: 13px; }
    .answered .mb-link-btn { font-size: 14px; }
    .block { display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-5) var(--space-4); border-radius: var(--radio-md); background: var(--blanco); }
    .question { font-size: 22px; line-height: 28px; font-weight: 700; }
    .question:focus, .closing:focus { outline: none; }
    .foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0 var(--space-3); min-height: 44px; }
    .foot .mb-link-btn { font-size: 14px; }
    .next { text-align: center; }
    .closing { display: flex; align-items: center; gap: 10px; font-size: 24px; line-height: 30px; font-weight: 700; }
    .closing svg { flex: none; color: var(--azul-texto); }
    .summary { display: flex; flex-wrap: wrap; gap: 6px; }
    @media (max-width: 599px) {
      .answered li { grid-template-columns: 20px minmax(0, 1fr) auto; padding: var(--space-1) 0; }
      .answered .text { grid-column: 2 / -1; }
      .answered app-tag { grid-column: 2; justify-self: start; }
    }
    @media (min-width: 760px) { .block { padding: 28px; } .question { font-size: 26px; line-height: 32px; } }
  `,
  template: `
    <ol class="segments" aria-label="Preguntas de la categoría">
      @for (item of category().items; track item.codigo) {
        @let answer = answers()[item.codigo];
        <li>
          <button
            type="button"
            [class]="'segment ' + (answer ? kind(answer) : '')"
            [attr.aria-current]="!position().cerrada && $index === position().pregunta ? 'step' : null"
            [attr.aria-label]="'Pregunta ' + ($index + 1) + (answer ? ': ' + label(answer) : ': sin responder')"
            (click)="open($index)"
          ><span></span></button>
        </li>
      }
    </ol>

    @if (answered().length) {
      <div>
        @if (answered().length > recent) {
          <button type="button" class="mb-link-btn" [attr.aria-expanded]="showAll()" (click)="showAll.set(!showAll())">
            {{ showAll() ? 'Ver menos' : 'Ver las ' + answered().length + ' respondidas' }}
          </button>
        }
        <ul class="answered">
          @for (row of visible(); track row.codigo) {
            <li>
              <span>{{ row.indice + 1 }}</span>
              <span class="text" [title]="row.texto">{{ row.texto }}</span>
              <app-tag [kind]="kind(row.valor)">{{ label(row.valor) }}</app-tag>
              <button type="button" class="mb-link-btn" (click)="open(row.indice)">Cambiar<span class="visually-hidden"> la respuesta: {{ row.texto }}</span></button>
            </li>
          }
        </ul>
      </div>
    }

    @if (position().cerrada) {
      <div class="block mb-entra">
        <h2 class="closing" tabindex="-1" #heading><svg lucideCircleCheck [size]="28" aria-hidden="true"></svg>{{ category().nombre }}: lista</h2>
        <div class="summary">
          @for (item of summary(); track item.valor) { <app-tag [kind]="kind(item.valor)">{{ item.cantidad }} {{ item.etiqueta }}</app-tag> }
        </div>
        <p class="muted">{{ afterClosing() }}</p>
      </div>
    } @else {
      <!-- Se vuelve a crear con cada pregunta: entra animada y con su propio grupo de radios. -->
      @for (item of [current()]; track item.codigo) {
        <div class="block mb-entra">
          <p class="muted"><strong>Pregunta {{ position().pregunta + 1 }} de {{ category().items.length }}</strong></p>
          <h2 class="question" [id]="'crit-' + item.codigo" tabindex="-1" #heading>{{ item.texto }}</h2>
          <app-answer-group [formControl]="group().controls[item.codigo]" [options]="options()" [labelledBy]="'crit-' + item.codigo" (picked)="next()" />
          <div class="foot">
            <span class="muted">Al elegir, pasa sola a la siguiente.</span>
            @if (position().pregunta > 0) {
              <button type="button" class="mb-link-btn" (click)="open(position().pregunta - 1)"><svg lucideArrowLeft [size]="16" aria-hidden="true"></svg>Pregunta anterior</button>
            }
          </div>
        </div>
      }
      @if (remaining() > 0) {
        <p class="muted next">{{ remaining() === 1 ? 'Sigue 1 pregunta' : 'Siguen ' + remaining() + ' preguntas' }} de {{ category().nombre }}</p>
      }
    }
  `,
})
export class StepCriteria {
  readonly group = input.required<ReviewForm['controls']['criterios']>();
  readonly answers = input.required<Answers>();
  readonly categories = input.required<CriteriaCategory[]>();
  readonly options = input.required<ReviewOption[]>();
  readonly position = model.required<CriteriaPosition>();

  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly recent = RECENT;
  protected readonly kind = answerKind;
  protected readonly showAll = signal(false);
  protected readonly category = computed(() => this.categories()[this.position().categoria]);
  protected readonly current = computed(() => this.category().items[this.position().pregunta]);
  /** Respondidas de la categoría, sin la que está en pantalla. */
  protected readonly answered = computed(() => {
    const { pregunta, cerrada } = this.position();
    return this.category().items.flatMap((item, indice) => {
      const valor = this.answers()[item.codigo];
      return valor && (cerrada || indice !== pregunta) ? [{ codigo: item.codigo, texto: item.texto, indice, valor }] : [];
    });
  });
  protected readonly visible = computed(() => (this.showAll() ? this.answered() : this.answered().slice(-RECENT)));
  protected readonly remaining = computed(() => {
    const { items } = this.category();
    const onScreen = this.answers()[this.current().codigo] ? 0 : 1;
    return items.length - answeredCount(this.category(), this.answers()) - onScreen;
  });
  protected readonly summary = computed(() => answerSummary([this.category()], this.answers(), this.options()));
  protected readonly afterClosing = computed(() => {
    const next = this.categories()[firstPending(this.categories(), this.answers())];
    if (!next) return 'Respondiste todos los temas. Falta tu opinión.';
    const count = next.items.length;
    return `Después: ${next.nombre} (${count} ${count === 1 ? 'pregunta' : 'preguntas'}).`;
  });

  protected label(value: string): string {
    return this.options().find((option) => option.valor === value)?.etiqueta ?? value;
  }

  protected open(index: number): void {
    this.position.update((position) => ({ ...position, pregunta: index, cerrada: false }));
    this.focusHeading();
  }

  /** Pasa a la siguiente sin respuesta. Lee el formulario, que ya tiene la respuesta recién elegida. */
  next(): void {
    this.position.set(advance(this.categories(), this.position(), this.group().getRawValue()));
    this.focusHeading();
  }

  private focusHeading(): void {
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideCircleAlert } from '@lucide/angular';
import { PublicReviewsApi } from '../../../../core/api/public-reviews-api';
import { CatalogItem, Job, ReviewOption } from '../../../../core/models/review';
import { ChoiceGroup } from '../../../../shared/ui/choice-group/choice-group';
import { CURRENT_YEAR, jobText, OTHER_JOB, ReviewForm, setJobText } from '../review-form';

type Relation = ReviewForm['controls']['relacion'];

/** Paso 2: relación laboral (R5). Solo el año: nunca fechas exactas. */
@Component({
  selector: 'app-step-relation',
  imports: [ReactiveFormsModule, ChoiceGroup, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  styles: `
    .frequent { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); font-size: 13px; color: var(--noche-suave); }
    .frequent .mb-chip { height: 36px; padding: 0 var(--space-3); font-weight: 500; background: transparent; }
    .frequent .mb-chip.is-checked { background: var(--azul-suave); }
    .year { max-width: 200px; height: 48px; font-weight: 600; }
    @media (max-width: 759px) { .frequent .mb-chip { height: 44px; } }
  `,
  template: `
    <ng-container [formGroup]="group()">
      <div class="mb-field" [class.mb-field-error]="show('cargo') || show('cargoNuevo')">
        <label for="cargo">Cargo o puesto</label>
        <input
          #job
          id="cargo"
          class="mb-input big"
          list="cargos"
          maxlength="80"
          autocomplete="off"
          placeholder="Por ejemplo: atención al cliente"
          aria-describedby="cargo-ayuda"
          [attr.aria-invalid]="show('cargo') || show('cargoNuevo') ? true : null"
          [value]="jobName()"
          (input)="setJob(job.value)"
          (blur)="group().controls.cargoNuevo.markAsTouched()"
        />
        <datalist id="cargos">
          @for (item of jobs(); track item.id) { <option [value]="item.descripcion"></option> }
        </datalist>
        <span class="mb-help" id="cargo-ayuda">
          @if (show('cargo') || show('cargoNuevo')) {
            <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí tu cargo (al menos 2 letras).
          } @else if (relation().cargo === otherJob) {
            No está en la lista: lo revisamos antes de mostrarlo. Mientras tanto se ve «Otro cargo».
          } @else {
            Elegí uno de la lista o escribí el tuyo.
          }
        </span>
        @if (frequent().length) {
          <div class="frequent" role="group" aria-label="Cargos frecuentes">
            <span aria-hidden="true">Frecuentes:</span>
            @for (item of frequent(); track item.id) {
              <button type="button" class="mb-chip" [class.is-checked]="relation().cargo === item.id" [attr.aria-pressed]="relation().cargo === item.id" (click)="setJob(item.nombre)">
                {{ item.nombre }}
              </button>
            }
          </div>
        }
      </div>

      <div>
        <p class="legend" id="situacion-titulo">¿Seguís trabajando ahí?</p>
        <app-choice-group
          look="cards"
          formControlName="situacion"
          labelledBy="situacion-titulo"
          [options]="situations()"
          [describedBy]="show('situacion') ? 'situacion-error' : undefined"
        />
        @if (show('situacion')) {
          <p class="mb-help error" id="situacion-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí una opción.</p>
        }
      </div>

      @if (relation().situacion === 'ANTERIOR') {
        <div class="mb-field mb-entra" [class.mb-field-error]="show('ultimoAnio')">
          <label for="ultimo-anio">Último año en que trabajaste ahí</label>
          <select id="ultimo-anio" class="mb-input year" formControlName="ultimoAnio" aria-describedby="ultimo-anio-ayuda" [attr.aria-invalid]="show('ultimoAnio') ? true : null">
            <option [ngValue]="null" disabled>Elegí el año</option>
            @for (year of years; track year) { <option [ngValue]="year">{{ year }}</option> }
          </select>
          <span class="mb-help" id="ultimo-anio-ayuda">
            @if (show('ultimoAnio')) {
              <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el año.
            } @else {
              Solo el año: nunca pedimos fechas exactas.
            }
          </span>
        </div>
      }

      <div>
        <p class="legend" id="contrato-titulo">Tipo de contrato</p>
        <app-choice-group
          formControlName="tipoContrato"
          labelledBy="contrato-titulo"
          [options]="contractOptions()"
          [describedBy]="show('tipoContrato') ? 'contrato-error' : undefined"
        />
        @if (show('tipoContrato')) {
          <p class="mb-help error" id="contrato-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el tipo de contrato.</p>
        }
      </div>

      <div>
        <p class="legend" id="modalidad-titulo">Modalidad</p>
        <app-choice-group
          formControlName="modalidad"
          labelledBy="modalidad-titulo"
          [options]="modeOptions()"
          [describedBy]="show('modalidad') ? 'modalidad-error' : undefined"
        />
        @if (show('modalidad')) {
          <p class="mb-help error" id="modalidad-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí la modalidad.</p>
        }
      </div>
    </ng-container>
  `,
})
export class StepRelation {
  readonly group = input.required<Relation>();
  /** Valor del grupo, para que la pantalla siga los cambios. */
  readonly relation = input.required<ReturnType<Relation['getRawValue']>>();
  readonly companyId = input.required<number>();
  readonly showErrors = input(false);
  readonly jobs = input.required<Job[]>();
  readonly contractTypes = input.required<CatalogItem[]>();
  readonly workModes = input.required<CatalogItem[]>();
  readonly situations = input.required<ReviewOption[]>();

  /** Cargos con reseñas en la empresa. Es una ayuda: si la API no responde, no se muestra. */
  private readonly facets = inject(PublicReviewsApi).facetsResource(computed(() => ({ empresa: this.companyId() })));
  protected readonly frequent = computed(() =>
    this.facets.hasValue() ? [...this.facets.value().cargo.opciones].sort((a, b) => b.cantidad - a.cantidad).slice(0, 6) : [],
  );
  protected readonly jobName = computed(() => jobText(this.relation(), this.jobs()));
  protected readonly contractOptions = computed(() => toChoices(this.contractTypes()));
  protected readonly modeOptions = computed(() => toChoices(this.workModes()));

  protected readonly otherJob = OTHER_JOB;
  /** Del año en curso hacia atrás, 50 años. */
  protected readonly years = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

  protected setJob(text: string): void {
    setJobText(this.group(), text, this.jobs());
  }

  protected show(name: keyof Relation['controls']): boolean {
    const control = this.group().controls[name];
    return control.invalid && (control.touched || this.showErrors());
  }
}

function toChoices(items: CatalogItem[]) {
  return items.map((item) => ({ valor: item.id, etiqueta: item.nombre }));
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideCircleAlert } from '@lucide/angular';
import { CatalogItem, Job, ReviewOption } from '../../../../core/models/review';
import { AnswerGroup } from '../../../../shared/ui/answer-group/answer-group';
import { CURRENT_YEAR, OTHER_JOB, ReviewForm } from '../review-form';

type RelationField = keyof ReviewForm['controls']['relacion']['controls'];

/** Paso 2: relación laboral (R5). Solo el año: nunca fechas exactas. */
@Component({
  selector: 'app-step-relation',
  imports: [ReactiveFormsModule, AnswerGroup, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  template: `
    <ng-container [formGroup]="group()">
      <div class="mb-field" [class.mb-field-error]="show('cargo')">
        <label for="cargo">Cargo</label>
        <select id="cargo" class="mb-input" formControlName="cargo" [attr.aria-describedby]="show('cargo') ? 'cargo-error' : null">
          <option [ngValue]="null" disabled>Elegí tu cargo</option>
          @for (job of jobs(); track job.id) {
            <option [ngValue]="job.id">{{ job.descripcion }}</option>
          }
          <option [ngValue]="otherJob">Mi cargo no está en la lista</option>
        </select>
        @if (show('cargo')) {
          <span class="mb-help" id="cargo-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí tu cargo.</span>
        }
      </div>

      @if (group().controls.cargo.value === otherJob) {
        <div class="mb-field" [class.mb-field-error]="show('cargoNuevo')">
          <label for="cargo-nuevo">Tu cargo</label>
          <input
            id="cargo-nuevo"
            class="mb-input"
            formControlName="cargoNuevo"
            placeholder="Ej.: cajera, chofer, repositor"
            maxlength="80"
            aria-describedby="cargo-nuevo-ayuda"
          />
          <span class="mb-help" id="cargo-nuevo-ayuda">
            @if (show('cargoNuevo')) {
              <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí tu cargo (al menos 2 letras).
            } @else {
              Lo revisamos antes de sumarlo a la lista.
            }
          </span>
        </div>
      }

      <fieldset>
        <legend class="legend" id="situacion-legend">Situación</legend>
        <app-answer-group formControlName="situacion" [options]="situations()" labelledBy="situacion-legend" />
        @if (show('situacion')) {
          <p class="mb-help error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí tu situación.</p>
        }
      </fieldset>

      @if (group().controls.situacion.value === 'ANTERIOR') {
        <div class="mb-field" [class.mb-field-error]="show('ultimoAnio')">
          <label for="ultimo-anio">Último año en la empresa</label>
          <select id="ultimo-anio" class="mb-input" formControlName="ultimoAnio" aria-describedby="ultimo-anio-ayuda">
            <option [ngValue]="null" disabled>Elegí el año</option>
            @for (year of years; track year) {
              <option [ngValue]="year">{{ year }}</option>
            }
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

      <div class="mb-field" [class.mb-field-error]="show('tipoContrato')">
        <label for="tipo-contrato">Tipo de contrato</label>
        <select id="tipo-contrato" class="mb-input" formControlName="tipoContrato">
          <option [ngValue]="null" disabled>Elegí el tipo de contrato</option>
          @for (item of contractTypes(); track item.id) {
            <option [ngValue]="item.id">{{ item.nombre }}</option>
          }
        </select>
        @if (show('tipoContrato')) {
          <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el tipo de contrato.</span>
        }
      </div>

      <div class="mb-field" [class.mb-field-error]="show('modalidad')">
        <label for="modalidad">Modalidad</label>
        <select id="modalidad" class="mb-input" formControlName="modalidad">
          <option [ngValue]="null" disabled>Elegí la modalidad</option>
          @for (item of workModes(); track item.id) {
            <option [ngValue]="item.id">{{ item.nombre }}</option>
          }
        </select>
        @if (show('modalidad')) {
          <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí la modalidad.</span>
        }
      </div>
    </ng-container>
  `,
})
export class StepRelation {
  readonly group = input.required<ReviewForm['controls']['relacion']>();
  readonly showErrors = input(false);
  readonly jobs = input.required<Job[]>();
  readonly contractTypes = input.required<CatalogItem[]>();
  readonly workModes = input.required<CatalogItem[]>();
  readonly situations = input.required<ReviewOption[]>();

  protected readonly otherJob = OTHER_JOB;
  /** Del año en curso hacia atrás, 50 años. */
  protected readonly years = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

  protected show(name: RelationField): boolean {
    const control = this.group().controls[name];
    return control.invalid && (control.touched || this.showErrors());
  }
}

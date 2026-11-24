import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideMinus, LucidePlus } from '@lucide/angular';
import { OverallRatingConfig, ReviewTextField } from '../../../../core/models/review';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { ReviewForm } from '../review-form';

type Opinion = ReviewForm['controls']['texto'];

/** Paso 4: calificación general (R3) y los dos textos, «Lo bueno» y «A mejorar» (R6). */
@Component({
  selector: 'app-step-rating',
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink, StarRating, LucideCircleAlert, LucidePlus, LucideMinus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  styles: `
    .mb-field { max-width: none; }
    .mb-field label.text-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; }
    .mb-field .mb-pro { color: var(--azul-texto); }
    .mb-field .mb-con { color: var(--naranja-texto); }
    textarea.mb-input { min-height: 128px; }
    .under { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-1) var(--space-3); }
    .count { margin-left: auto; font-size: 13px; line-height: 20px; color: var(--noche-suave); }
    .count.is-enough { color: var(--azul-texto); font-weight: 600; }
    .reminder { margin: 0; padding: var(--space-4) 18px; background: var(--amarillo-suave); border-radius: var(--radio-sm); font-size: 15px; line-height: 22px; }
    .mb-field label.check { display: flex; gap: var(--space-3); align-items: flex-start; font-weight: 400; cursor: pointer; }
    .check input { accent-color: var(--azul-texto); width: 22px; height: 22px; margin: 0; flex: none; }
  `,
  template: `
    <ng-container [formGroup]="group()">
      <div>
        <app-star-rating
          formControlName="calificacion"
          [legend]="rating().pregunta"
          [max]="rating().maximo"
          [words]="rating().palabras"
          [describedBy]="show('calificacion') ? 'calificacion-error' : undefined"
        />
        @if (show('calificacion')) {
          <p class="mb-help error" id="calificacion-error">
            <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí una calificación.
          </p>
        }
      </div>

      @for (field of texts(); track field.codigo) {
        @let name = field.codigo === 'LO_BUENO' ? 'loBueno' : 'aMejorar';
        @let length = value()[name].trim().length;
        <div class="mb-field" [class.mb-field-error]="show(name)">
          <label class="text-label" [class]="name === 'loBueno' ? 'mb-pro' : 'mb-con'" [for]="field.codigo">
            @if (name === 'loBueno') {
              <svg lucidePlus [size]="18" aria-hidden="true"></svg>
            } @else {
              <svg lucideMinus [size]="18" aria-hidden="true"></svg>
            }
            {{ field.etiqueta }}
          </label>
          <textarea
            class="mb-input"
            rows="4"
            [id]="field.codigo"
            [formControlName]="name"
            [placeholder]="field.placeholder"
            [attr.maxlength]="field.maximo"
            [attr.aria-invalid]="show(name) ? true : null"
            [attr.aria-describedby]="field.codigo + '-ayuda ' + field.codigo + '-cuenta'"
          ></textarea>
          <div class="under">
            <span class="mb-help" [id]="field.codigo + '-ayuda'">
              @if (show(name)) {
                <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí al menos {{ field.minimo }} caracteres.
              } @else {
                Tu nombre nunca se muestra.
              }
            </span>
            <span class="count" [class.is-enough]="length >= field.minimo" [id]="field.codigo + '-cuenta'">
              @if (length < field.minimo) {
                {{ length }} de {{ field.minimo }} mínimos
              } @else {
                {{ length | number }} / {{ field.maximo | number }}
              }
            </span>
          </div>
        </div>
      }

      <p class="reminder">
        <strong>Para que se publique sin demoras:</strong> no escribas nombres de personas, teléfonos ni datos que permitan identificar
        a alguien, y evitá insultos. Contá hechos.
      </p>

      <div class="mb-field" [class.mb-field-error]="show('aceptaReglas')">
        <label class="check">
          <input
            type="checkbox"
            formControlName="aceptaReglas"
            [attr.aria-invalid]="show('aceptaReglas') ? true : null"
            [attr.aria-describedby]="show('aceptaReglas') ? 'reglas-error' : null"
          />
          <span>
            Leí y acepto las
            <a routerLink="/como-moderamos" fragment="reglas" target="_blank" rel="noopener">reglas de publicación<span class="visually-hidden"> (se abren en otra pestaña)</span></a>.
            Lo que cuento es mi experiencia real.
          </span>
        </label>
        @if (show('aceptaReglas')) {
          <span class="mb-help" id="reglas-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Para enviar hay que aceptarlas.</span>
        }
      </div>
    </ng-container>
  `,
})
export class StepRating {
  readonly group = input.required<Opinion>();
  /** Valor del grupo, para que los contadores sigan lo escrito. */
  readonly value = input.required<ReturnType<Opinion['getRawValue']>>();
  readonly showErrors = input(false);
  readonly rating = input.required<OverallRatingConfig>();
  readonly texts = input.required<ReviewTextField[]>();

  protected show(name: keyof Opinion['controls']): boolean {
    const control = this.group().controls[name];
    return control.invalid && (control.touched || this.showErrors());
  }
}

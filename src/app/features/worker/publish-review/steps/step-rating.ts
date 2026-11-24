import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideInfo, LucideLock } from '@lucide/angular';
import { OverallRatingConfig, ReviewTextField } from '../../../../core/models/review';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { ReviewForm } from '../review-form';

/** Paso 4: calificación general (R3) y los dos textos, «Lo bueno» y «A mejorar» (R6). */
@Component({
  selector: 'app-step-rating',
  imports: [ReactiveFormsModule, RouterLink, StarRating, LucideCircleAlert, LucideInfo, LucideLock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
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

      <p class="reminder body-sm">
        <svg lucideInfo [size]="20" aria-hidden="true"></svg>
        <span>Contá tu propia experiencia. No incluyas nombres de personas ni datos personales, como teléfonos o correos.</span>
      </p>

      @for (field of texts(); track field.codigo) {
        @let name = field.codigo === 'LO_BUENO' ? 'loBueno' : 'aMejorar';
        @let control = group().controls[name];
        <div class="mb-field" [class.mb-field-error]="show(name)">
          <label [for]="field.codigo">{{ field.etiqueta }}</label>
          <textarea
            class="mb-input"
            rows="5"
            [id]="field.codigo"
            [formControlName]="name"
            [placeholder]="field.placeholder"
            [attr.maxlength]="field.maximo"
            [attr.aria-describedby]="field.codigo + '-ayuda'"
          ></textarea>
          <span class="mb-help" [id]="field.codigo + '-ayuda'">
            @if (show(name)) {
              <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>
              Escribí al menos {{ field.minimo }} caracteres ·
            } @else {
              <svg lucideLock [size]="16" aria-hidden="true"></svg>
              Tu nombre nunca se muestra · Mínimo {{ field.minimo }} caracteres ·
            }
            {{ control.value.trim().length }}/{{ field.maximo }}
          </span>
        </div>
      }

      <div class="mb-field" [class.mb-field-error]="show('aceptaReglas')">
        <label class="check body-sm">
          <input type="checkbox" formControlName="aceptaReglas" [attr.aria-invalid]="show('aceptaReglas')" />
          <span>
            Acepto las
            <a class="mb-link" routerLink="/como-moderamos" fragment="reglas" target="_blank" rel="noopener">reglas de publicación</a>
            <span class="visually-hidden">(se abren en otra pestaña)</span>.
          </span>
        </label>
        @if (show('aceptaReglas')) {
          <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Para publicar hay que aceptarlas.</span>
        }
      </div>
    </ng-container>
  `,
  styles: `
    .reminder {
      display: flex; gap: var(--space-2); align-items: flex-start; margin: 0; max-width: 560px;
      padding: var(--space-3) var(--space-4); background: var(--azul-suave); color: var(--noche);
      border-radius: var(--radio-md);
    }
    .reminder svg { flex: none; color: var(--azul-texto); }
    textarea.mb-input { min-height: 140px; }
    .check { display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer; font-weight: 400; }
    .check input { accent-color: var(--azul-texto); width: 20px; height: 20px; margin: 2px 0 0; flex: none; }
  `,
})
export class StepRating {
  readonly group = input.required<ReviewForm['controls']['texto']>();
  readonly showErrors = input(false);
  readonly rating = input.required<OverallRatingConfig>();
  readonly texts = input.required<ReviewTextField[]>();

  protected show(name: 'calificacion' | 'loBueno' | 'aMejorar' | 'aceptaReglas'): boolean {
    const control = this.group().controls[name];
    return control.invalid && (control.touched || this.showErrors());
  }
}

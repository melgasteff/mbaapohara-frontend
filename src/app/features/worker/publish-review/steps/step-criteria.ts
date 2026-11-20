import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideCircleAlert } from '@lucide/angular';
import { CriteriaCategory, ReviewOption } from '../../../../core/models/review';
import { AnswerGroup } from '../../../../shared/ui/answer-group/answer-group';
import { ReviewForm } from '../review-form';

/** Paso 3: una respuesta por criterio, todas obligatorias (R2). Los criterios vienen del JSON provisional. */
@Component({
  selector: 'app-step-criteria',
  imports: [ReactiveFormsModule, AnswerGroup, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './step.css',
  template: `
    <p class="body-sm progress" aria-live="polite">{{ answered() }} de {{ total() }} respondidas</p>
    <ng-container [formGroup]="group()">
      @for (category of categories(); track category.codigo) {
        <section class="category" [attr.aria-labelledby]="'cat-' + category.codigo">
          <h3 class="h3" [id]="'cat-' + category.codigo">{{ category.nombre }}</h3>
          <ol class="criteria">
            @for (item of category.items; track item.codigo) {
              <li class="criterion" [class.has-error]="show(item.codigo)">
                <p class="body" [id]="'crit-' + item.codigo">{{ item.texto }}</p>
                <app-answer-group [formControlName]="item.codigo" [options]="options()" [labelledBy]="'crit-' + item.codigo" />
                @if (show(item.codigo)) {
                  <p class="mb-help error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí una opción.</p>
                }
              </li>
            }
          </ol>
        </section>
      }
    </ng-container>
  `,
  styles: `
    .progress { margin: 0; color: var(--ink-muted); }
    .category { display: flex; flex-direction: column; gap: var(--space-3); }
    .category .h3 { margin: 0; }
    .criteria { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }
    .criterion {
      display: flex; flex-direction: column; gap: var(--space-3);
      padding: var(--space-4); background: var(--surface-raised);
      border: 1px solid var(--line); border-radius: var(--radius-md);
    }
    .criterion.has-error { border-color: var(--danger); }
    .criterion p { margin: 0; }
  `,
})
export class StepCriteria {
  readonly group = input.required<ReviewForm['controls']['criterios']>();
  readonly showErrors = input(false);
  readonly categories = input.required<CriteriaCategory[]>();
  readonly options = input.required<ReviewOption[]>();

  protected total(): number {
    return Object.keys(this.group().controls).length;
  }

  protected answered(): number {
    return Object.values(this.group().controls).filter((control) => control.value).length;
  }

  protected show(code: string): boolean {
    const control = this.group().controls[code];
    return !!control && control.invalid && (control.touched || this.showErrors());
  }
}

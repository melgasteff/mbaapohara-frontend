import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

export interface WizardStep {
  paso: number;
  nombre: string;
  /** Resumen de lo respondido. */
  detalle: string;
  hecho: boolean;
  /** Ya se llegó a ese paso: se puede ir con un clic. */
  alcanzable: boolean;
}

export interface WizardCategory {
  nombre: string;
  respondidas: number;
  total: number;
}

/** Pasos del asistente con su resumen y, en el paso 3, el avance de cada categoría. Solo en escritorio. */
@Component({
  selector: 'app-wizard-nav',
  imports: [NgTemplateOutlet, LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ol, ul { list-style: none; margin: 0; padding: 0; }
    .step, .category { border: 0; background: transparent; font: inherit; text-align: left; color: var(--noche); }
    button { cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: 2px; border-radius: var(--radio-xs); }
    .step { display: flex; gap: var(--space-3); align-items: flex-start; width: 100%; min-height: 44px; padding: 9px 0; font-size: 16px; line-height: 24px; font-weight: 600; }
    .step--locked { color: var(--noche-suave); }
    .step[aria-current] { font-weight: 700; }
    .dot {
      flex: none; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1.5px solid var(--borde-control);
      border-radius: 50%; color: var(--noche-suave); font-size: 13px; font-weight: 700;
    }
    .dot--done { border-color: var(--azul-texto); background: var(--azul-texto); color: var(--blanco); }
    .dot--current { border-color: var(--naranja); background: var(--naranja); color: var(--noche); }
    .text { display: flex; flex-direction: column; min-width: 0; }
    .detail { font-size: 13px; line-height: 18px; font-weight: 400; color: var(--noche-suave); overflow-wrap: anywhere; }
    ul { padding: 2px 0 var(--space-2) 28px; }
    .category {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); width: 100%; min-height: 44px; padding: 6px 10px;
      border-radius: var(--radio-sm); font-size: 14px; line-height: 20px; font-weight: 500; color: var(--noche-suave);
    }
    .category.is-done { color: var(--azul-texto); }
    .category[aria-current] { background: var(--blanco); font-weight: 700; color: var(--noche); }
    .category svg { flex: none; }
    .note { margin: var(--space-4) 0 0; padding-top: 14px; border-top: 1px solid var(--linea); font-size: 13px; line-height: 18px; color: var(--noche-suave); }
  `,
  template: `
    <nav aria-label="Pasos">
      <ol>
        @for (item of steps(); track item.paso) {
          <li>
            @if (item.alcanzable) {
              <button type="button" class="step" [attr.aria-current]="item.paso === current() ? 'step' : null" (click)="goStep.emit(item.paso)">
                <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ item }" />
              </button>
            } @else {
              <span class="step step--locked"><ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ item }" /></span>
            }
            @if (item.paso === 3 && item.alcanzable) {
              <ul aria-label="Temas">
                @for (category of categories(); track $index) {
                  <li>
                    <button
                      type="button"
                      class="category"
                      [class.is-done]="category.respondidas === category.total"
                      [attr.aria-current]="current() === 3 && $index === currentCategory() ? 'true' : null"
                      (click)="goCategory.emit($index)"
                    >
                      <span>{{ category.nombre }}</span>
                      @if (category.respondidas === category.total) {
                        <svg lucideCheck [size]="16" aria-hidden="true"></svg><span class="visually-hidden">completo</span>
                      } @else {
                        <span>{{ category.respondidas }}/{{ category.total }}</span>
                      }
                    </button>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ol>
      <ng-template #content let-item="item">
        <span class="dot" [class.dot--current]="item.paso === current()" [class.dot--done]="item.hecho && item.paso !== current()">
          @if (item.hecho && item.paso !== current()) {
            <svg lucideCheck [size]="16" aria-hidden="true"></svg><span class="visually-hidden">Hecho:</span>
          } @else { {{ item.paso }} }
        </span>
        <span class="text"><span>{{ item.nombre }}</span>@if (item.detalle) { <span class="detail">{{ item.detalle }}</span> }</span>
      </ng-template>
      @if (note()) { <p class="note">{{ note() }}</p> }
    </nav>
  `,
})
export class WizardNav {
  readonly steps = input.required<WizardStep[]>();
  readonly current = input.required<number>();
  readonly categories = input<WizardCategory[]>([]);
  readonly currentCategory = input(0);
  /** Aviso sobre dónde queda guardado lo respondido. */
  readonly note = input('');
  readonly goStep = output<number>();
  readonly goCategory = output<number>();
}

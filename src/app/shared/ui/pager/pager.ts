import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

/** Páginas que se muestran: la primera, la última y las vecinas de la actual; `null` es un salto. */
export function pageWindow(page: number, totalPages: number): (number | null)[] {
  const shown = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  );
  return shown.flatMap((n, i) => (i > 0 && n - shown[i - 1] > 1 ? [null, n] : [n]));
}

/** Paginación numerada: «1 a 10 de 24», páginas y «Siguiente». Con una sola página no se muestra. */
@Component({
  selector: 'app-pager',
  imports: [DecimalPipe, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    nav { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--space-3); padding-top: var(--space-5); font-size: 15px; line-height: 20px; }
    .range { color: var(--noche-suave); }
    .pages { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
    button {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 44px; height: 44px; padding: 0 var(--space-3);
      border: 1.5px solid var(--borde-control); border-radius: var(--radio-sm); background: var(--blanco); color: var(--noche);
      font: inherit; font-weight: 600; cursor: pointer;
    }
    button:hover { border-color: var(--noche); }
    button[aria-current='page'] { background: var(--azul-texto); border-color: var(--azul-texto); color: var(--blanco); }
    button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
  `,
  template: `
    @if (totalPages() > 1) {
      <nav [attr.aria-label]="label()">
        <span class="range">{{ from() | number }} a {{ to() | number }} de {{ total() | number }}</span>
        <div class="pages">
          @if (page() > 1) {
            <button type="button" aria-label="Página anterior" (click)="pageChange.emit(page() - 1)"><svg lucideChevronLeft [size]="18" aria-hidden="true"></svg></button>
          }
          @for (n of pages(); track $index) {
            @if (n === null) {
              <span aria-hidden="true">…</span>
            } @else {
              <button type="button" [attr.aria-label]="'Página ' + n" [attr.aria-current]="n === page() ? 'page' : null" (click)="pageChange.emit(n)">{{ n }}</button>
            }
          }
          @if (page() < totalPages()) {
            <button type="button" (click)="pageChange.emit(page() + 1)">Siguiente<svg lucideChevronRight [size]="18" aria-hidden="true"></svg></button>
          }
        </div>
      </nav>
    }
  `,
})
export class Pager {
  readonly label = input('Páginas');
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pages = computed(() => pageWindow(this.page(), this.totalPages()));
  protected readonly from = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
}

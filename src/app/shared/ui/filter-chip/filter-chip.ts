import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { FilterOption, OptionList } from '../option-list/option-list';

/** Chip de filtro con lista. Sin valor muestra el nombre («Contrato»); con valor, «Contrato: Indefinido» y un tilde. */
@Component({
  selector: 'app-filter-chip',
  imports: [OptionList, LucideCheck, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-option-list
      [label]="label()"
      [options]="options()"
      [value]="value()"
      [triggerClass]="value() === null ? 'mb-chip' : 'mb-chip is-checked'"
      (valueChange)="valueChange.emit($event)"
    >
      @if (value() !== null) { <svg lucideCheck [size]="14" aria-hidden="true"></svg> }
      {{ text() }}<svg lucideChevronDown [size]="16" aria-hidden="true"></svg>
    </app-option-list>
  `,
})
export class FilterChip<T = unknown> {
  readonly label = input.required<string>();
  readonly options = input.required<FilterOption<T>[]>();
  readonly value = input<T | null>(null);
  readonly valueChange = output<T | null>();

  protected readonly text = computed(() => {
    const value = this.value();
    const option = value === null ? undefined : this.options().find((o) => o.valor === value);
    return option ? `${this.label()}: ${option.etiqueta}` : this.label();
  });
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { FilterOption, OptionList } from '../option-list/option-list';

/**
 * Parte elegible de un filtro en frase. Va dentro de un título, entre el texto:
 * `<h1 class="mb-frase">Mostrame empresas de <app-sentence-filter … /> en …</h1>`.
 */
@Component({
  selector: 'app-sentence-filter',
  imports: [OptionList, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-option-list
      [label]="label()"
      [options]="options()"
      [value]="value()"
      [triggerClass]="place() ? 'mb-frase-parte mb-frase-lugar' : 'mb-frase-parte'"
      (valueChange)="valueChange.emit($event)"
    >{{ text() }}<svg lucideChevronDown aria-hidden="true"></svg></app-option-list>
  `,
})
export class SentenceFilter<T = unknown> {
  readonly label = input.required<string>();
  readonly options = input.required<FilterOption<T>[]>();
  readonly value = input<T | null>(null);
  /** El lugar se distingue con naranja profundo y subrayado discontinuo. */
  readonly place = input(false);
  readonly valueChange = output<T | null>();

  protected readonly text = computed(() => this.options().find((o) => o.valor === this.value())?.etiqueta ?? '');
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLock } from '@lucide/angular';
import { Accordion } from '../../../shared/ui/accordion/accordion';
import { INFO_PAGE_ORDER, INFO_PAGES, InfoPageId } from './info-pages';

/** Plantilla de las páginas informativas. El contenido propio de cada una va adentro, en `<section>` con `id`. */
@Component({
  selector: 'app-info-page',
  imports: [RouterLink, Accordion, LucideArrowRight, LucideLock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-page.css',
  templateUrl: './info-page.html',
})
export class InfoPage {
  readonly page = input.required<InfoPageId>();

  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  protected readonly data = computed(() => INFO_PAGES[this.page()]);
  protected readonly index = computed(() => [...this.data().indice, { id: 'preguntas', texto: 'Preguntas frecuentes' }]);
  /** Sección elegida en el índice; al entrar, la primera. */
  protected readonly current = computed(() => {
    const fragment = this.fragment();
    return this.index().find((section) => section.id === fragment)?.id ?? this.index()[0].id;
  });
  protected readonly others = computed(() => INFO_PAGE_ORDER.filter((id) => id !== this.page()).map((id) => INFO_PAGES[id]));
}

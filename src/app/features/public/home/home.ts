import { Location } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLock, LucideMinus, LucidePlus, LucideShieldCheck } from '@lucide/angular';
import { CompaniesApi } from '../../../core/api/companies-api';
import { FilterOption } from '../../../shared/ui/option-list/option-list';
import { SentenceFilter } from '../../../shared/ui/sentence-filter/sentence-filter';
import { Stars } from '../../../shared/ui/stars/stars';

/** Ejemplos del buscador: palabras que la búsqueda encuentra en el nombre de los rubros. */
export const SEARCH_EXAMPLES = ['comercio', 'gastronomía', 'transporte', 'construcción'];
const ROTATION_MS = 3000;

/** Portada: la frase-buscador, un ejemplo de reseña, cómo funciona y «Conocé tus derechos». */
@Component({
  selector: 'app-home',
  imports: [RouterLink, SentenceFilter, Stars, LucideArrowRight, LucideLock, LucideMinus, LucidePlus, LucideShieldCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly facets = inject(CompaniesApi).facetsResource(signal({}));

  /** Se acaba de eliminar la cuenta. El navegador guarda el estado en el historial: se borra al mostrarlo, para que no vuelva. */
  protected readonly accountDeleted = this.router.currentNavigation()?.extras.state?.['cuentaEliminada'] === true;

  protected readonly term = signal('');
  protected readonly focused = signal(false);
  private readonly exampleIndex = signal(0);
  protected readonly example = computed(() => SEARCH_EXAMPLES[this.exampleIndex()]);

  protected readonly city = signal<number | null>(null);
  /** Ciudades con empresas. Si los conteos no cargan, la frase funciona igual con «cualquier ciudad». */
  protected readonly cities = computed<FilterOption<number>[]>(() => {
    const facet = this.facets.hasValue() ? this.facets.value().ciudades : undefined;
    return [
      { valor: null, etiqueta: 'cualquier ciudad', detalle: facet?.total },
      ...(facet?.opciones ?? []).map((item) => ({ valor: item.id, etiqueta: item.nombre, detalle: item.cantidad })),
    ];
  });

  // TODO(decision): temas propuestos por la lámina; se confirman con la tarea 3.7.
  protected readonly rights = ['Jornada y horas extra', 'Aguinaldo y vacaciones', 'IPS y seguridad social', 'Despido y preaviso'];

  constructor() {
    const destroyRef = inject(DestroyRef);
    const location = inject(Location);
    if (this.accountDeleted) afterNextRender(() => location.replaceState(location.path(true)));
    afterNextRender(() => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      const timer = setInterval(() => this.rotateExample(), ROTATION_MS);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  /** El ejemplo cambia solo mientras el campo está vacío y sin foco. */
  private rotateExample(): void {
    if (this.term() || this.focused()) return;
    this.exampleIndex.update((index) => (index + 1) % SEARCH_EXAMPLES.length);
  }

  protected search(event: Event): void {
    event.preventDefault();
    const q = this.term().trim();
    this.router.navigate(['/empresas'], { queryParams: { ...(q ? { q } : {}), ...(this.city() ? { ciudad: this.city() } : {}) } });
  }
}

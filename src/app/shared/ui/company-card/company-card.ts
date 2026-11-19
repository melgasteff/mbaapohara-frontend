import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Company } from '../../../core/models/company';

/**
 * Tarjeta de empresa del manual (docs/marca/components/TarjetaEmpresa).
 * Toda la tarjeta es el enlace; «Ver reseñas» es solo la pista visual.
 */
@Component({
  selector: 'app-company-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    /* El manual fija 340px para su vista previa; en la grilla la tarjeta ocupa la columna. */
    .mb-company { display: flex; flex-direction: column; gap: var(--space-3); width: auto; height: 100%; }
    .mb-company-stats { margin-top: auto; gap: var(--space-3); flex-wrap: wrap; }
    .mb-link { white-space: nowrap; }
  `,
  template: `
    <a class="mb-company" [routerLink]="['/empresas', company().id]">
      <div class="mb-company-top">
        <span class="mb-avatar" [class.mb-avatar-tierra]="tierra()" aria-hidden="true">{{ initials() }}</span>
        <div>
          <h3>{{ company().nombre }}</h3>
          @if (company().rubro.nombre; as rubro) {
            <div class="mb-meta"><span>{{ rubro }}</span></div>
          }
        </div>
      </div>
      <div class="mb-company-stats">
        <span class="body-sm">Sin reseñas todavía · Sé la primera persona en contar</span>
        <span class="mb-link">Ver reseñas</span>
      </div>
    </a>
  `,
})
export class CompanyCard {
  readonly company = input.required<Company>();
  /** Posición en el listado, para alternar el fondo del avatar entre yerba y tierra. */
  readonly index = input(0);

  protected readonly tierra = computed(() => this.index() % 2 === 1);

  /** Iniciales de las dos primeras palabras: «Banco Continental» → «BC». */
  protected readonly initials = computed(() =>
    this.company()
      .nombre.split(/\s+/)
      .filter((word) => /\p{L}/u.test(word))
      .slice(0, 2)
      .map((word) => word[0].toLocaleUpperCase('es'))
      .join(''),
  );
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { sectorGroup } from '../../sector-group';

/** Palabras sin significado para las iniciales: artículos, preposiciones y tipos de sociedad. */
const SKIPPED = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'sa', 'saeca', 'saci', 'srl', 'eas', 'cia', 'ltda']);

/** Iniciales de las dos primeras palabras con significado: «Banco de la Nación S.A.» → «BN». */
export function companyInitials(name: string): string {
  const words = name.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  const normalize = (word: string) =>
    word.toLocaleLowerCase('es').normalize('NFD').replace(/[^a-z0-9]/g, '');
  const meaningful = words.filter((word) => !SKIPPED.has(normalize(word)));
  return (meaningful.length ? meaningful : words)
    .slice(0, 2)
    .map((word) => (word.match(/[\p{L}\p{N}]/u)?.[0] ?? '').toLocaleUpperCase('es'))
    .join('');
}

/**
 * Sello de empresa: el globo del logo con dos iniciales. El color sale del grupo de rubro, nunca del azar ni del
 * índice. Si la empresa tiene un logo autorizado, se muestra en un cuadro blanco con la esquina de diálogo.
 * Es decorativo: siempre va al lado del nombre.
 */
@Component({
  selector: 'app-company-seal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class]': 'group()' },
  styles: `
    :host { display: inline-flex; flex: none; }
    svg { display: block; }
    text { font-family: var(--font-sans); font-size: 14px; font-weight: 700; text-anchor: middle; fill: var(--noche); }
    .logo { object-fit: contain; padding: var(--space-1); background: var(--blanco); border: 1px solid var(--linea); border-radius: var(--radio-resena); }
    :host(.comercio) path { fill: var(--amarillo); }
    :host(.industria) path { fill: var(--naranja); }
    :host(.servicios) path { fill: var(--azul); }
    :host(.servicios) text { fill: var(--blanco); }
    :host(.gastronomia) path { fill: var(--naranja-suave); }
    :host(.gastronomia) text { fill: var(--naranja-texto); }
    :host(.transporte) path { fill: var(--azul-suave); }
    :host(.transporte) text { fill: var(--azul-texto); }
    :host(.agro-otros) path { fill: var(--blanco); stroke: var(--noche); stroke-width: 1.5; }
  `,
  template: `
    @if (logoUrl(); as url) {
      <img class="logo" [src]="url" alt="" [width]="size()" [height]="size()" />
    } @else {
      <svg [attr.width]="size()" [attr.height]="height()" viewBox="-1 -1 36 48">
        <path d="M0,17 A17,17 0 1 1 8.5,31.72 L0,46 Z" />
        <text x="17" y="22.5">{{ initials() }}</text>
      </svg>
    }
  `,
})
export class CompanySeal {
  readonly name = input.required<string>();
  /** Sección CIIU del rubro. */
  readonly ciiu = input<string | null>();
  /** 72 en el perfil, 48 en listados, 36 en filas compactas. */
  readonly size = input<72 | 48 | 36>(48);
  /** Logo con permiso de la empresa. La API todavía no lo devuelve. */
  readonly logoUrl = input<string | null>();

  protected readonly group = computed(() => sectorGroup(this.ciiu()));
  protected readonly initials = computed(() => companyInitials(this.name()));
  protected readonly height = computed(() => Math.round((this.size() * 7) / 6));
}

import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminCounts, sumCounts } from '../../api/admin-counts';

/** Navegación de la administración, segunda fila del encabezado `admin`. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    /* relative: los textos ocultos de los contadores se recortan con la barra y no ensanchan la página. */
    nav { position: relative; display: flex; gap: 28px; overflow-x: auto; }
    a {
      display: inline-flex; align-items: center; gap: var(--space-2); min-height: 48px; white-space: nowrap;
      color: var(--noche); text-decoration: none; font-size: 15px; font-weight: 600;
    }
    a[aria-current='page'] { color: var(--azul-texto); box-shadow: inset 0 -3px 0 var(--azul-texto); }
    a:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; }
    .count {
      min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--radio-pildora); background: var(--neutro-suave); color: var(--noche); font-size: 12px; font-weight: 700;
    }
    .count--urgent { background: var(--naranja); }
  `,
  template: `
    <nav aria-label="Administración">
      @for (section of sections; track section.ruta) {
        <a [routerLink]="section.ruta" routerLinkActive ariaCurrentWhenActive="page">
          {{ section.nombre }}
          @if (section.pendientes(); as total) {
            <span class="count" [class.count--urgent]="section.urgente">{{ total }}<span class="visually-hidden"> pendientes</span></span>
          }
        </a>
      }
    </nav>
  `,
})
export class AdminNav {
  private readonly counts = inject(AdminCounts);
  /** Cada sección con lo que espera una decisión; se actualiza con cada una. */
  protected readonly sections: { ruta: string; nombre: string; pendientes: Signal<number | undefined>; urgente?: boolean }[] = [
    { ruta: '/admin/moderacion', nombre: 'Moderación', pendientes: this.counts.count('moderacion'), urgente: true },
    { ruta: '/admin/reportes', nombre: 'Reportes', pendientes: this.counts.count('reportes') },
    { ruta: '/admin/solicitudes', nombre: 'Solicitudes', pendientes: this.counts.count('solicitudes') },
    { ruta: '/admin/empresas', nombre: 'Empresas', pendientes: sumCounts(this.counts.count('empresas'), this.counts.count('locales')) },
    { ruta: '/admin/cargos', nombre: 'Cargos', pendientes: this.counts.count('cargos') },
    { ruta: '/admin/criterios', nombre: 'Criterios', pendientes: signal<number | undefined>(undefined) },
  ];
}

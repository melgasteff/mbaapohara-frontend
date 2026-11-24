import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';

/** Página no encontrada: cualquier ruta que no existe. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, LucideSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    h1, p { margin: 0; }
    .page-404 { max-width: 1080px; display: flex; flex-direction: column; align-items: center; gap: var(--space-6); padding-top: var(--space-7); padding-bottom: var(--space-8); text-align: center; }
    .art { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 200px; height: 200px; box-sizing: border-box; border: 10px solid var(--amarillo); border-radius: 50%; background: var(--blanco); }
    .art img { width: 62%; height: auto; }
    .text { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); min-width: 0; width: 100%; }
    .sobretitulo { color: var(--noche-suave); }
    h1 { font-size: 34px; line-height: 40px; font-weight: 700; letter-spacing: -.02em; }
    .lead { max-width: 520px; font-size: 18px; line-height: 28px; color: var(--noche-suave); }
    form { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; max-width: 520px; }
    .mb-search { flex: 1 1 auto; max-width: none; height: 56px; }
    .mb-search input { height: 100%; font-size: 16px; }
    form .mb-btn { height: 56px; }
    nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 20px; }
    @media (min-width: 760px) {
      .page-404 { flex-direction: row; gap: var(--space-8); padding-top: 72px; padding-bottom: 72px; text-align: left; }
      .art { width: 320px; height: 320px; }
      .text { align-items: flex-start; }
      h1 { font-size: 48px; line-height: 52px; }
      form { flex-direction: row; }
      .mb-search { min-height: 56px; }
      nav { justify-content: flex-start; }
    }
    @media (min-width: 760px) and (max-width: 1023px) { .art { width: 220px; height: 220px; } h1 { font-size: 38px; line-height: 44px; } }
  `,
  template: `
    <div class="mb-wrap page-404">
      <span class="art"><img src="/marca/iconos/09-lapacho.svg" alt="" /></span>
      <div class="text">
        <p class="sobretitulo">Error 404</p>
        <h1>Esta página se nos voló, como flor de lapacho</h1>
        <p class="lead">El enlace puede estar mal escrito o la página ya no existe. Buscá la empresa que querías ver o volvé al inicio.</p>
        <form role="search" (submit)="search($event, term.value)">
          <label class="mb-search">
            <svg lucideSearch [size]="20" aria-hidden="true"></svg>
            <span class="visually-hidden">Buscar empresa</span>
            <input #term type="search" placeholder="Empresa, local o rubro" autocomplete="off" maxlength="100" />
          </label>
          <button type="submit" class="mb-btn mb-btn-primary">Buscar</button>
        </form>
        <nav aria-label="Otras páginas">
          <a class="mb-enlace" routerLink="/">Ir al inicio</a>
          <a class="mb-enlace" routerLink="/empresas">Ver todas las empresas</a>
          <a class="mb-enlace" routerLink="/como-moderamos">Cómo moderamos</a>
        </nav>
      </div>
    </div>
  `,
})
export class NotFound {
  private readonly router = inject(Router);

  protected search(event: Event, term: string): void {
    event.preventDefault();
    const q = term.trim();
    this.router.navigate(['/empresas'], { queryParams: q ? { q } : {} });
  }
}

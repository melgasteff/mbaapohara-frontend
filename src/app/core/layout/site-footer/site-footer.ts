import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../../shared/brand/logo/logo';

/** Pie en azul noche. */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    footer { background: var(--noche); color: var(--blanco); }
    .inner {
      max-width: var(--ancho-pagina); margin: 0 auto; padding: 56px var(--space-4) 40px; box-sizing: border-box;
      display: flex; flex-wrap: wrap; gap: 40px 72px;
    }
    .brand { flex: 1 1 280px; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
    p { margin: 0; }
    .slogan { font-size: 18px; line-height: 26px; font-weight: 600; }
    nav { flex: 0 1 200px; display: flex; flex-direction: column; align-items: flex-start; font-size: 15px; }
    h2 { margin: 0 0 var(--space-1); font-size: 13px; line-height: 18px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--pie-texto); }
    a { display: inline-flex; align-items: center; min-height: 44px; color: var(--blanco); text-underline-offset: 3px; }
    a:focus-visible { outline: 2px solid var(--blanco); outline-offset: 2px; }
    .project { flex: 1 1 100%; padding-top: 20px; border-top: 1px solid var(--noche-suave); font-size: 14px; line-height: 20px; color: var(--pie-texto); }
    @media (min-width: 1024px) { .inner { padding-left: var(--space-7); padding-right: var(--space-7); } }
  `,
  template: `
    <footer>
      <div class="inner">
        <div class="brand">
          <app-logo variant="color-oscuro" />
          <p class="slogan">Tu experiencia vale.</p>
        </div>
        <nav aria-labelledby="pie-plataforma">
          <h2 id="pie-plataforma">Plataforma</h2>
          <a routerLink="/empresas">Empresas</a>
          <a routerLink="/publicar">Escribí tu reseña</a>
          <a routerLink="/como-moderamos">Cómo moderamos</a>
        </nav>
        <nav aria-labelledby="pie-legal">
          <h2 id="pie-legal">Legal</h2>
          <a routerLink="/privacidad">Privacidad</a>
          <a routerLink="/terminos">Términos de uso</a>
          <a routerLink="/responsabilidad">Responsabilidad por las reseñas</a>
        </nav>
        <p class="project">Proyecto Final de Grado · Ingeniería en Informática · FCyT-UNCA · 2026</p>
      </div>
    </footer>
  `,
})
export class SiteFooter {}

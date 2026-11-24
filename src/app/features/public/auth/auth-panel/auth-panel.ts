import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Panel azul de ingresar y crear cuenta. En móvil es una franja con el isotipo y el eslogan. */
@Component({
  selector: 'app-auth-panel',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex; align-items: center; gap: var(--space-4); box-sizing: border-box; padding: var(--space-4); background: var(--azul); color: var(--blanco);
    }
    a { display: inline-flex; align-items: center; min-height: 44px; border-radius: var(--radio-xs); }
    a:focus-visible { outline: 2px solid var(--blanco); outline-offset: 4px; }
    a img { display: block; width: auto; height: 40px; }
    p { margin: 0; }
    .slogan { font-size: 20px; line-height: 26px; font-weight: 700; }
    .mb-disco, .text { display: none; }
    @media (min-width: 760px) {
      :host { flex: 0 0 44%; flex-direction: column; align-items: stretch; justify-content: space-between; gap: var(--space-6); padding: 40px var(--space-6); }
      a { align-self: flex-start; }
      .mb-disco { display: inline-flex; align-self: center; width: min(300px, 100%); height: auto; aspect-ratio: 1; }
      .mb-disco img { width: 73%; height: auto; }
      .words { display: flex; flex-direction: column; gap: 10px; }
      .slogan { font-size: 36px; line-height: 42px; letter-spacing: -.02em; }
      .text { display: block; max-width: 420px; font-size: 20px; line-height: 28px; font-weight: 700; }
    }
    @media (min-width: 1100px) { :host { padding: 40px 56px; } .slogan { font-size: 44px; line-height: 50px; } }
  `,
  template: `
    <a routerLink="/" aria-label="Mbaapohara, inicio"><img src="/marca/isotipo-blanco.svg" alt="" /></a>
    <span class="mb-disco"><img src="/marca/iconos/03-ronda-de-terere.svg" alt="" width="220" height="220" /></span>
    <div class="words">
      <p class="slogan">Tu experiencia vale.</p>
      <p class="text">{{ text() }}</p>
    </div>
  `,
})
export class AuthPanel {
  readonly text = input.required<string>();
}

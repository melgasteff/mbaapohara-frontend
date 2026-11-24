import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Versión del logotipo según el fondo: a color sobre crema o blanco, «oscuro» sobre azul noche. */
export type LogoVariant = 'color' | 'color-oscuro';

/** Logotipo horizontal (public/marca). No cambiar formas ni colores; el alto lo pone quien lo usa, sobre `app-logo`. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: inline-flex; height: 32px; } img { display: block; width: auto; height: 100%; }',
  template: `<img [src]="src()" alt="Mbaapohara" width="205" height="32" />`,
})
export class Logo {
  readonly variant = input<LogoVariant>('color');

  protected readonly src = computed(() => `/marca/horizontal-${this.variant()}.svg`);
}

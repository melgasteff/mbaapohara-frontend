import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucidePlus } from '@lucide/angular';

export interface AccordionItem {
  pregunta: string;
  respuesta: string;
}

/** Preguntas que se abren de a una o varias. Son `<details>` nativos: funcionan con teclado y con la búsqueda del navegador. */
@Component({
  selector: 'app-accordion',
  imports: [LucidePlus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; border-top: 1px solid var(--linea); }
    details { border-bottom: 1px solid var(--linea); }
    summary {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); min-height: 44px; padding: 18px 0; cursor: pointer; list-style: none;
      font-size: 18px; line-height: 26px; font-weight: 700;
    }
    summary::-webkit-details-marker { display: none; }
    summary:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    svg { flex: none; color: var(--azul-texto); transition: transform .15s ease; }
    details[open] svg { transform: rotate(45deg); }
    p { margin: 0 0 18px; max-width: 680px; font-size: 16px; line-height: 25px; color: var(--noche-suave); }
    @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
  `,
  template: `
    @for (item of items(); track item.pregunta) {
      <details>
        <summary>{{ item.pregunta }}<svg lucidePlus [size]="20" aria-hidden="true"></svg></summary>
        <p class="mb-entra">{{ item.respuesta }}</p>
      </details>
    }
  `,
})
export class Accordion {
  readonly items = input.required<AccordionItem[]>();
}

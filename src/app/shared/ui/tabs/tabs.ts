import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChildren } from '@angular/core';

export interface TabItem<T extends string = string> {
  valor: T;
  etiqueta: string;
  cantidad?: number;
  /** El contador pide atención. */
  urgente?: boolean;
}

/**
 * Pestañas con flechas del teclado. Quien las usa pone el panel: `role="tabpanel"` con `id` igual a `panelId` y
 * `aria-labelledby` igual al id de la pestaña elegida (`panelId-valor`).
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    [role='tablist'] { display: flex; gap: var(--space-5); overflow-x: auto; border-bottom: 1px solid var(--linea); }
    button {
      display: inline-flex; align-items: center; gap: var(--space-2); min-height: 48px; padding: 0; border: 0; background: transparent; color: var(--noche);
      font: inherit; font-size: 15px; line-height: 22px; font-weight: 600; white-space: nowrap; cursor: pointer;
    }
    button[aria-selected='true'] { color: var(--azul-texto); font-weight: 700; box-shadow: inset 0 -3px 0 var(--azul-texto); }
    button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; }
    .count {
      min-width: 22px; height: 22px; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
      border-radius: var(--radio-pildora); background: var(--neutro-suave); color: var(--noche); font-size: 12px; font-weight: 700;
    }
    [aria-selected='true'] .count { background: var(--azul-suave); color: var(--azul-texto); }
    .count.is-urgent { background: var(--naranja-texto); color: var(--blanco); }
  `,
  template: `
    <div role="tablist" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.valor) {
        <button
          #button
          type="button"
          role="tab"
          [id]="panelId() + '-' + tab.valor"
          [attr.aria-controls]="panelId()"
          [attr.aria-selected]="tab.valor === value()"
          [tabindex]="tab.valor === value() ? 0 : -1"
          (click)="value.set(tab.valor)"
        >
          {{ tab.etiqueta }}
          @if (tab.cantidad !== undefined) { <span class="count" [class.is-urgent]="tab.urgente">{{ tab.cantidad }}</span> }
        </button>
      }
    </div>
  `,
})
export class Tabs<T extends string = string> {
  readonly tabs = input.required<TabItem<T>[]>();
  readonly value = model.required<T>();
  readonly label = input.required<string>();
  readonly panelId = input.required<string>();

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('button');

  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabs();
    const current = tabs.findIndex((tab) => tab.valor === this.value());
    const targets: Record<string, number> = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.value.set(tabs[next].valor);
    this.buttons()[next].nativeElement.focus();
  }
}

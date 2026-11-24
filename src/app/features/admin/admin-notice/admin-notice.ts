import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { Notice } from '../status';

/** Cómo salió la última acción. El contenedor está siempre, para que el aviso se anuncie al aparecer. */
@Component({
  selector: 'app-admin-notice',
  imports: [LucideCircleAlert, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status' },
  styles: `
    :host { display: block; }
    p { display: flex; align-items: center; gap: var(--space-2); margin: 0; }
    svg { flex: none; }
    .error { padding: var(--space-3) 14px; border-radius: var(--radio-sm); background: var(--naranja-suave); color: var(--naranja-texto); font-size: 15px; line-height: 22px; font-weight: 600; }
  `,
  template: `
    @if (notice(); as n) {
      <p class="mb-entra" [class]="n.kind === 'ok' ? 'mb-aviso' : 'error'">
        @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="18" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="18" aria-hidden="true"></svg> }
        {{ n.text }}
      </p>
    }
  `,
})
export class AdminNotice {
  readonly notice = input.required<Notice | null>();
}

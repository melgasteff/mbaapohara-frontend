import { afterNextRender, ElementRef, inject, Injectable, Injector, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminCounts } from '../../core/api/admin-counts';
import { apiErrorMessage } from '../../core/api/api-error';
import { Notice } from './status';

interface RunOptions {
  /** Al salir bien: cerrar un formulario, volver a pedir la lista. */
  done?: () => void;
  /** Al fallar. Por ejemplo, volver a pedir la lista si otra persona decidió antes. */
  failed?: () => void;
}

/**
 * Lo que comparten las pantallas de administración: ejecutar una acción de a una por vez, avisar cómo salió y pedir
 * confirmación en línea. Los botones no se deshabilitan: un segundo clic se ignora. Se provee en cada pantalla.
 */
@Injectable()
export class AdminActions {
  private readonly counts = inject(AdminCounts);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Clave de la acción en curso. */
  readonly busy = signal<string | null>(null);
  readonly notice = signal<Notice | null>(null);
  /** Clave de la acción que espera confirmación. */
  readonly confirming = signal<string | null>(null);

  ask(key: string): void {
    if (this.busy() !== null) return;
    this.notice.set(null);
    this.confirming.set(key);
  }

  /** Cierra la confirmación y devuelve el foco al botón que la abrió (`data-accion` con la misma clave). */
  cancel(): void {
    const key = this.confirming();
    this.confirming.set(null);
    if (key) this.focus(`[data-accion="${key}"]`);
  }

  run(key: string, action: Observable<unknown>, success: string, { done, failed }: RunOptions = {}): void {
    if (this.busy() !== null) return;
    this.busy.set(key);
    this.confirming.set(null);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.counts.refresh();
        done?.();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
        failed?.();
      },
    });
  }

  focus(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}

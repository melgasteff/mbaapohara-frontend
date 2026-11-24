import { afterNextRender, ElementRef, Injector } from '@angular/core';

/** Después de un envío con errores, lleva el foco al primer campo marcado con `aria-invalid`. */
export function focusFirstInvalid(host: ElementRef<HTMLElement>, injector: Injector): void {
  afterNextRender(() => host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector });
}

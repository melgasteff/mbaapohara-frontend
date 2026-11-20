import { HttpErrorResponse } from '@angular/common/http';

/** Texto para mostrar de un error de la API. Los mensajes del backend ya vienen en castellano. */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Algo salió mal. Intentá de nuevo.';
  if (error.status === 0) return 'No pudimos conectarnos con el servidor. Revisá que la API esté en marcha.';
  const message = (error.error as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message) return message;
  return 'Algo salió mal. Intentá de nuevo.';
}

/** Pide confirmación antes de una acción que no se puede deshacer. */
export function confirmAction(message: string): boolean {
  return window.confirm(message);
}

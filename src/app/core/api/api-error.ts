import { HttpErrorResponse } from '@angular/common/http';

/** Texto para mostrar de un error de la API. Los mensajes del backend ya vienen en castellano. */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Algo salió mal. Intentá de nuevo.';
  if (error.status === 0) return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
  const message = (error.error as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message) return message;
  return 'Algo salió mal. Intentá de nuevo.';
}

/** Problemas uno por uno de una reseña que la API no aceptó (campo `problemas` del 400 de /reviews). */
export function apiProblems(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return [];
  const problems = (error.error as { problemas?: unknown } | null)?.problemas;
  return Array.isArray(problems) ? problems.filter((p): p is string => typeof p === 'string') : [];
}

/** La API respondió 409 (conflicto): por ejemplo, ya hay una reseña de ese local. */
export function isConflict(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 409;
}

/** Pide confirmación antes de una acción que no se puede deshacer. */
export function confirmAction(message: string): boolean {
  return window.confirm(message);
}

import { Injectable, signal } from '@angular/core';

/**
 * Texto de la salida en el encabezado «foco». Lo fija el asistente, porque depende de si lo escrito queda guardado.
 * Nunca es «Salir», que en el resto del sitio cierra la sesión.
 */
@Injectable({ providedIn: 'root' })
export class FocusExit {
  readonly label = signal<'Guardar y salir' | 'Salir sin guardar' | 'Volver al inicio'>('Volver al inicio');
}

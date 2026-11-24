import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';

/** Mensaje para la persona según la respuesta de /auth (ver AuthExceptionFilter del backend). */
export function authErrorMessage(error: unknown, context: 'ingresar' | 'registro'): string {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  switch (status) {
    case 0:
      return 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.';
    case 401:
      return 'El correo o la contraseña no son correctos.';
    case 403:
      return 'Tu cuenta está bloqueada. Si creés que es un error, escribinos.';
    case 409:
      return 'Ya hay una cuenta con ese correo. Probá ingresar.';
    case 429:
      return 'Hiciste muchos intentos. Esperá un minuto y probá de nuevo.';
    case 400:
      return context === 'registro' ? 'Revisá los datos: el correo o la contraseña no cumplen las reglas.' : 'Revisá el correo y la contraseña.';
    default:
      return 'Algo salió mal. Intentá de nuevo en unos minutos.';
  }
}

/** Qué le falta al correo. */
export function emailMessage(control: AbstractControl<string>): string {
  if (!control.value.trim()) return 'Escribí tu correo.';
  return control.hasError('maxlength') ? 'El correo es demasiado largo.' : 'Revisá el correo: falta algo, como la @.';
}

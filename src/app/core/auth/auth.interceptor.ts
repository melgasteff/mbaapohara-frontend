import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

/** ¿La petición va a nuestra API? El token nunca se envía a otros orígenes ni a los archivos estáticos. */
export function isApiRequest(url: string): boolean {
  return url === environment.apiUrl || url.startsWith(`${environment.apiUrl}/`);
}

/**
 * Agrega el token a las peticiones a la API. Si la API responde 401 a una petición que llevaba el token
 * (vencido, cuenta borrada), cierra la sesión y lleva a ingresar, con regreso a la página actual.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const token = session.token();
  const send = token && isApiRequest(request.url) && !request.headers.has('Authorization');

  return next(send ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request).pipe(
    catchError((error: unknown) => {
      if (send && error instanceof HttpErrorResponse && error.status === 401) {
        session.end();
        router.navigate(['/ingresar'], { queryParams: { volver: router.url } });
      }
      return throwError(() => error);
    }),
  );
};

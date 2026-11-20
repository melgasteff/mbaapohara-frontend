import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { SessionService } from './session.service';

function toUrl(segments: UrlSegment[]): string {
  return '/' + segments.map((segment) => segment.path).join('/');
}

/** Exige sesión iniciada. Sin sesión lleva a ingresar y, al entrar, vuelve a la página pedida. */
export const authGuard: CanMatchFn = (_route, segments) => {
  if (inject(SessionService).isAuthenticated()) return true;
  return inject(Router).createUrlTree(['/ingresar'], { queryParams: { volver: toUrl(segments) } });
};

/**
 * Exige el rol administrador. Con `canMatch`, el código de administración ni siquiera se descarga para
 * quien no lo es. Sin sesión lleva a ingresar; con sesión de usuario, a la portada.
 */
export const adminGuard: CanMatchFn = (_route, segments) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (session.isAdmin()) return true;
  if (session.isAuthenticated()) return router.createUrlTree(['/']);
  return router.createUrlTree(['/ingresar'], { queryParams: { volver: toUrl(segments) } });
};

/** Destino seguro para «volver»: solo rutas internas («/…», nunca «//otro-sitio»). */
export function safeReturnUrl(value: string | null | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
}

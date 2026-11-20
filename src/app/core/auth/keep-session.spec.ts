import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor, KEEP_SESSION_ON_401 } from './auth.interceptor';
import { SessionService } from './session.service';

describe('authInterceptor con KEEP_SESSION_ON_401', () => {
  it('no cierra la sesión cuando el 401 es una contraseña de confirmación incorrecta', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    const session = TestBed.inject(SessionService);
    session.start('cabecera.e30.firma', {
      id: 1, email: 'persona@ejemplo.com', rol: 'usuario', estado: 'activo', fechaConsentimiento: null, fechaCreacion: '2026-11-19T00:00:00Z',
    });
    TestBed.inject(HttpClient)
      .delete(`${environment.apiUrl}/users/me`, { body: { password: 'x' }, context: new HttpContext().set(KEEP_SESSION_ON_401, true) })
      .subscribe({ error: () => {} });
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/users/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(session.isAuthenticated()).toBe(true);
    sessionStorage.clear();
  });
});

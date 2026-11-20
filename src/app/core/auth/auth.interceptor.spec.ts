import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { SessionService } from './session.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    // Token sin `exp`: la sesión no lo vence sola.
    session.start('cabecera.e30.firma', {
      id: 1,
      email: 'persona@ejemplo.com',
      rol: 'usuario',
      estado: 'activo',
      fechaConsentimiento: null,
      fechaCreacion: '2026-11-19T00:00:00Z',
    });
  });

  afterEach(() => backend.verify());

  it('agrega el token a las peticiones a la API', () => {
    http.get(`${environment.apiUrl}/users/me`).subscribe();
    expect(backend.expectOne(`${environment.apiUrl}/users/me`).request.headers.get('Authorization')).toBe(
      'Bearer cabecera.e30.firma',
    );
  });

  it('nunca envía el token a otros orígenes ni a archivos estáticos', () => {
    http.get('/criterios-provisionales.json').subscribe();
    http.get('https://otro-sitio.example/datos').subscribe();
    http.get(`${environment.apiUrl}.otro-sitio.example/datos`).subscribe();
    for (const request of backend.match(() => true)) {
      expect(request.request.headers.has('Authorization')).toBe(false);
    }
  });

  it('cierra la sesión y lleva a ingresar si la API responde 401', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get(`${environment.apiUrl}/users/me`).subscribe({ error: () => {} });
    backend.expectOne(`${environment.apiUrl}/users/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(session.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/ingresar'], { queryParams: { volver: '/' } });
  });
});

import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RegisterRequest } from '../models/account';
import { AccountCreatedError, AuthApi } from './auth-api';

describe('AuthApi.register', () => {
  const request: RegisterRequest = { email: 'persona@ejemplo.com', password: 'abcDEF1!', aceptaTerminos: true };
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('si la cuenta se crea y el ingreso da 429, avisa que la cuenta existe', () => {
    let error: unknown;
    api.register(request).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${environment.apiUrl}/auth/register`).flush({ id: 1, email: request.email }, { status: 201, statusText: 'Created' });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({}, { status: 429, statusText: 'Too Many Requests' });
    expect(error).toBeInstanceOf(AccountCreatedError);
    expect(((error as AccountCreatedError).cause as HttpErrorResponse).status).toBe(429);
  });

  it('si la creación falla, devuelve el error de la API y no intenta ingresar', () => {
    let error: unknown;
    api.register(request).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${environment.apiUrl}/auth/register`).flush({}, { status: 409, statusText: 'Conflict' });
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error).not.toBeInstanceOf(AccountCreatedError);
  });
});

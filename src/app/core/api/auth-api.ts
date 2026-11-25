import { HttpClient, HttpContext, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KEEP_SESSION_ON_401 } from '../auth/auth.interceptor';
import { SessionService } from '../auth/session.service';
import { Account, Credentials, RegisterRequest, TokenResponse } from '../models/account';

/** La cuenta se creó, pero el ingreso que sigue falló (por ejemplo, 429 por el límite de intentos). */
export class AccountCreatedError extends Error {
  constructor(override readonly cause: unknown) {
    super('La cuenta se creó, pero no se pudo iniciar la sesión');
  }
}

/** Autenticación (POST /auth/login, POST /auth/register, GET /users/me). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly url = environment.apiUrl;

  /** Inicia sesión: pide el token y después la cuenta, que trae el rol y confirma que la cuenta está activa. */
  signIn(credentials: Credentials): Observable<Account> {
    return this.http.post<TokenResponse>(`${this.url}/auth/login`, credentials).pipe(
      switchMap(({ accessToken }) =>
        this.http
          .get<Account>(`${this.url}/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
          .pipe(tap((account) => this.session.start(accessToken, account))),
      ),
    );
  }

  /** La cuenta con sesión iniciada (el interceptor agrega el token). */
  meResource() {
    return httpResource<Account>(() => `${this.url}/users/me`);
  }

  /** Todos los datos de la cuenta, para descargarlos. */
  exportData(): Observable<unknown> {
    return this.http.get<unknown>(`${this.url}/users/me/export`);
  }

  /** Elimina la cuenta y sus reseñas (D9); pide la contraseña para confirmar. Cierra la sesión. */
  deleteAccount(password: string): Observable<void> {
    return this.http
      // Una contraseña incorrecta responde 401: no es una sesión vencida.
      .delete<void>(`${this.url}/users/me`, { body: { password }, context: new HttpContext().set(KEEP_SESSION_ON_401, true) })
      .pipe(tap(() => this.session.end()));
  }

  /** Crea la cuenta e inicia la sesión. Si solo falla el ingreso, avisa con AccountCreatedError: la cuenta ya existe. */
  register(request: RegisterRequest): Observable<Account> {
    return this.http.post<Account>(`${this.url}/auth/register`, request).pipe(
      switchMap(() =>
        this.signIn({ email: request.email, password: request.password }).pipe(
          catchError((error: unknown) => throwError(() => new AccountCreatedError(error))),
        ),
      ),
    );
  }
}

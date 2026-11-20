import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../auth/session.service';
import { Account, Credentials, RegisterRequest, TokenResponse } from '../models/account';

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

  /** Crea la cuenta e inicia la sesión. */
  register(request: RegisterRequest): Observable<Account> {
    return this.http
      .post<Account>(`${this.url}/auth/register`, request)
      .pipe(switchMap(() => this.signIn({ email: request.email, password: request.password })));
  }
}

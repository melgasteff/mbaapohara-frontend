import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Account } from '../models/account';
import { authGuard, safeReturnUrl } from './guards';
import { SessionService } from './session.service';

@Component({ template: '' })
class Empty {}

const ACCOUNT: Account = {
  id: 1, email: 'persona@ejemplo.com', rol: 'usuario', estado: 'activo', fechaConsentimiento: null, fechaCreacion: '2026-11-19T00:00:00Z',
};

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'publicar', canMatch: [authGuard], children: [{ path: '', component: Empty }, { path: ':id/editar', component: Empty }] },
          { path: 'ingresar', component: Empty },
        ]),
      ],
    });
    router = TestBed.inject(Router);
  });

  it('sin sesión, vuelve a la página pedida con sus parámetros', async () => {
    await router.navigateByUrl('/publicar?empresa=5');
    expect(router.parseUrl(router.url).queryParams).toEqual({ volver: '/publicar?empresa=5' });
  });

  it('sin sesión, conserva la ruta completa', async () => {
    await router.navigateByUrl('/publicar/9/editar');
    expect(router.parseUrl(router.url).queryParams).toEqual({ volver: '/publicar/9/editar' });
  });

  it('con sesión, deja pasar', async () => {
    TestBed.inject(SessionService).start('cabecera.e30.firma', ACCOUNT);
    await router.navigateByUrl('/publicar?empresa=5');
    expect(router.url).toBe('/publicar?empresa=5');
  });

  it('el destino con parámetros sigue siendo una ruta interna', () => {
    expect(safeReturnUrl('/publicar?empresa=5')).toBe('/publicar?empresa=5');
    expect(safeReturnUrl('//otro-sitio.example')).toBe('/');
  });
});

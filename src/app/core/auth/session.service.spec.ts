import { TestBed } from '@angular/core/testing';
import { Account } from '../models/account';
import { SessionService, tokenExpiry } from './session.service';

/** Token de prueba sin firma válida: la sesión solo lee `exp`. */
function fakeToken(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ sub: 1, rol: 'administrador', exp: expSeconds }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `cabecera.${payload}.firma`;
}

const ACCOUNT: Account = {
  id: 1,
  email: 'persona@ejemplo.com',
  rol: 'administrador',
  estado: 'activo',
  fechaConsentimiento: null,
  fechaCreacion: '2026-11-19T00:00:00Z',
};

describe('SessionService', () => {
  beforeEach(() => sessionStorage.clear());

  it('lee el vencimiento del token', () => {
    expect(tokenExpiry(fakeToken(1_800_000_000))).toBe(1_800_000_000_000);
    expect(tokenExpiry('no-es-un-token')).toBeNull();
  });

  it('inicia la sesión, la guarda y reconoce al administrador', () => {
    const session = TestBed.inject(SessionService);
    session.start(fakeToken(Date.now() / 1000 + 3600), ACCOUNT);
    expect(session.isAuthenticated()).toBe(true);
    expect(session.isAdmin()).toBe(true);
    expect(sessionStorage.getItem('mbaapohara.sesion')).toContain('persona@ejemplo.com');
  });

  it('no acepta un token vencido', () => {
    const session = TestBed.inject(SessionService);
    session.start(fakeToken(Date.now() / 1000 - 60), ACCOUNT);
    expect(session.isAuthenticated()).toBe(false);
  });

  it('descarta al arrancar una sesión guardada que ya venció', () => {
    sessionStorage.setItem('mbaapohara.sesion', JSON.stringify({ token: fakeToken(Date.now() / 1000 - 60), account: ACCOUNT }));
    const session = TestBed.inject(SessionService);
    expect(session.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('mbaapohara.sesion')).toBeNull();
  });

  it('cierra la sesión', () => {
    const session = TestBed.inject(SessionService);
    session.start(fakeToken(Date.now() / 1000 + 3600), ACCOUNT);
    session.end();
    expect(session.token()).toBeNull();
    expect(sessionStorage.getItem('mbaapohara.sesion')).toBeNull();
  });
});

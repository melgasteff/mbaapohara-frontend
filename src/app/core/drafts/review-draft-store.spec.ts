import { TestBed } from '@angular/core/testing';
import { SessionService } from '../auth/session.service';
import { Account } from '../models/account';
import { ReviewDraftStore, SavedDraft } from './review-draft-store';

const account = (id: number): Account => ({
  id, email: `persona${id}@ejemplo.com`, rol: 'usuario', estado: 'activo', fechaConsentimiento: null, fechaCreacion: '2026-11-19T00:00:00Z',
});
const draft: SavedDraft = {
  paso: 3, empresa: { id: 4, nombre: 'Empresa Ficticia' }, idLocal: 5, cargo: 'Cajera', situacion: 'ANTERIOR', ultimoAnio: 2024,
  tipoContrato: 1, modalidad: 3, respuestas: { CP01: 'SI' }, calificacion: null, loBueno: 'Texto', aMejorar: '',
};

describe('ReviewDraftStore', () => {
  let session: SessionService;
  let store: ReviewDraftStore;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    session = TestBed.inject(SessionService);
    store = TestBed.inject(ReviewDraftStore);
    // Token sin `exp`: la sesión no lo vence sola.
    session.start('cabecera.e30.firma', account(1));
  });
  afterEach(() => localStorage.clear());

  it('guarda y recupera el borrador', () => {
    store.save(draft);
    expect(store.load()).toEqual(draft);
  });

  it('cada persona ve solo el suyo', () => {
    store.save(draft);
    session.start('cabecera.e30.firma', account(2));
    expect(store.load()).toBeNull();
    session.start('cabecera.e30.firma', account(1));
    expect(store.load()).toEqual(draft);
  });

  it('la clave no lleva el correo', () => {
    store.save(draft);
    expect(Object.keys(localStorage)).toEqual(['mbaapohara.borrador.1']);
  });

  it('sigue después de cerrar sesión, pero sin sesión no se lee', () => {
    store.save(draft);
    session.end();
    expect(store.load()).toBeNull();
    session.start('cabecera.e30.firma', account(1));
    expect(store.load()).toEqual(draft);
  });

  it('se borra al enviar y, sin sesión, al eliminar la cuenta', () => {
    store.save(draft);
    store.clear();
    expect(store.load()).toBeNull();
    store.save(draft);
    session.end();
    store.clear(1);
    expect(localStorage.length).toBe(0);
  });

  it('descarta un contenido con otra forma', () => {
    for (const value of ['no es json', '{}', JSON.stringify({ version: 0, borrador: draft }), JSON.stringify({ version: 1, borrador: { ...draft, loBueno: 3 } })]) {
      localStorage.setItem('mbaapohara.borrador.1', value);
      expect(store.load()).toBeNull();
    }
  });

  it('si el navegador no deja guardar, lo avisa y no falla', () => {
    expect(store.available()).toBe(true);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('lleno');
    });
    store.save(draft);
    expect(store.available()).toBe(false);
    spy.mockRestore();
  });
});

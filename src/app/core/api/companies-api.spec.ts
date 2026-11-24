import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CompaniesQuery } from '../models/company';
import { CompaniesApi } from './companies-api';

describe('CompaniesApi', () => {
  let api: CompaniesApi;
  let http: HttpTestingController;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CompaniesApi);
    http = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
  });

  afterEach(() => http.verify());

  it('envía los filtros como parámetros y omite los vacíos', () => {
    const query = signal<CompaniesQuery>({ q: 'banco', ciudad: 1, rubro: undefined, page: 2 });
    runInInjectionContext(injector, () => api.listResource(query));
    TestBed.tick();

    const req = http.expectOne((r) => r.url.endsWith('/companies'));
    expect(req.request.params.get('q')).toBe('banco');
    expect(req.request.params.get('ciudad')).toBe('1');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.has('rubro')).toBe(false);
    req.flush({ data: [], total: 0, page: 2, pageSize: 20 });
  });

  it('pide los conteos con los mismos filtros; «sin reseñas» viaja como false', () => {
    runInInjectionContext(injector, () => api.facetsResource(signal({ grupo: 'comercio' as const, departamento: 5, conResenas: false })));
    TestBed.tick();

    const req = http.expectOne((r) => r.url.endsWith('/companies/facets'));
    expect(req.request.params.get('grupo')).toBe('comercio');
    expect(req.request.params.get('departamento')).toBe('5');
    expect(req.request.params.get('conResenas')).toBe('false');
    req.flush({});
  });

  it('no pide el detalle mientras no hay id', () => {
    runInInjectionContext(injector, () => api.detailResource(signal(undefined)));
    TestBed.tick();
    http.expectNone(() => true);
  });
});

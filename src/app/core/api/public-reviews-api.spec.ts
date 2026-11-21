import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PublicReviewsQuery } from '../models/review';
import { PublicReviewsApi } from './public-reviews-api';

describe('PublicReviewsApi', () => {
  let http: HttpTestingController;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
  });

  afterEach(() => http.verify());

  it('envía los filtros de RF5 como parámetros y omite los vacíos', () => {
    const query = signal<PublicReviewsQuery | undefined>({ empresa: 4, cargo: 2, situacion: 'ANTERIOR', modalidad: undefined, page: 2 });
    runInInjectionContext(injector, () => TestBed.inject(PublicReviewsApi).listResource(query));
    TestBed.tick();

    const req = http.expectOne((r) => r.url.endsWith('/reviews'));
    expect(req.request.params.get('empresa')).toBe('4');
    expect(req.request.params.get('cargo')).toBe('2');
    expect(req.request.params.get('situacion')).toBe('ANTERIOR');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.has('modalidad')).toBe(false);
    req.flush({ data: [], total: 0, page: 2, pageSize: 10 });
  });

  it('sin consulta no pide nada', () => {
    runInInjectionContext(injector, () => TestBed.inject(PublicReviewsApi).listResource(signal(undefined)));
    TestBed.tick();
    http.expectNone(() => true);
  });
});

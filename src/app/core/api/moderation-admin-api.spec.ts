import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdminCounts, sumCounts } from './admin-counts';
import { ModerationAdminApi } from './moderation-admin-api';

describe('Administración: decisiones y contadores', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('publica y rechaza con PATCH', () => {
    const api = TestBed.inject(ModerationAdminApi);
    api.publish(5).subscribe();
    http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/moderation/queue/5/publish')).flush({});
    api.reject(6, 'TER', 'Contá lo que pasó sin decir quién fue.').subscribe();
    const reject = http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/moderation/queue/6/reject'));
    expect(reject.request.body).toEqual({ categoria: 'TER', motivo: 'Contá lo que pasó sin decir quién fue.' });
    reject.flush({});
  });

  it('cuenta lo pendiente, lo vuelve a pedir y conserva el número mientras carga', async () => {
    const counts = TestBed.inject(AdminCounts);
    const injector = TestBed.inject(Injector);
    const [companies, offices] = runInInjectionContext(injector, () => [counts.count('empresas'), counts.count('locales')]);
    const total = sumCounts(companies, offices);
    const flush = async (path: string, value: number) => {
      http.expectOne((r) => r.url.endsWith(path) && r.params.get('estado') === 'pendiente' && r.params.get('pageSize') === '1').flush({ data: [], total: value, page: 1, pageSize: 1 });
      await Promise.resolve();
      TestBed.tick();
    };
    TestBed.tick();
    expect(total()).toBeUndefined();
    await flush('/companies/admin', 2);
    await flush('/offices/admin', 3);
    expect(total()).toBe(5);
    counts.refresh();
    TestBed.tick();
    expect(total()).toBe(5);
    await flush('/companies/admin', 1);
    await flush('/offices/admin', 3);
    expect(total()).toBe(4);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModerationAdminApi } from './moderation-admin-api';

describe('ModerationAdminApi', () => {
  let api: ModerationAdminApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ModerationAdminApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('publica y rechaza con PATCH, y cada decisión vuelve a pedir la cantidad pendiente', () => {
    runInInjectionContext(TestBed.inject(Injector), () => api.pendingResource());
    TestBed.tick();
    http.expectOne((r) => r.url.endsWith('/moderation/queue') && r.params.get('pageSize') === '1').flush({ data: [], total: 2, page: 1, pageSize: 1 });

    api.publish(5).subscribe();
    http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/moderation/queue/5/publish')).flush({ idResena: 1, estado: 'publicada' });
    TestBed.tick();
    http.expectOne((r) => r.url.endsWith('/moderation/queue') && r.params.get('pageSize') === '1').flush({ data: [], total: 1, page: 1, pageSize: 1 });

    api.reject(6, 'TER', 'Contá lo que pasó sin decir quién fue.').subscribe();
    const reject = http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/moderation/queue/6/reject'));
    expect(reject.request.body).toEqual({ categoria: 'TER', motivo: 'Contá lo que pasó sin decir quién fue.' });
    reject.flush({ idResena: 2, estado: 'rechazada' });
    TestBed.tick();
    http.expectOne((r) => r.url.endsWith('/moderation/queue')).flush({ data: [], total: 0, page: 1, pageSize: 1 });
  });
});

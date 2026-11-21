import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CriteriaApi } from './criteria-api';

describe('CriteriaApi', () => {
  let api: CriteriaApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CriteriaApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Espera a que los recursos procesen las respuestas. */
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  const categorias = [{ codigo: 'CAT', nombre: 'Categoría', orden: 1, items: [{ codigo: 'CP01', orden: 1, texto: 'Ítem' }] }];

  it('arma la configuración con la forma del JSON y las categorías de la API', async () => {
    const config = runInInjectionContext(TestBed.inject(Injector), () => api.configResource());
    TestBed.tick();
    http.expectOne('/criterios-provisionales.json').flush({ version: 'v', opcionesRespuesta: [], situaciones: [], textos: [] });
    expect(config.hasValue()).toBe(false);
    http.expectOne((r) => r.url.endsWith('/criteria')).flush(categorias);
    await settle();
    expect(config.hasValue()).toBe(true);
    expect(config.value()).toMatchObject({ version: 'v', categorias });
  });

  it('si falla la API, informa el error y reload vuelve a pedir solo lo que falló', async () => {
    const config = runInInjectionContext(TestBed.inject(Injector), () => api.configResource());
    TestBed.tick();
    http.expectOne('/criterios-provisionales.json').flush({ version: 'v' });
    http.expectOne((r) => r.url.endsWith('/criteria')).flush('caída', { status: 503, statusText: 'Service Unavailable' });
    await settle();
    expect(config.error()).toBeTruthy();
    expect(config.hasValue()).toBe(false);

    config.reload();
    TestBed.tick();
    http.expectOne((r) => r.url.endsWith('/criteria')).flush(categorias);
    await settle();
    expect(config.hasValue()).toBe(true);
  });

  it('crea y cambia categorías e ítems; el código no se manda al editar', () => {
    api.createCategory('BENEFICIOS', 'Beneficios').subscribe();
    const cat = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/criteria/categories'));
    expect(cat.request.body).toEqual({ codigo: 'BENEFICIOS', nombre: 'Beneficios' });
    cat.flush({});

    api.createItem(3, 'CP10', 'Recibí capacitación').subscribe();
    const item = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/criteria/items'));
    expect(item.request.body).toEqual({ idCategoria: 3, codigo: 'CP10', texto: 'Recibí capacitación' });
    item.flush({});

    api.updateItem(7, { activo: false }).subscribe();
    const patch = http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/criteria/items/7'));
    expect(patch.request.body).toEqual({ activo: false });
    patch.flush({});

    api.updateCategory(3, { nombre: 'Otro', orden: 2 }).subscribe();
    http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/criteria/categories/3')).flush({});
  });
});

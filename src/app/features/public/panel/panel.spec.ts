import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Insights } from '../../../core/models/insights';
import { Panel } from './panel';
import { indicatorText, placeOptions, segments } from './panel-view';

const VALUE = { resenas: 3, si: 3, enParte: 1, no: 1, noSabe: 1, porcentajeSi: 60 };
const DATA: Insights = {
  resenas: 4,
  empresas: 2,
  promedio: 3.8,
  minimo: 3,
  categorias: [
    {
      codigo: 'CP',
      nombre: 'Contratación, formalidad y pagos',
      indicador: VALUE,
      criterios: [
        { codigo: 'CP01', texto: 'Firmé un contrato de trabajo escrito.', indicador: { ...VALUE, enParte: 0, noSabe: 0, porcentajeSi: 75, si: 3, no: 1, resenas: 4 } },
        { codigo: 'CP02', texto: 'Me inscribieron en el IPS.', indicador: null },
      ],
    },
    { codigo: 'JL', nombre: 'Jornada, descansos y licencias', indicador: null, criterios: [{ codigo: 'JL01', texto: 'Tuve un día de descanso.', indicador: null }] },
  ],
};

describe('Panel: cálculos', () => {
  it('las partes suman 100 % y dejan «No sé» afuera', () => {
    const parts = segments(VALUE);
    expect(parts.map((p) => p.clave)).toEqual(['si', 'enParte', 'no']);
    expect(parts.map((p) => p.porcentaje)).toEqual([60, 20, 20]);
  });

  it('describe la barra en texto, con «No sé» solo si hay', () => {
    expect(indicatorText(VALUE)).toBe('3 Sí · 1 En parte · 1 No · 1 No sé — 3 reseñas sin contar «No sé»');
    expect(indicatorText({ ...VALUE, noSabe: 0, resenas: 1 })).toBe('3 Sí · 1 En parte · 1 No — 1 reseña sin contar «No sé»');
  });

  it('el lugar ofrece todo el país, la ciudad de la URL y todos los departamentos', () => {
    const options = placeOptions(undefined, 12, [{ id: 5, nombre: 'Caaguazú' }], { id: 12, nombre: 'Coronel Oviedo' });
    expect(options.map((o) => o.valor)).toEqual([null, 'c12', 'd5']);
    expect(options[1].etiqueta).toBe('Coronel Oviedo');
  });
});

describe('Panel', () => {
  let fixture: ComponentFixture<Panel>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Panel);
  });

  async function load(body: Insights | null, query: Record<string, unknown> = {}): Promise<void> {
    for (const [key, value] of Object.entries(query)) fixture.componentRef.setInput(key, value);
    TestBed.tick();
    http.expectOne((r) => r.url.endsWith('/departments')).flush({ data: [{ id: 5, nombre: 'Caaguazú' }], total: 1, page: 1, pageSize: 100 });
    const request = http.expectOne((r) => r.url.endsWith('/insights'));
    if (body) request.flush(body);
    else request.flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
  }

  it('muestra las cifras, el porcentaje y los números de cada barra', async () => {
    await load(DATA);
    const stats = [...el().querySelectorAll('.stat')].map((s) => [s.querySelector('dt')?.textContent, s.querySelector('dd')?.textContent?.trim()]);
    expect(stats[0]).toEqual(['Reseñas publicadas', '4']);
    expect(stats[2][1]).toMatch(/^3[.,]8 de 5$/);
    const category = el().querySelector('.row--category')!;
    expect(category.textContent).toContain('60 %');
    expect(category.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Contratación, formalidad y pagos: 60 % de «Sí». 3 Sí · 1 En parte · 1 No · 1 No sé — 3 reseñas sin contar «No sé»',
    );
    // Una parte en cero no se dibuja.
    const criterion = el().querySelector('.criteria .row')!;
    expect([...criterion.querySelectorAll('.part')].map((p) => p.getAttribute('data-answer'))).toEqual(['si', 'no']);
  });

  it('sin el mínimo de reseñas no muestra valores, pero lista los criterios', async () => {
    await load(DATA);
    const second = el().querySelectorAll('.category')[1];
    expect(second.textContent).toContain('Faltan reseñas: aparece desde 3');
    expect(second.querySelector('[role="img"]')).toBeNull();
    expect(second.textContent).toContain('Tuve un día de descanso.');
    expect(second.querySelector('summary')?.textContent).toBe('Ver el criterio');
  });

  it('pide los indicadores con los filtros de la URL', async () => {
    fixture.componentRef.setInput('grupo', 'comercio');
    fixture.componentRef.setInput('ciudad', '12');
    TestBed.tick();
    const request = http.expectOne((r) => r.url.endsWith('/insights'));
    expect(request.request.params.get('grupo')).toBe('comercio');
    expect(request.request.params.get('ciudad')).toBe('12');
    expect(request.request.params.has('departamento')).toBe(false);
  });

  it('sin reseñas lo dice y sin promedio muestra desde cuántas aparece', async () => {
    await load({ ...DATA, resenas: 0, empresas: 0, promedio: null, categorias: [{ ...DATA.categorias[1] }] });
    expect(text()).toContain('Todavía no hay reseñas publicadas con estos filtros');
    expect(text()).toContain('desde 3 reseñas');
  });

  it('si falla la API ofrece reintentar', async () => {
    await load(null);
    expect(text()).toContain('No pudimos cargar los indicadores');
  });
});

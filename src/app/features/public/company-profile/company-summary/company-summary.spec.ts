import { registerLocaleData } from '@angular/common';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CompanyDetail, Topic } from '../../../../core/models/company';
import { CompanySummaryBand } from './company-summary';

registerLocaleData(localeEsPy);

const company: CompanyDetail = {
  id: 7, nombre: 'Empresa Ejemplo', rubro: { id: 1, codigoCiiu: 'G', nombre: 'Comercio', grupo: 'comercio' }, estado: 'aprobada',
  cantidadResenas: 0, promedio: null, temaPrincipal: null, logoUrl: null, distribucion: [], temas: [], locales: [],
};
const topic = (n: number): Topic => ({ codigo: `T${n}`, nombre: `Tema ficticio ${n}`, porcentajeSi: n * 10, resenas: 3 });
const distribucion = [5, 4, 3, 2, 1].map((estrellas) => ({ estrellas, cantidad: estrellas === 4 ? 3 : estrellas === 1 ? 1 : 0 }));

async function render(change: Partial<CompanyDetail>) {
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'es-PY' }] });
  const fixture = TestBed.createComponent(CompanySummaryBand);
  fixture.componentRef.setInput('company', { ...company, ...change });
  fixture.componentRef.setInput('words', { '4': 'Bueno' });
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, text: () => (el.textContent ?? '').replace(/\s+/g, ' ') };
}

describe('Resumen del perfil', () => {
  it('sin reseñas invita a contar la primera, con la empresa en el enlace', async () => {
    const { el, text } = await render({});
    expect(text()).toContain('Nadie contó todavía cómo es trabajar en Empresa Ejemplo');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/publicar?empresa=7');
    expect(el.querySelector('.rating')).toBeNull();
  });

  it('con 1 o 2 muestra el promedio y cuántas faltan', async () => {
    const one = await render({ cantidadResenas: 1, promedio: 4 });
    expect(one.text()).toContain('4,0');
    expect(one.text()).toContain('1 de 3 reseñas');
    expect(one.text()).toContain('Faltan 2 reseñas');
    expect(one.el.querySelectorAll('.few__step.is-done').length).toBe(1);
    TestBed.resetTestingModule();
    expect((await render({ cantidadResenas: 2, promedio: 4 })).text()).toContain('Falta una reseña');
  });

  it('con 3 o más muestra la distribución con sus barras y las palabras del JSON', async () => {
    const { el, text } = await render({ cantidadResenas: 4, promedio: 3.3, distribucion, temas: [topic(1)] });
    expect(text()).toContain('3,3');
    expect(text()).toContain('4 · Bueno');
    const widths = Array.from(el.querySelectorAll<HTMLElement>('.bar--stars .track span')).map((bar) => bar.style.width);
    expect(widths).toEqual(['0%', '75%', '0%', '0%', '25%']);
    expect(text()).toContain('10 %');
    expect(el.querySelector('.topics__head button')).toBeNull();
  });

  it('con más de 4 temas, despliega el resto', async () => {
    const { fixture, el } = await render({ cantidadResenas: 4, promedio: 3.3, distribucion, temas: [1, 2, 3, 4, 5, 6].map(topic) });
    const button = el.querySelector<HTMLButtonElement>('.topics__head button')!;
    expect(button.textContent?.trim()).toBe('Ver los 6 temas');
    expect(el.querySelectorAll('.bar--topic').length).toBe(4);
    button.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('.bar--topic').length).toBe(6);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('con 3 o más pero sin temas, explica por qué faltan', async () => {
    const { text } = await render({ cantidadResenas: 3, promedio: 3, distribucion });
    expect(text()).toContain('Todavía no hay temas para mostrar');
  });
});

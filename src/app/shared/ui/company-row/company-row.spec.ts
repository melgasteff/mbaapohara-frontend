import { registerLocaleData } from '@angular/common';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CompanySummary } from '../../../core/models/company';
import { CompanyRow, companyRowState } from './company-row';

registerLocaleData(localeEsPy);

const company: CompanySummary = {
  id: 7,
  nombre: 'Empresa Ejemplo',
  rubro: { id: 1, codigoCiiu: 'G', nombre: 'Comercio', grupo: 'comercio' },
  estado: 'aprobada',
  cantidadResenas: 0,
  promedio: null,
  temaPrincipal: null,
  logoUrl: null,
};

function render(change: Partial<CompanySummary>): HTMLElement {
  const fixture = TestBed.createComponent(CompanyRow);
  fixture.componentRef.setInput('company', { ...company, ...change });
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}
const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\s+/g, ' ');

describe('Fila de empresa', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'es-PY' }] }));

  it('elige el estado por la cantidad de reseñas', () => {
    expect([0, 1, 2, 3, 49, 50].map(companyRowState)).toEqual(['ninguna', 'pocas', 'pocas', 'con-temas', 'con-temas', 'muchas']);
  });

  it('toda la fila lleva al perfil', () => {
    expect(render({}).querySelector('h2 a')?.getAttribute('href')).toBe('/empresas/7');
  });

  it('sin reseñas invita a contar la primera', () => {
    const el = render({ cantidadResenas: 0, promedio: null });
    expect(text(el)).toContain('Nadie contó todavía');
    expect(el.querySelector('.cta')?.getAttribute('href')).toBe('/publicar?empresa=7');
  });

  it('con 1 o 2 muestra el promedio con coma y avisa desde cuándo hay temas', () => {
    const el = render({ cantidadResenas: 1, promedio: 4 });
    expect(text(el)).toContain('4,0');
    expect(text(el)).toMatch(/1 reseña(?!s)/);
    expect(text(el)).toContain('Los temas aparecen desde 3 reseñas');
  });

  it('con 3 o más suma el tema principal', () => {
    const el = render({ cantidadResenas: 9, promedio: 3.6, temaPrincipal: { codigo: 'X', nombre: 'Tema ficticio', porcentajeSi: 78, resenas: 9 } });
    expect(text(el)).toContain('3,6');
    expect(text(el)).toContain('Tema ficticio');
    expect(text(el)).toContain('78 %');
    expect(el.classList.contains('is-many')).toBe(false);
  });

  it('con muchas se destaca con fondo y sobretítulo', () => {
    const el = render({ cantidadResenas: 1250, promedio: 3.4 });
    expect(el.classList.contains('is-many')).toBe(true);
    expect(text(el)).toContain('Muy comentada');
    expect(text(el)).toContain('1.250 reseñas');
  });
});

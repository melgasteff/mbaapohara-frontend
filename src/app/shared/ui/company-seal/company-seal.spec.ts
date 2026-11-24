import { TestBed } from '@angular/core/testing';
import { CompanySeal, companyInitials } from './company-seal';

describe('Sello de empresa', () => {
  it('toma las dos primeras palabras con significado', () => {
    expect(companyInitials('Supermercado Ejemplo')).toBe('SE');
    expect(companyInitials('Supermercado La Amistad')).toBe('SA');
    expect(companyInitials('Banco de la Nación S.A.')).toBe('BN');
    expect(companyInitials('Ñandutí & Cía. Ejemplo')).toBe('ÑE');
    expect(companyInitials('  Infonet ')).toBe('I');
  });

  it('si todas las palabras se saltan, usa las que hay', () => {
    expect(companyInitials('La S.A.')).toBe('LS');
    expect(companyInitials('')).toBe('');
  });

  it('el color sale del grupo de rubro', () => {
    const fixture = TestBed.createComponent(CompanySeal);
    fixture.componentRef.setInput('name', 'Transportadora Ejemplo');
    for (const group of ['comercio', 'industria', 'servicios', 'gastronomia', 'transporte', 'agro-otros']) {
      fixture.componentRef.setInput('group', group);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).className).toBe(group);
    }
  });

  it('con logo autorizado muestra la imagen en lugar del globo', () => {
    const fixture = TestBed.createComponent(CompanySeal);
    fixture.componentRef.setInput('name', 'Empresa Ejemplo');
    fixture.componentRef.setInput('logoUrl', '/logo.png');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')?.getAttribute('src')).toBe('/logo.png');
    expect(el.querySelector('svg')).toBeNull();
  });
});

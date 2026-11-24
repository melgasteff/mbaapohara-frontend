import { registerLocaleData } from '@angular/common';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Pager, pageWindow } from './pager';

registerLocaleData(localeEsPy);

describe('Paginación', () => {
  it('muestra la primera, la última y las vecinas', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(5, 9)).toEqual([1, null, 4, 5, 6, null, 9]);
    expect(pageWindow(9, 9)).toEqual([1, null, 8, 9]);
  });

  async function render(page: number, total: number) {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'es-PY' }] });
    const fixture = TestBed.createComponent(Pager);
    for (const [name, value] of [['page', page], ['pageSize', 10], ['total', total]] as const) fixture.componentRef.setInput(name, value);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((n) => emitted.push(n));
    await fixture.whenStable();
    return { el: fixture.nativeElement as HTMLElement, emitted };
  }

  it('con una sola página no se muestra', async () => {
    expect((await render(1, 10)).el.querySelector('nav')).toBeNull();
  });

  it('dice el rango, marca la página actual y avisa el cambio', async () => {
    const { el, emitted } = await render(2, 24);
    expect(el.querySelector('.range')?.textContent).toBe('11 a 20 de 24');
    expect(el.querySelector('[aria-current=page]')?.textContent).toBe('2');
    el.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]')!.click();
    Array.from(el.querySelectorAll('button')).at(-1)!.click();
    expect(emitted).toEqual([1, 3]);
  });

  it('en la última página no hay «Siguiente»', async () => {
    expect((await render(3, 24)).el.textContent).not.toContain('Siguiente');
  });
});

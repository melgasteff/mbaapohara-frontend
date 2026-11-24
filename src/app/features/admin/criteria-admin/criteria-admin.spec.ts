import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminCounts } from '../../../core/api/admin-counts';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { CriteriaAdmin } from './criteria-admin';

describe('Administración de criterios', () => {
  const updateItem = vi.fn();
  const updateCategory = vi.fn();
  const createItem = vi.fn();
  const reload = vi.fn();
  let fixture: ComponentFixture<CriteriaAdmin>;
  const el = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) => [...el().querySelectorAll<HTMLElement>('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').trim().startsWith(label))!;
  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function click(label: string): Promise<void> {
    button(label).click();
    await settle();
  }
  async function submit(): Promise<void> {
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  }

  beforeEach(async () => {
    for (const mock of [updateItem, updateCategory, createItem]) mock.mockReset().mockReturnValue(of({}));
    reload.mockReset();
    const item = (id: number, orden: number, activo: boolean, respuestas: number) => ({ id, codigo: `C${id}`, texto: `Ítem ${id}`, orden, activo, idCategoria: 1, respuestas });
    const value = signal([{ id: 1, codigo: 'PAGO', nombre: 'Pago', orden: 1, activo: true, items: [item(10, 1, true, 3), item(20, 2, false, 0)] }]);
    TestBed.configureTestingModule({
      providers: [
        { provide: AdminCounts, useValue: { refresh: vi.fn() } },
        { provide: CriteriaApi, useValue: { adminResource: () => ({ error: signal(undefined), hasValue: () => true, value, reload }), updateItem, updateCategory, createItem } },
      ],
    });
    fixture = TestBed.createComponent(CriteriaAdmin);
    await settle();
  });

  it('desactivar se confirma y cancelar devuelve el foco al interruptor; activar es directo', async () => {
    await click('Ítem activo: Ítem 10');
    expect(updateItem).not.toHaveBeenCalled();
    await click('Cancelar');
    expect(document.activeElement).toBe(button('Ítem activo: Ítem 10'));
    await click('Ítem activo: Ítem 10');
    await click('Sí, desactivar');
    expect(updateItem).toHaveBeenCalledWith(10, { activo: false });
    await click('Ítem activo: Ítem 20');
    expect(updateItem).toHaveBeenLastCalledWith(20, { activo: true });
  });

  it('el interruptor dice su estado', () => {
    expect(button('Ítem activo: Ítem 10').getAttribute('aria-checked')).toBe('true');
    expect(button('Ítem activo: Ítem 20').getAttribute('aria-checked')).toBe('false');
  });

  it('mover envía los dos cambios y en el extremo no hace nada', async () => {
    await click('Subir: Ítem 10');
    expect(updateItem).not.toHaveBeenCalled();
    await click('Subir: Ítem 20');
    expect(updateItem.mock.calls).toEqual([[20, { orden: 1 }], [10, { orden: 2 }]]);
    expect(reload).toHaveBeenCalled();
  });

  it('si un cambio falla al mover, avisa y vuelve a pedir la lista', async () => {
    updateItem.mockReturnValueOnce(of({})).mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'No se pudo.' } })));
    await click('Subir: Ítem 20');
    expect(el().querySelector('[role=status]')?.textContent).toContain('No se pudo.');
    expect(reload).toHaveBeenCalled();
  });

  it('cambiar el texto de un ítem con respuestas se confirma', async () => {
    await click('Editar: Ítem 10');
    const text = el().querySelector('textarea')!;
    expect(document.activeElement).toBe(text);
    text.value = 'Ítem corregido';
    text.dispatchEvent(new Event('input'));
    await submit();
    expect(updateItem).not.toHaveBeenCalled();
    expect(el().querySelector('app-inline-confirm')?.textContent).toContain('3 respuestas');
    await click('Sí, es solo redacción');
    expect(updateItem).toHaveBeenCalledWith(10, { texto: 'Ítem corregido' });
  });

  it('agregar un ítem valida el código', async () => {
    await click('Agregar ítem');
    await submit();
    expect(createItem).not.toHaveBeenCalled();
    expect(el().textContent).toContain('letras sin tildes');
  });
});

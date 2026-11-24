import { registerLocaleData } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthApi } from '../../../core/api/auth-api';
import { SessionService } from '../../../core/auth/session.service';
import { Account } from '../../../core/models/account';
import { MyAccount } from './my-account';

registerLocaleData(localeEsPy);

const ACCOUNT: Account = {
  id: 1, email: 'persona@ejemplo.com', rol: 'usuario', estado: 'activo', fechaConsentimiento: '2026-11-19T12:00:00Z', fechaCreacion: '2026-11-19T12:00:00Z',
};

describe('Mi cuenta', () => {
  const exportData = vi.fn();
  const deleteAccount = vi.fn();
  let fixture: ComponentFixture<MyAccount>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');
  const button = (label: string) => [...el().querySelectorAll('button')].find((item) => item.textContent?.includes(label))!;
  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }
  async function click(label: string): Promise<void> {
    button(label).click();
    await settle();
  }
  async function confirm(password: string): Promise<void> {
    const field = el().querySelector<HTMLInputElement>('#clave-eliminar')!;
    field.value = password;
    field.dispatchEvent(new Event('input'));
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  }

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();
    exportData.mockReset();
    deleteAccount.mockReset();
    const meResource = () => ({ error: signal(undefined), hasValue: () => true, value: signal(ACCOUNT), reload: () => true });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'es-PY' }, { provide: AuthApi, useValue: { meResource, exportData, deleteAccount } }],
    });
    TestBed.inject(SessionService).start('cabecera.e30.firma', ACCOUNT);
    fixture = TestBed.createComponent(MyAccount);
    await settle();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('descarga: prepara, avisa que terminó y no pide dos veces a la vez', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const data = new Subject<unknown>();
    exportData.mockReturnValue(data);
    await click('Descargar mis datos');
    await click('Preparando el archivo…');
    expect(exportData).toHaveBeenCalledOnce();
    data.next({});
    await settle();
    expect(button('Descargado')).toBeTruthy();
    expect(text()).toContain('Archivo descargado');
  });

  it('descarga: si falla, lo dice y deja volver a intentar', async () => {
    exportData.mockReturnValue(throwError(() => new Error('x')));
    await click('Descargar mis datos');
    expect(el().querySelector('[role=alert]')?.textContent).toContain('No pudimos preparar el archivo');
    expect(button('Descargar mis datos')).toBeTruthy();
  });

  it('eliminar abre la contraseña con el foco; cancelar la cierra y lo devuelve', async () => {
    expect(el().querySelector('form')).toBeNull();
    await click('Eliminar mi cuenta');
    expect(document.activeElement?.id).toBe('clave-eliminar');
    await click('Cancelar');
    expect(el().querySelector('form')).toBeNull();
    expect(document.activeElement).toBe(button('Eliminar mi cuenta'));
  });

  it('eliminar: sin contraseña o con una incorrecta no elimina y lo explica', async () => {
    await click('Eliminar mi cuenta');
    await confirm('');
    expect(text()).toContain('Escribí tu contraseña para confirmar.');
    expect(deleteAccount).not.toHaveBeenCalled();
    deleteAccount.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    await confirm('incorrecta');
    expect(text()).toContain('La contraseña no es correcta.');
    expect(el().querySelector('#clave-eliminar')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('eliminar: borra el borrador de este dispositivo y avisa en el inicio', async () => {
    localStorage.setItem('mbaapohara.borrador.1', '{}');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    deleteAccount.mockReturnValue(of(undefined));
    await click('Eliminar mi cuenta');
    await confirm('correcta');
    expect(deleteAccount).toHaveBeenCalledWith('correcta');
    expect(localStorage.length).toBe(0);
    expect(navigate).toHaveBeenCalledWith(['/'], { state: { cuentaEliminada: true } });
  });
});

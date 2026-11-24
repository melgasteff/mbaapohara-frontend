import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CompanyRequest, REJECTION_MESSAGES, ReportedReview } from '../../../core/models/moderation';
import { mailtoLink, RequestsAdmin } from '../company-requests/requests-admin';
import { mostReported, ReportsAdmin, reportSummary } from './reports-admin';

registerLocaleData(localeEsPy);

describe('Administración de reportes y solicitudes', () => {
  it('propone la categoría más reportada, sin contar «Otro»', () => {
    const item = { reportes: [{ categoria: 'OTRO' }, { categoria: 'INS' }, { categoria: 'TER' }, { categoria: 'INS' }] } as ReportedReview;
    expect(mostReported(item)).toBe('INS');
    expect(mostReported({ reportes: [{ categoria: 'OTRO' }] } as ReportedReview)).toBe('TER');
  });

  it('arma el enlace de correo con el asunto y la respuesta escrita', () => {
    const request = { tipo: 'revision_resena', correo: 'empresa@ejemplo.com' } as CompanyRequest;
    const link = mailtoLink(request, 'Revisamos la reseña y sigue publicada.');
    expect(link.startsWith('mailto:empresa%40ejemplo.com?subject=')).toBe(true);
    expect(decodeURIComponent(link)).toContain('Revisamos la reseña y sigue publicada.');
  });

  it('resume los reportes de la categoría más reportada a la menos', () => {
    const item = { reportes: [{ categoria: 'OTRO' }, { categoria: 'TER' }, { categoria: 'TER' }] } as ReportedReview;
    expect(reportSummary(item)).toBe('Nombra o señala a una persona (2) · Otro motivo (1)');
  });
});

describe('Pantallas de reportes y solicitudes', () => {
  const api = { keepReported: vi.fn(), retire: vi.fn(), answer: vi.fn() };
  const reload = vi.fn();
  const page = <T>(data: T[]) => () => ({ error: signal(undefined), hasValue: () => true, value: signal({ data, total: data.length, page: 1, pageSize: 10 }), reload });
  let fixture: ComponentFixture<unknown>;
  const el = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) => [...el().querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(label))!;
  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await settle();
  }
  async function submit(): Promise<void> {
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  }
  async function open(component: Type<unknown>): Promise<void> {
    fixture = TestBed.createComponent(component);
    await settle();
  }

  beforeEach(() => {
    for (const mock of [api.keepReported, api.retire, api.answer]) mock.mockReset().mockReturnValue(of({}));
    reload.mockReset();
    const report = {
      idResena: 7, empresa: { id: 1, nombre: 'Empresa' }, local: { id: 1, nombre: 'Centro', ciudad: 'Asunción' }, publicada: true, calificacion: 3, loBueno: 'a', aMejorar: 'b',
      cantidad: 2, primerReporte: '2026-11-20T12:00:00Z', reportes: [{ categoria: 'INS', comentario: 'Mirá esto', fecha: '' }, { categoria: 'INS', comentario: null, fecha: '' }],
    };
    const request = {
      id: 4, tipo: 'revision_resena', estado: 'pendiente', empresa: { id: 1, nombre: 'Empresa' }, resena: { id: 7, publicada: true, loBueno: 'a', aMejorar: 'b' },
      nombre: 'Persona', correo: 'empresa@ejemplo.com', mensaje: 'Pedido', respuesta: null, fecha: '2026-11-20T12:00:00Z', fechaRespuesta: null,
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(), { provide: LOCALE_ID, useValue: 'es-PY' },
        { provide: ModerationAdminApi, useValue: { ...api, reportsResource: page([report]), requestsResource: page([request]) } },
      ],
    });
  });

  it('mantener pide confirmación; cancelar devuelve el foco', async () => {
    await open(ReportsAdmin);
    await click(button('Mantener'));
    expect(el().querySelector('app-inline-confirm')?.textContent).toContain('cierran sus 2 reportes');
    await click(button('Cancelar'));
    expect(api.keepReported).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button('Mantener'));
    await click(button('Mantener'));
    await click(button('Sí, mantener'));
    expect(api.keepReported).toHaveBeenCalledWith(7);
    expect(reload).toHaveBeenCalled();
  });

  it('retirar propone la categoría más reportada', async () => {
    await open(ReportsAdmin);
    expect(el().textContent).toContain('«Mirá esto»');
    await click(button('Retirar…'));
    await submit();
    expect(api.retire).toHaveBeenCalledWith(7, 'INS', REJECTION_MESSAGES.INS);
    expect(el().querySelector('[role=status]')?.textContent).toContain('Retiraste la reseña sobre Empresa');
  });

  it('la respuesta se escribe una vez: va al correo y, confirmada, al registro', async () => {
    await open(RequestsAdmin);
    await click(button('Responder…'));
    await submit();
    expect(el().querySelector('textarea')?.getAttribute('aria-invalid')).toBe('true');
    const text = el().querySelector('textarea')!;
    text.value = 'Revisamos la reseña y sigue publicada.';
    text.dispatchEvent(new Event('input'));
    await settle();
    expect(decodeURIComponent(el().querySelector<HTMLAnchorElement>('form a')!.href)).toContain('Revisamos la reseña y sigue publicada.');
    await submit();
    expect(api.answer).not.toHaveBeenCalled();
    await click(button('Sí, registrar'));
    expect(api.answer).toHaveBeenCalledWith(4, 'Revisamos la reseña y sigue publicada.');
  });

  it('desde una solicitud también se retira la reseña', async () => {
    await open(RequestsAdmin);
    await click(button('Retirar la reseña…'));
    await submit();
    expect(api.retire).toHaveBeenCalledWith(7, 'TER', REJECTION_MESSAGES.TER);
  });
});

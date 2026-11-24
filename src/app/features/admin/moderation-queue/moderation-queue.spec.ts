import { registerLocaleData } from '@angular/common';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of, throwError } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { QueueItem, REJECTION_MESSAGES } from '../../../core/models/moderation';
import { ModerationQueue, shortReason, sortedScores } from './moderation-queue';

registerLocaleData(localeEsPy);

describe('sortedScores', () => {
  it('ordena las confianzas de mayor a menor, en porcentaje', () => {
    const item = { senales: { scores: { DP: 0, TER: 0.62, ACU: 0.71, INS: 0.05, SPAM: 0, TEMA: 0.004 } } } as QueueItem;
    const scores = sortedScores(item);
    expect(scores.slice(0, 3)).toEqual([
      { category: 'ACU', label: 'Acusación de delito', percent: 71 },
      { category: 'TER', label: 'Persona identificable', percent: 62 },
      { category: 'INS', label: 'Insulto o discriminación', percent: 5 },
    ]);
    expect(scores).toHaveLength(6);
  });

  it('sin respuesta del modelo no hay confianzas', () => {
    expect(sortedScores({ senales: { scores: null } } as QueueItem)).toEqual([]);
    expect(sortedScores({ senales: null } as QueueItem)).toEqual([]);
  });
});

describe('shortReason', () => {
  it('dice la categoría y la regla, o la falla', () => {
    expect(shortReason({ senales: { category: 'INS', rules: ['lista_insultos'], failure: null } } as unknown as QueueItem)).toBe('Insulto o discriminación · Palabra de la lista de insultos');
    expect(shortReason({ senales: { category: null, rules: [], failure: 'tope_de_gasto' } } as unknown as QueueItem)).toBe('Se alcanzó el tope de gasto del mes');
    expect(shortReason({ senales: null } as QueueItem)).toBe('Sin registro de la revisión automática');
  });
});

describe('Moderación en dos paneles', () => {
  const item = (idVersion: number, horasEsperando = 2): QueueItem => ({
    idVersion, idResena: idVersion, numero: 1, empresa: { id: idVersion, nombre: `Empresa ${idVersion}` }, local: { id: 1, nombre: 'Centro', ciudad: 'Asunción' },
    cargo: { descripcion: 'Cajera', aprobado: true }, situacion: 'ANTERIOR', ultimoAnio: 2025, tipoContrato: { id: 1, nombre: 'Indefinido' }, modalidad: { id: 1, nombre: 'Presencial' },
    calificacion: 3, loBueno: `Bueno ${idVersion}`, aMejorar: `Mejorar ${idVersion}`, respuestas: [], fechaEnvio: '2026-11-23T12:00:00Z', horasEsperando,
    tieneVersionPublicada: false, senales: { category: 'TER', rules: [], scores: { DP: 0, TER: 0.62, ACU: 0.71, INS: 0, SPAM: 0, TEMA: 0 }, failure: null, modelReason: 'Nombra a alguien.' },
  });
  let fixture: ComponentFixture<ModerationQueue>;
  const publish = vi.fn();
  const reject = vi.fn();
  const reload = vi.fn();
  const value = signal({ data: [] as QueueItem[], total: 0, page: 1, pageSize: 10 });
  const el = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) => [...el().querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(label))!;
  const title = () => el().querySelector('.detail h2')?.textContent;

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await settle();
  }
  beforeEach(async () => {
    for (const mock of [publish, reject, reload]) mock.mockReset();
    publish.mockReturnValue(of({}));
    reject.mockReturnValue(of({}));
    value.set({ data: [item(1, 53), item(2, 20), item(3, 0)], total: 3, page: 1, pageSize: 10 });
    const queueResource = () => ({ error: signal(undefined), hasValue: () => true, value, reload });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(), { provide: LOCALE_ID, useValue: 'es-PY' },
        { provide: ModerationAdminApi, useValue: { queueResource, publish, reject } },
      ],
    });
    fixture = TestBed.createComponent(ModerationQueue);
    await settle();
  });

  it('abre la más antigua y marca la espera', () => {
    expect(title()).toBe('Empresa 1');
    expect([...el().querySelectorAll('.wait')].map((w) => w.textContent)).toEqual(['Más de 48 h', 'Hace 20 h', 'Hace menos de 1 h']);
    expect(el().querySelector('.wait--late')?.textContent).toBe('Más de 48 h');
    expect(el().textContent).toContain('3 reseñas esperan revisión');
  });

  it('muestra la confianza de la categoría marcada, aunque otra sea más alta', () => {
    expect(el().querySelector('.score')?.textContent).toContain('62 %');
    expect(el().querySelector('details')?.textContent).toContain('71 %');
  });

  it('al publicar avisa, pasa a la siguiente y lleva el foco a su título', async () => {
    await click(button('Publicar'));
    expect(publish).toHaveBeenCalledWith(1);
    expect(title()).toBe('Empresa 2');
    expect(el().querySelector('[role=status]')?.textContent).toContain('Publicaste la reseña sobre Empresa 1. Sigue la próxima');
    expect(el().textContent).toContain('2 reseñas esperan revisión');
    expect(document.activeElement).toBe(el().querySelector('.detail h2'));
    expect(reload).toHaveBeenCalled();
  });

  it('al decidir la del medio sigue la que quedó en su lugar; la última vuelve a la anterior', async () => {
    await click(el().querySelectorAll<HTMLElement>('.queue button')[1]);
    expect(title()).toBe('Empresa 2');
    await click(button('Publicar'));
    expect(title()).toBe('Empresa 3');
    await click(button('Publicar'));
    expect(title()).toBe('Empresa 1');
    await click(button('Publicar'));
    expect(el().textContent).toContain('No hay reseñas esperando revisión');
  });

  it('pide un cambio con la categoría marcada y el mensaje de la política', async () => {
    await click(button('Pedir un cambio'));
    expect(el().querySelector('textarea')?.value).toBe(REJECTION_MESSAGES.TER);
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    expect(reject).toHaveBeenCalledWith(1, 'TER', REJECTION_MESSAGES.TER);
    expect(title()).toBe('Empresa 2');
    expect(el().querySelector('form')).toBeNull();
  });

  it('cancelar el pedido no decide y devuelve el foco', async () => {
    await click(button('Pedir un cambio'));
    await click(button('Cancelar'));
    expect(reject).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button('Pedir un cambio'));
  });

  it('un doble clic decide una sola vez, sin deshabilitar el botón', async () => {
    // Cada suscripción es un pedido a la API.
    let sent = 0;
    publish.mockReturnValue(new Observable(() => void sent++));
    button('Publicar').click();
    button('Publicar').click();
    await settle();
    expect(sent).toBe(1);
    expect(button('Publicando…').disabled).toBe(false);
  });

  it('si otra persona ya decidió, lo avisa y vuelve a pedir la fila', async () => {
    publish.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Ya se decidió.' } })));
    await click(button('Publicar'));
    expect(el().querySelector('[role=status]')?.textContent).toContain('Ya se decidió.');
    expect(title()).toBe('Empresa 1');
    expect(reload).toHaveBeenCalled();
  });
});

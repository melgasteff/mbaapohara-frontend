import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { MyReview, ReviewStatus } from '../../../core/models/review';
import { inTab, myReviewTabs } from './my-review-tabs';
import { MyReviews } from './my-reviews';

registerLocaleData(localeEsPy);

const review = (id: number, estado: ReviewStatus, publicada = estado === 'publicada'): MyReview => ({
  id, empresa: { id: id * 10, nombre: `Empresa ${id}`, grupo: 'transporte' }, local: { id: 5, nombre: 'Centro', ciudad: 'Asunción' }, publicada,
  ultimaVersion: {
    numero: 1, estado, categoria: null, motivo: estado === 'rechazada' ? 'Sacá el teléfono.' : null, cargo: { id: 2, descripcion: 'Cajera', aprobado: true },
    situacion: 'ACTUAL', ultimoAnio: null, tipoContrato: { id: 1, nombre: 'Indefinido' }, modalidad: { id: 3, nombre: 'Presencial' }, calificacion: 4,
    loBueno: `Bueno ${id}`, aMejorar: `Mejorar ${id}`, respuestas: [], fecha: '2026-11-21T12:00:00Z',
  },
});
const all = [review(1, 'publicada'), review(2, 'rechazada'), review(3, 'en_revision', true)];

describe('Pestañas de mis reseñas', () => {
  it('cuentan por el estado de la última versión', () => {
    expect(myReviewTabs(all).map((tab) => tab.cantidad)).toEqual([3, 1, 1, 1]);
    expect(inTab(all, 'publicada').map((item) => item.id)).toEqual([1]);
  });

  it('solo piden atención si hay algo para corregir', () => {
    expect(myReviewTabs(all).filter((tab) => tab.urgente).map((tab) => tab.valor)).toEqual(['rechazada']);
    expect(myReviewTabs([review(1, 'publicada')]).some((tab) => tab.urgente)).toBe(false);
  });
});

describe('Mis reseñas', () => {
  const mine = vi.fn();
  const remove = vi.fn();
  let fixture: ComponentFixture<MyReviews>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');
  const button = (label: string) => [...el().querySelectorAll<HTMLElement>('button, a')].filter((item) => item.textContent?.trim().startsWith(label));

  beforeEach(async () => {
    mine.mockReset().mockReturnValue(of(all));
    remove.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: LOCALE_ID, useValue: 'es-PY' },
        { provide: ReviewsApi, useValue: { mine, remove } },
      ],
    });
  });
  async function settle(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
    }
    fixture.detectChanges();
  }
  async function open(): Promise<void> {
    fixture = TestBed.createComponent(MyReviews);
    await settle();
  }
  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await settle();
  }

  it('la que necesita un cambio va arriba, con el motivo y el enlace para corregirla', async () => {
    await open();
    expect(el().querySelector('.fix')?.textContent).toContain('Sacá el teléfono.');
    expect(el().querySelector('.fix a')?.getAttribute('href')).toBe('/publicar/2/editar');
    expect(el().querySelectorAll('.rows > li').length).toBe(2);
    expect(el().querySelector('.rows app-company-seal')?.classList).toContain('transporte');
    expect(text()).toContain('Centro, Asunción · enviada en noviembre de 2026');
  });

  it('en revisión no se edita y «Ver» explica por qué', async () => {
    await open();
    await click([...el().querySelectorAll<HTMLElement>('[role=tab]')][2]);
    expect(el().querySelectorAll('.rows > li').length).toBe(1);
    expect(button('Editar').length).toBe(0);
    expect(text()).toContain('se sigue viendo tu versión anterior');
    await click(button('Ver')[0]);
    expect(text()).toContain('Vas a poder editarla cuando se decida');
    expect(text()).toContain('Bueno 3');
  });

  it('borrar pide confirmación; cancelar no borra y devuelve el foco', async () => {
    await open();
    await click(el().querySelector<HTMLElement>('#borrar-1')!);
    expect(el().querySelector('app-inline-confirm')?.textContent).toContain('Deja de verse en el perfil');
    await click(button('Cancelar')[0]);
    expect(remove).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('borrar-1');
  });

  it('al confirmar borra, avisa y vuelve a pedir la lista', async () => {
    remove.mockReturnValue(of(undefined));
    await open();
    mine.mockReturnValue(of(all.slice(1)));
    await click(el().querySelector<HTMLElement>('#borrar-1')!);
    await click(button('Sí, borrar')[0]);
    expect(remove).toHaveBeenCalledWith(1);
    expect(el().querySelector('[role=status]')?.textContent).toContain('Borramos tu reseña sobre Empresa 1.');
    expect(el().querySelector('#borrar-1')).toBeNull();
    expect(document.activeElement).toBe(el().querySelector('h1'));
  });

  it('mientras borra no deja pedir otra', async () => {
    remove.mockReturnValue(NEVER);
    await open();
    await click(el().querySelector<HTMLElement>('#borrar-1')!);
    await click(button('Sí, borrar')[0]);
    expect(text()).toContain('Borrando…');
    await click(el().querySelector<HTMLElement>('#borrar-2')!);
    expect(el().querySelector('app-inline-confirm')).toBeNull();
  });

  it('si no se pudo borrar, lo dice al lado de esa reseña', async () => {
    remove.mockReturnValue(throwError(() => new Error('x')));
    await open();
    await click(el().querySelector<HTMLElement>('#borrar-2')!);
    await click(button('Sí, borrar')[0]);
    expect(el().querySelector('.fix [role=alert]')).not.toBeNull();
    expect(el().querySelector('#borrar-2')).not.toBeNull();
  });

  it('sin reseñas invita a escribir la primera', async () => {
    mine.mockReturnValue(of([]));
    await open();
    expect(button('Escribir mi primera reseña')[0].getAttribute('href')).toBe('/publicar');
    expect(el().querySelector('[role=tablist]')).toBeNull();
  });
});

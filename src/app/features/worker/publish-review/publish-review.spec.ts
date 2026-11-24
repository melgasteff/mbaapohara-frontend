import { registerLocaleData } from '@angular/common';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsPy from '@angular/common/locales/es-PY';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReviewsApi } from '../../../core/api/reviews-api';
import { SessionService } from '../../../core/auth/session.service';
import { ReviewDraftStore, SavedDraft } from '../../../core/drafts/review-draft-store';
import { FocusExit } from '../../../core/layout/focus-exit';
import { PublishReview } from './publish-review';

registerLocaleData(localeEsPy);

const API = environment.apiUrl;
const TEXT = 'Texto de ejemplo con más de cincuenta caracteres para cumplir el mínimo.';
const office = (id: number) => ({ id, nombre: `Local ${id}`, idEmpresa: 4, ciudad: { id: 1, nombre: 'Asunción', idDepartamento: 1 }, cantidadResenas: 0 });
const company = (id: number) => ({
  id, nombre: `Empresa ${id}`, rubro: { id: 1, codigoCiiu: 'G', nombre: 'Comercio', grupo: 'comercio' }, estado: 'aprobada', cantidadResenas: 0,
  promedio: null, temaPrincipal: null, logoUrl: null, distribucion: [], temas: [], locales: [office(5), office(6)],
});
const page = <T>(data: T[]) => ({ data, total: data.length, page: 1, pageSize: 100 });
const responses: Record<string, unknown> = {
  '/criterios-provisionales.json': {
    version: '1',
    opcionesRespuesta: [{ valor: 'SI', etiqueta: 'Sí' }, { valor: 'NO', etiqueta: 'No' }, { valor: 'NO_SABE', etiqueta: 'No sé o no aplica' }],
    situaciones: [{ valor: 'ACTUAL', etiqueta: 'Trabajo aquí' }, { valor: 'ANTERIOR', etiqueta: 'Trabajé aquí' }],
    calificacionGeneral: { minimo: 1, maximo: 5, etiqueta: 'Calificación', pregunta: '¿Cómo fue?', palabras: { 4: 'Bueno' } },
    textos: [
      { codigo: 'LO_BUENO', etiqueta: 'Lo bueno', placeholder: '', minimo: 50, maximo: 1000 },
      { codigo: 'A_MEJORAR', etiqueta: 'A mejorar', placeholder: '', minimo: 50, maximo: 1000 },
    ],
  },
  [`${API}/criteria`]: [
    { codigo: 'A', nombre: 'Pago', orden: 1, items: [{ codigo: 'a1', orden: 1, texto: '¿Uno?' }, { codigo: 'a2', orden: 2, texto: '¿Dos?' }] },
    { codigo: 'B', nombre: 'Jornada', orden: 2, items: [{ codigo: 'b1', orden: 1, texto: '¿Tres?' }] },
  ],
  [`${API}/jobs`]: page([{ id: 2, descripcion: 'Cajera' }]),
  [`${API}/contract-types`]: page([{ id: 1, nombre: 'Indefinido' }]),
  [`${API}/work-modes`]: page([{ id: 3, nombre: 'Presencial' }]),
  [`${API}/companies`]: page([company(4), company(7)]),
  [`${API}/companies/4`]: company(4),
  [`${API}/companies/7`]: company(7),
};
const draft: SavedDraft = {
  paso: 3, empresa: { id: 4, nombre: 'Empresa 4' }, idLocal: 5, cargo: 'Cajera', situacion: 'ACTUAL', ultimoAnio: null, tipoContrato: 1, modalidad: 3,
  respuestas: { a1: 'SI' }, calificacion: null, loBueno: '', aMejorar: '',
};

describe('Asistente', () => {
  let fixture: ComponentFixture<PublishReview>;
  let http: HttpTestingController;
  let drafts: ReviewDraftStore;
  const publish = vi.fn();
  const update = vi.fn();
  const mine = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    publish.mockReset();
    update.mockReset();
    mine.mockReset().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: LOCALE_ID, useValue: 'es-PY' },
        { provide: ReviewsApi, useValue: { publish, update, mine } },
      ],
    });
    TestBed.inject(SessionService).start('cabecera.e30.firma', {
      id: 1, email: 'persona@ejemplo.com', rol: 'usuario', estado: 'activo', fechaConsentimiento: null, fechaCreacion: '2026-11-19T00:00:00Z',
    });
    http = TestBed.inject(HttpTestingController);
    drafts = TestBed.inject(ReviewDraftStore);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');
  const button = (label: string) => [...el().querySelectorAll('button')].find((item) => item.textContent?.includes(label))!;
  const answer = (index: number) => el().querySelectorAll<HTMLInputElement>('app-answer-group input')[index];

  /** Responde los pedidos pendientes hasta que no queda ninguno. */
  async function settle(failures: Record<string, number> = {}): Promise<void> {
    for (let round = 0; round < 6; round++) {
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      for (const request of http.match(() => true)) {
        if (request.cancelled) continue;
        const status = failures[request.request.url];
        const body = responses[request.request.url];
        if (status) request.flush({}, { status, statusText: 'Error' });
        else request.flush((body ?? { cargo: { opciones: [] } }) as object);
      }
    }
    fixture.detectChanges();
  }
  async function open(inputs: Record<string, unknown> = {}, failures?: Record<string, number>): Promise<void> {
    fixture = TestBed.createComponent(PublishReview);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await settle(failures);
  }
  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await settle();
  }

  it('empieza vacío y, si falta algo, dice qué sin deshabilitar el botón', async () => {
    await open();
    expect(text()).toContain('¿Dónde trabajaste?');
    await click(button('Seguir'));
    expect(el().querySelector('.bar [role="alert"]')?.textContent).toContain('Elegí la empresa para seguir.');
  });

  it('el aviso de lo que falta se va al completarlo', async () => {
    await open();
    await click(button('Seguir'));
    await click(el().querySelector<HTMLInputElement>('input[name="empresa"]')!);
    expect(el().querySelector('.bar [role="alert"]')).toBeNull();
  });

  it('con ?empresa= la empresa ya está elegida', async () => {
    await open({ empresa: '7' });
    expect(el().querySelector('app-review-preview .company')?.textContent).toContain('Empresa 7');
    expect(TestBed.inject(FocusExit).label()).toBe('Guardar y salir');
    expect(drafts.load()?.empresa.id).toBe(7);
  });

  it('si la empresa pedida no existe, lo avisa y deja elegir otra', async () => {
    await open({ empresa: '99' }, { [`${API}/companies/99`]: 404 });
    expect(text()).toContain('ya no está disponible');
    expect(text()).toContain('¿Dónde trabajaste?');
  });

  it('retoma el borrador donde quedó', async () => {
    drafts.save(draft);
    await open();
    expect(text()).toContain('Retomamos la reseña');
    expect(el().querySelector('h1')?.textContent).toContain('Pago');
    expect(el().querySelector('.question')?.textContent).toContain('¿Dos?');
  });

  it('empezar de nuevo pide confirmación y borra el borrador', async () => {
    drafts.save(draft);
    await open();
    await click(button('Empezar de nuevo'));
    expect(drafts.load()).not.toBeNull();
    await click(button('Sí, empezar de nuevo'));
    expect(drafts.load()).toBeNull();
    expect(text()).toContain('¿Dónde trabajaste?');
  });

  it('con un borrador de otra empresa, pregunta con cuál seguir', async () => {
    drafts.save(draft);
    await open({ empresa: '7' });
    expect(text()).toContain('Tenés una reseña sin terminar');
    await click(button('Seguir con la que tenía'));
    expect(el().querySelector('app-review-preview .company')?.textContent).toContain('Empresa 4');
  });

  it('si prefiere la otra, el borrador se reemplaza', async () => {
    drafts.save(draft);
    await open({ empresa: '7' });
    await click(button('Borrarla y empezar otra'));
    expect(drafts.load()).toMatchObject({ empresa: { id: 7 }, respuestas: {} });
  });

  it('al elegir pasa sola a la siguiente y, al completar la categoría, la cierra', async () => {
    drafts.save({ ...draft, respuestas: {} });
    await open();
    await click(answer(0));
    expect(el().querySelector('.question')?.textContent).toContain('¿Dos?');
    expect(document.activeElement).toBe(el().querySelector('.question'));
    await click(answer(1));
    expect(el().querySelector('.closing')?.textContent).toContain('Pago: lista');
    await click(button('Seguir con Jornada'));
    expect(el().querySelector('.question')?.textContent).toContain('¿Tres?');
    await click(answer(2));
    expect(button('Seguir con tu opinión')).toBeTruthy();
    expect(drafts.load()?.respuestas).toEqual({ a1: 'SI', a2: 'NO', b1: 'NO_SABE' });
  });

  it('sin responder no avanza', async () => {
    drafts.save({ ...draft, respuestas: {} });
    await open();
    await click(button('Seguir'));
    expect(text()).toContain('Respondé la pregunta para seguir');
    expect(el().querySelector('.question')?.textContent).toContain('¿Uno?');
  });

  it('al enviar borra el borrador y muestra el resultado', async () => {
    publish.mockReturnValue(of({ id: 9, estado: 'publicada' }));
    drafts.save({ ...draft, paso: 4, respuestas: { a1: 'SI', a2: 'SI', b1: 'NO' }, calificacion: 4, loBueno: TEXT, aMejorar: TEXT });
    await open();
    await click(button('Enviar reseña'));
    expect(publish).not.toHaveBeenCalled();
    expect(text()).toContain('aceptá las reglas');
    await click(el().querySelector<HTMLInputElement>('.check input')!);
    await click(button('Enviar reseña'));
    expect(publish).toHaveBeenCalledOnce();
    expect(text()).toContain('Gracias por contar tu experiencia');
    expect(drafts.load()).toBeNull();
    expect(TestBed.inject(FocusExit).label()).toBe('Volver al inicio');
  });

  it('rechazada: muestra el motivo y «Corregir» vuelve al paso 4 con lo escrito', async () => {
    publish.mockReturnValue(of({ id: 9, estado: 'rechazada', motivo: 'Sacá el teléfono.' }));
    drafts.save({ ...draft, paso: 4, respuestas: { a1: 'SI', a2: 'SI', b1: 'NO' }, calificacion: 4, loBueno: TEXT, aMejorar: TEXT });
    await open();
    await click(el().querySelector<HTMLInputElement>('.check input')!);
    await click(button('Enviar reseña'));
    expect(text()).toContain('Sacá el teléfono.');
    await click(button('Corregir la reseña'));
    expect(el().querySelector('textarea')?.value).toBe(TEXT);
    // La reseña ya está en el servidor: no se guarda otro borrador.
    expect(drafts.load()).toBeNull();
  });

  it('si el envío falla, muestra el error y conserva el borrador', async () => {
    publish.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Ya escribiste una reseña de ese local.' } })));
    drafts.save({ ...draft, paso: 4, respuestas: { a1: 'SI', a2: 'SI', b1: 'NO' }, calificacion: 4, loBueno: TEXT, aMejorar: TEXT });
    await open();
    await click(el().querySelector<HTMLInputElement>('.check input')!);
    await click(button('Enviar reseña'));
    expect(el().querySelector('.send-error')?.textContent).toContain('Ya escribiste una reseña de ese local.');
    expect(el().querySelector('.send-error a')?.getAttribute('href')).toBe('/mis-resenas');
    expect(drafts.load()?.loBueno).toBe(TEXT);
  });

  it('un borrador con solo la empresa elegida se reemplaza sin preguntar', async () => {
    drafts.save({ ...draft, paso: 1, idLocal: null, cargo: '', situacion: null, tipoContrato: null, modalidad: null, respuestas: {} });
    await open({ empresa: '7' });
    expect(text()).not.toContain('Tenés una reseña sin terminar');
    expect(el().querySelector('app-review-preview .company')?.textContent).toContain('Empresa 7');
  });

  describe('edición', () => {
    const review = {
      id: 9, empresa: { id: 4, nombre: 'Empresa 4', grupo: 'comercio' }, local: { id: 5, nombre: 'Local 5', ciudad: 'Asunción' }, publicada: true,
      ultimaVersion: {
        numero: 1, estado: 'publicada', categoria: null, motivo: null, cargo: { id: 2, descripcion: 'Cajera', aprobado: true }, situacion: 'ACTUAL',
        ultimoAnio: null, tipoContrato: { id: 1, nombre: 'Indefinido' }, modalidad: { id: 3, nombre: 'Presencial' }, calificacion: 4, loBueno: TEXT,
        aMejorar: TEXT, respuestas: [{ codigo: 'a1', respuesta: 'SI' }, { codigo: 'a2', respuesta: 'NO' }, { codigo: 'b1', respuesta: 'SI' }],
        fecha: '2026-11-21T12:00:00Z',
      },
    };

    it('empieza en el paso 2, sin volver al local, y envía los cambios con las reglas aceptadas', async () => {
      mine.mockReturnValue(of([review]));
      update.mockReturnValue(of({ id: 9, estado: 'en_revision' }));
      await open({ id: '9' });
      expect(text()).toContain('Contanos de tu trabajo');
      expect(text()).toContain('La empresa y el local no se pueden cambiar');
      expect(button('Atrás')).toBeUndefined();
      expect(button('Empresa y local')).toBeUndefined();
      expect(el().querySelector<HTMLInputElement>('#cargo')?.value).toBe('Cajera');
      await click(button('Tu opinión'));
      await click(el().querySelector<HTMLInputElement>('.check input')!);
      await click(button('Guardar cambios'));
      expect(update).toHaveBeenCalledWith(9, expect.objectContaining({ respuestas: { a1: 'SI', a2: 'NO', b1: 'SI' } }));
      expect(text()).toContain('Recibimos tu reseña');
    });

    it('no toca el borrador de una reseña nueva y avisa que no guarda', async () => {
      mine.mockReturnValue(of([review]));
      drafts.save(draft);
      await open({ id: '9' });
      expect(TestBed.inject(FocusExit).label()).toBe('Salir sin guardar');
      expect(drafts.load()).toEqual(draft);
    });

    it('si falta responder un criterio nuevo, lleva al paso 3', async () => {
      mine.mockReturnValue(of([{ ...review, ultimaVersion: { ...review.ultimaVersion, respuestas: [{ codigo: 'a1', respuesta: 'SI' }] } }]));
      await open({ id: '9' });
      await click(button('Tu opinión'));
      await click(el().querySelector<HTMLInputElement>('.check input')!);
      await click(button('Guardar cambios'));
      expect(update).not.toHaveBeenCalled();
      expect(text()).toContain('Faltan preguntas por responder');
      expect(el().querySelector('.question')?.textContent).toContain('¿Dos?');
    });
  });
});

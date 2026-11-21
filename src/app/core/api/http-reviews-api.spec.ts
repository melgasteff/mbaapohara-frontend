import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PublishResult, ReviewDraft } from '../models/review';
import { HttpReviewsApi, toPublishBody } from './http-reviews-api';

const draft: ReviewDraft = {
  empresa: { id: 3, nombre: 'Empresa Ficticia' },
  local: { id: 5, nombre: 'Casa central', ciudad: 'Asunción' },
  cargo: { id: 2, nombre: 'Cajera' },
  situacion: 'ACTUAL',
  ultimoAnio: 2026,
  tipoContrato: { id: 1, nombre: 'Por tiempo indefinido' },
  modalidad: { id: 1, nombre: 'Presencial' },
  respuestas: { CP01: 'SI', CP02: 'NO_SABE' },
  calificacion: 4,
  loBueno: 'Texto de ejemplo para lo bueno.',
  aMejorar: 'Texto de ejemplo para lo que debería mejorar.',
};

describe('HttpReviewsApi', () => {
  it('con situación actual no manda el año, y manda el cargo de la lista por id', () => {
    const body = toPublishBody(draft);
    expect(body).toMatchObject({ idLocal: 5, idCargo: 2, situacion: 'ACTUAL', idTipoContrato: 1, idModalidad: 1 });
    expect('ultimoAnio' in body).toBe(false);
    expect('cargoPropuesto' in body).toBe(false);
  });

  it('con situación anterior manda el año, y un cargo propuesto por su nombre', () => {
    const body = toPublishBody({ ...draft, situacion: 'ANTERIOR', ultimoAnio: 2024, cargo: { id: null, nombre: 'Repositor' } });
    expect(body).toMatchObject({ ultimoAnio: 2024, cargoPropuesto: 'Repositor' });
    expect('idCargo' in body).toBe(false);
  });

  it('publica con POST /reviews y devuelve el resultado de la moderación', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), HttpReviewsApi] });
    const api = TestBed.inject(HttpReviewsApi);
    const http = TestBed.inject(HttpTestingController);
    let result: PublishResult | undefined;
    api.publish(draft).subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/reviews'));
    expect(req.request.body.respuestas).toEqual({ CP01: 'SI', CP02: 'NO_SABE' });
    req.flush({ id: 9, estado: 'rechazada', categoria: 'DP', motivo: 'Sacá los datos de contacto.' });
    expect(result).toEqual({ estado: 'rechazada', categoria: 'DP', motivo: 'Sacá los datos de contacto.' });
    http.verify();
  });
});

import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CriteriaConfig, MyReview } from '../../../core/models/review';
import { applyCriteriaConfig, createReviewForm, fromMyReview, linkConditionalFields, OTHER_JOB, toDraft } from './review-form';

const TEXT = 'Texto de ejemplo con más de cincuenta caracteres para cumplir el mínimo.';
const config = {
  categorias: [{ codigo: 'CAT', nombre: 'Categoría', orden: 1, items: [{ codigo: 'CP01', orden: 1, texto: 'Ítem' }] }],
  textos: [
    { codigo: 'LO_BUENO', etiqueta: 'Lo bueno', placeholder: '', minimo: 50, maximo: 1000 },
    { codigo: 'A_MEJORAR', etiqueta: 'A mejorar', placeholder: '', minimo: 50, maximo: 1000 },
  ],
} as CriteriaConfig;
const jobs = [{ id: 2, descripcion: 'Cajera' }];
const lookups = { jobs, contractTypes: [{ id: 1, nombre: 'Indefinido' }], workModes: [{ id: 3, nombre: 'Presencial' }] };

function review(overrides: Partial<MyReview['ultimaVersion']> = {}): MyReview {
  return {
    id: 9,
    empresa: { id: 4, nombre: 'Empresa Ficticia' },
    local: { id: 5, nombre: 'Casa central', ciudad: 'Asunción' },
    publicada: true,
    ultimaVersion: {
      numero: 1, estado: 'rechazada', categoria: 'DP', motivo: 'Sacá los datos.', cargo: { id: 2, descripcion: 'Cajera', aprobado: true },
      situacion: 'ANTERIOR', ultimoAnio: 2024, tipoContrato: { id: 1, nombre: 'Indefinido' }, modalidad: { id: 3, nombre: 'Presencial' },
      calificacion: 3, loBueno: TEXT, aMejorar: TEXT, respuestas: [{ codigo: 'CP01', respuesta: 'NO' }, { codigo: 'VIEJO', respuesta: 'SI' }],
      fecha: '2026-11-21T12:00:00Z', ...overrides,
    },
  };
}

function setup() {
  const form = createReviewForm();
  linkConditionalFields(form, TestBed.inject(DestroyRef));
  applyCriteriaConfig(form, config);
  return form;
}

describe('fromMyReview', () => {
  it('carga la última versión: con las reglas aceptadas, el formulario queda listo para enviar', () => {
    const form = setup();
    fromMyReview(form, review(), jobs);
    expect(form.controls.criterios.value).toEqual({ CP01: 'NO' });
    form.controls.texto.controls.aceptaReglas.setValue(true);
    expect(form.valid).toBe(true);
    expect(toDraft(form, lookups)).toMatchObject({
      empresa: { id: 4 }, local: { id: 5, ciudad: 'Asunción' }, cargo: { id: 2, nombre: 'Cajera' },
      situacion: 'ANTERIOR', ultimoAnio: 2024, respuestas: { CP01: 'NO' }, calificacion: 3,
    });
  });

  it('un cargo propuesto pendiente vuelve como «no está en la lista», con su texto', () => {
    const form = setup();
    fromMyReview(form, review({ cargo: { id: 77, descripcion: 'Repositor', aprobado: false } }), jobs);
    expect(form.controls.relacion.value).toMatchObject({ cargo: OTHER_JOB, cargoNuevo: 'Repositor' });
  });

  it('con situación actual no carga el año', () => {
    const form = setup();
    fromMyReview(form, review({ situacion: 'ACTUAL', ultimoAnio: null }), jobs);
    expect(form.controls.relacion.controls.ultimoAnio.value).toBeNull();
    expect(form.controls.relacion.valid).toBe(true);
  });
});

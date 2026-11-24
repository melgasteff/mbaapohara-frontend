import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CriteriaConfig, MyReview } from '../../../core/models/review';
import { CompanyDetail } from '../../../core/models/company';
import {
  applyCriteriaConfig, createReviewForm, fromMyReview, fromSavedDraft, jobText, linkConditionalFields, missingMessage, OTHER_JOB, previewMeta,
  resumeStep, setJobText, toDraft, toSavedDraft,
} from './review-form';

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

describe('cargo escrito', () => {
  it('usa el de la lista si coincide, sin distinguir mayúsculas, tildes ni espacios', () => {
    const { relacion } = setup().controls;
    setJobText(relacion, '  cajerá ', jobs);
    expect(relacion.value).toMatchObject({ cargo: 2, cargoNuevo: '' });
    expect(jobText(relacion.getRawValue(), jobs)).toBe('Cajera');
  });

  it('si no está en la lista, se propone tal como se escribió', () => {
    const { relacion } = setup().controls;
    setJobText(relacion, 'Repositor', jobs);
    expect(relacion.value).toMatchObject({ cargo: OTHER_JOB, cargoNuevo: 'Repositor' });
    expect(relacion.controls.cargoNuevo.valid).toBe(true);
  });

  it('vacío o de una letra no alcanza', () => {
    const form = setup();
    setJobText(form.controls.relacion, '   ', jobs);
    expect(form.controls.relacion.controls.cargo.invalid).toBe(true);
    expect(missingMessage(form, 2, config.textos)).toBe('Escribí tu cargo.');
    setJobText(form.controls.relacion, 'x', jobs);
    expect(missingMessage(form, 2, config.textos)).toBe('Escribí tu cargo (al menos 2 letras).');
  });

  it('en la vista previa, uno propuesto se ve «Otro cargo»', () => {
    const form = setup();
    fromMyReview(form, review({ cargo: { id: 77, descripcion: 'Repositor', aprobado: false } }), jobs);
    expect(previewMeta(form.getRawValue(), jobs)).toEqual(['Trabajó aquí', 'Otro cargo', 'Casa central, Asunción', 'hasta 2024']);
  });
});

describe('borrador', () => {
  const office = { id: 5, nombre: 'Casa central', idEmpresa: 4, ciudad: { id: 1, nombre: 'Asunción', idDepartamento: 1 } };
  const company = { id: 4, nombre: 'Empresa Ficticia', locales: [office] } as unknown as CompanyDetail;

  function filled() {
    const form = setup();
    fromMyReview(form, review(), jobs);
    form.controls.texto.controls.aceptaReglas.setValue(true);
    return form;
  }

  it('sin empresa no hay nada que guardar', () => {
    expect(toSavedDraft(setup().getRawValue(), 1, jobs)).toBeNull();
  });

  it('vuelve completo, salvo la aceptación de las reglas', () => {
    const saved = toSavedDraft(filled().getRawValue(), 4, jobs)!;
    const form = setup();
    fromSavedDraft(form, saved, company, lookups);
    expect(form.getRawValue().texto.aceptaReglas).toBe(false);
    expect(form.getRawValue().criterios).toEqual({ CP01: 'NO' });
    expect(resumeStep(form, saved.paso)).toBe(4);
    expect(missingMessage(form, 4, config.textos)).toBe('Para enviar, aceptá las reglas de publicación.');
  });

  it('lo que ya no existe queda sin elegir y se retoma en ese paso', () => {
    const saved = { ...toSavedDraft(filled().getRawValue(), 4, jobs)!, tipoContrato: 99, respuestas: { VIEJO: 'SI' } };
    const form = setup();
    fromSavedDraft(form, saved, company, lookups);
    expect(form.controls.relacion.controls.tipoContrato.value).toBeNull();
    expect(form.controls.criterios.value).toEqual({ CP01: null });
    expect(resumeStep(form, saved.paso)).toBe(2);
  });

  it('si la empresa ya no está, conserva lo escrito y vuelve al paso 1', () => {
    const saved = toSavedDraft(filled().getRawValue(), 4, jobs)!;
    const form = setup();
    fromSavedDraft(form, saved, null, lookups);
    expect(form.controls.lugar.value).toEqual({ empresa: null, local: null });
    expect(form.controls.texto.controls.loBueno.value).toBe(TEXT);
    expect(resumeStep(form, saved.paso)).toBe(1);
  });
});

describe('missingMessage', () => {
  it('dice lo primero que falta en cada paso', () => {
    const form = setup();
    expect(missingMessage(form, 1, config.textos)).toBe('Elegí la empresa para seguir.');
    expect(missingMessage(form, 4, config.textos)).toBe('Elegí de 1 a 5 estrellas.');
    form.controls.texto.patchValue({ calificacion: 4, loBueno: 'corto' });
    expect(missingMessage(form, 4, config.textos)).toBe('«Lo bueno» necesita al menos 50 caracteres.');
  });
});

import { registerLocaleData } from '@angular/common';
import localeEsPy from '@angular/common/locales/es-PY';
import { CriteriaConfig, PublicReview } from '../../../../core/models/review';
import { complianceGroups, publicationMonth, publicReviewMeta } from './review-view';

// El mismo idioma que registra app.config.ts.
registerLocaleData(localeEsPy);

const review: PublicReview = {
  id: 1,
  empresa: { id: 4, nombre: 'Empresa Ficticia' },
  local: { id: 5, nombre: 'Casa central', ciudad: 'Asunción' },
  cargo: null,
  situacion: 'ANTERIOR',
  ultimoAnio: 2025,
  tipoContrato: { id: 1, nombre: 'Indefinido' },
  modalidad: { id: 1, nombre: 'Presencial' },
  calificacion: 4,
  loBueno: 'x',
  aMejorar: 'y',
  respuestas: [{ codigo: 'B1', respuesta: 'NO' }, { codigo: 'A1', respuesta: 'SI' }, { codigo: 'RETIRADO', respuesta: 'SI' }],
  mesPublicacion: '2026-11',
};

const config = {
  opcionesRespuesta: [{ valor: 'SI', etiqueta: 'Sí' }, { valor: 'NO', etiqueta: 'No' }],
  categorias: [
    { codigo: 'B', nombre: 'Segunda', orden: 2, items: [{ codigo: 'B1', orden: 1, texto: 'Ítem B1' }] },
    { codigo: 'A', nombre: 'Primera', orden: 1, items: [{ codigo: 'A1', orden: 1, texto: 'Ítem A1' }, { codigo: 'A2', orden: 2, texto: 'Sin respuesta' }] },
  ],
} as CriteriaConfig;

describe('Vista de una reseña pública', () => {
  it('metadatos sin género, con «Otro cargo» para un cargo no aprobado', () => {
    expect(publicReviewMeta(review)).toEqual(['Trabajó aquí', 'Otro cargo', 'Casa central, Asunción', 'hasta 2025']);
    expect(publicReviewMeta({ ...review, situacion: 'ACTUAL', ultimoAnio: null, cargo: 'Cajera' })).toEqual(['Trabaja aquí', 'Cajera', 'Casa central, Asunción']);
  });

  it('muestra solo el mes de publicación', () => {
    expect(publicationMonth('2026-11', 'es-PY')).toBe('Noviembre de 2026');
    expect(publicationMonth('', 'es-PY')).toBe('');
  });

  it('agrupa las respuestas por categoría en el orden del JSON y omite criterios retirados', () => {
    expect(complianceGroups(review, config)).toEqual([
      { categoria: 'Primera', filas: [{ codigo: 'A1', texto: 'Ítem A1', valor: 'SI', etiqueta: 'Sí' }] },
      { categoria: 'Segunda', filas: [{ codigo: 'B1', texto: 'Ítem B1', valor: 'NO', etiqueta: 'No' }] },
    ]);
  });
});

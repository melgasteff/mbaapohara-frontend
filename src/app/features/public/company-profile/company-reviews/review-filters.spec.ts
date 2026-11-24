import { OfficeSummary } from '../../../../core/models/company';
import { PublicReviewFacets } from '../../../../core/models/review';
import { hasReviewFilters, officesByCity, officesText, ReviewFilters, reviewFilterOptions, toFacetFilters, toReviewOrder, toSituation } from './review-filters';

const base: ReviewFilters = { orden: 'recientes', page: 1 };
const all: PublicReviewFacets = {
  total: 5,
  local: { total: 5, opciones: [{ id: 1, nombre: 'Centro', ciudad: 'Asunción', cantidad: 4 }, { id: 2, nombre: 'Norte', ciudad: 'Luque', cantidad: 1 }] },
  cargo: { total: 5, opciones: [{ id: 7, nombre: 'Caja', cantidad: 3 }, { id: 8, nombre: 'Depósito', cantidad: 1 }] },
  tipoContrato: { total: 5, opciones: [{ id: 3, nombre: 'A plazo fijo', cantidad: 5 }] },
  modalidad: { total: 5, opciones: [] },
  situacion: { total: 5, opciones: [{ valor: 'ANTERIOR', cantidad: 5 }] },
};
/** Con el local 2: el cargo 7 queda en cero. */
const filtered: PublicReviewFacets = { ...all, total: 1, cargo: { total: 1, opciones: [{ id: 8, nombre: 'Depósito', cantidad: 1 }] } };

const office = (id: number, nombre: string, ciudad: string): OfficeSummary => ({
  id, nombre, idEmpresa: 1, ciudad: { id, nombre: ciudad, idDepartamento: 1 }, direccionReferencia: null, estado: 'aprobada', cantidadResenas: 0,
});

describe('Filtros de reseñas del perfil', () => {
  it('lee la URL y descarta valores que no existen', () => {
    expect([toSituation('ACTUAL'), toSituation('x')]).toEqual(['ACTUAL', undefined]);
    expect([toReviewOrder('peor'), toReviewOrder('x'), toReviewOrder(undefined)]).toEqual(['peor', 'recientes', 'recientes']);
  });

  it('el orden y la página no cuentan como filtro ni viajan en los conteos', () => {
    expect(hasReviewFilters({ ...base, orden: 'mejor', page: 3 })).toBe(false);
    expect(hasReviewFilters({ ...base, modalidad: 2 })).toBe(true);
    expect(toFacetFilters(4, { ...base, local: 2, orden: 'peor', page: 3 })).toEqual({ empresa: 4, local: 2, cargo: undefined, tipoContrato: undefined, modalidad: undefined, situacion: undefined });
  });

  it('cada opción lleva su conteo; el local, además, su ciudad', () => {
    const options = reviewFilterOptions(base, all, all);
    expect(options.local).toEqual([
      { valor: null, etiqueta: 'todos los locales', detalle: 5 },
      { valor: 1, etiqueta: 'Centro', detalle: 'Asunción · 4' },
      { valor: 2, etiqueta: 'Norte', detalle: 'Luque · 1' },
    ]);
    expect(options.situacion.map((o) => o.detalle)).toEqual([5, 0, 5]);
  });

  it('muestra solo las opciones con resultados y la elegida, con su nombre, aunque quede en cero', () => {
    expect(reviewFilterOptions({ ...base, local: 2 }, filtered, all).cargo.map((o) => o.etiqueta)).toEqual(['cualquier cargo', 'Depósito']);
    const withSelected = reviewFilterOptions({ ...base, local: 2, cargo: 7 }, filtered, all).cargo;
    expect(withSelected.find((o) => o.valor === 7)).toEqual({ valor: 7, etiqueta: 'Caja', detalle: 0 });
  });

  it('un valor de la URL que la empresa no tiene igual aparece, y sin conteos la lista no falla', () => {
    expect(reviewFilterOptions({ ...base, cargo: 99 }, all, all).cargo.at(-1)).toEqual({ valor: 99, etiqueta: 'la opción elegida', detalle: 0 });
    expect(reviewFilterOptions(base, undefined, undefined).local).toEqual([{ valor: null, etiqueta: 'todos los locales', detalle: undefined }]);
  });

  it('agrupa los locales por ciudad y los resume en una línea', () => {
    const offices = [office(1, 'Centro', 'Luque'), office(2, 'Norte', 'Asunción'), office(3, 'Sur', 'Luque')];
    expect(officesByCity(offices).map((g) => [g.ciudad, g.locales.length])).toEqual([['Asunción', 1], ['Luque', 2]]);
    expect(officesText({ locales: offices })).toBe('3 locales en Asunción y Luque');
    expect(officesText({ locales: offices.slice(0, 1) })).toBe('1 local en Luque');
    expect(officesText({ locales: ['A', 'B', 'C', 'D'].map((c, i) => office(i, c, c)) })).toBe('4 locales en 4 ciudades');
    expect(officesText({ locales: [] })).toBe('');
  });
});

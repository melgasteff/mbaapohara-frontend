import { CriteriaCategory } from '../../../core/models/review';
import { advance, answeredCount, answerSummary, enterCategory, enterCriteria, firstPending, isComplete, totals } from './criteria-progress';

const category = (codigo: string, codes: string[]): CriteriaCategory => ({
  codigo, nombre: codigo, orden: 1, items: codes.map((code, i) => ({ codigo: code, orden: i, texto: code })),
});
const categories = [category('A', ['a1', 'a2', 'a3']), category('B', ['b1', 'b2'])];
const at = (categoria: number, pregunta: number, cerrada = false) => ({ categoria, pregunta, cerrada });

describe('Avance del paso 3', () => {
  it('cuenta las respondidas por categoría y en total', () => {
    const answers = { a1: 'SI', a2: null, b1: 'NO_SABE' };
    expect(answeredCount(categories[0], answers)).toBe(1);
    expect(totals(categories, answers)).toEqual({ respondidas: 2, total: 5 });
    expect(isComplete(categories[1], { b1: 'SI', b2: 'NO' })).toBe(true);
  });

  it('pasa a la siguiente sin respuesta, salteando las respondidas', () => {
    expect(advance(categories, at(0, 0), { a1: 'SI', a2: 'NO' })).toEqual(at(0, 2));
  });

  it('al llegar al final vuelve a la que quedó atrás', () => {
    expect(advance(categories, at(0, 2), { a2: 'SI', a3: 'SI' })).toEqual(at(0, 0));
  });

  it('con la categoría completa, la cierra', () => {
    expect(advance(categories, at(0, 1), { a1: 'SI', a2: 'SI', a3: 'SI' })).toEqual(at(0, 1, true));
  });

  it('entra por lo primero que falta', () => {
    expect(enterCriteria(categories, {})).toEqual(at(0, 0));
    expect(enterCriteria(categories, { a1: 'SI', a2: 'SI', a3: 'SI', b1: 'SI' })).toEqual(at(1, 1));
    expect(enterCategory(categories, 0, { a1: 'SI', a2: 'SI', a3: 'SI' })).toEqual(at(0, 0, true));
  });

  it('con todo respondido no queda ninguna pendiente y entra al resumen', () => {
    const all = { a1: 'SI', a2: 'SI', a3: 'SI', b1: 'SI', b2: 'SI' };
    expect(firstPending(categories, all)).toBe(-1);
    expect(enterCriteria(categories, all)).toEqual(at(0, 0, true));
  });

  it('resume las respuestas en el orden de las opciones, sin las que no se usaron', () => {
    const options = [{ valor: 'SI', etiqueta: 'Sí' }, { valor: 'EN_PARTE', etiqueta: 'En parte' }, { valor: 'NO', etiqueta: 'No' }];
    expect(answerSummary(categories, { a1: 'NO', a2: 'SI', b1: 'SI' }, options)).toEqual([
      { valor: 'SI', etiqueta: 'Sí', cantidad: 2 },
      { valor: 'NO', etiqueta: 'No', cantidad: 1 },
    ]);
  });
});

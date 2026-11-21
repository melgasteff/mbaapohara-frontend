import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage, apiProblems, isConflict } from './api-error';

const error = (status: number, body: unknown) => new HttpErrorResponse({ status, error: body });

describe('Errores de la API', () => {
  it('usa el mensaje del backend, o uno genérico', () => {
    expect(apiErrorMessage(error(409, { message: 'Ya escribiste una reseña de este local.' }))).toBe('Ya escribiste una reseña de este local.');
    expect(apiErrorMessage(error(400, { message: ['a', 'b'] }))).toBe('a b');
    expect(apiErrorMessage(error(0, null))).toContain('conectarnos');
    expect(apiErrorMessage(new Error('x'))).toContain('Algo salió mal');
  });

  it('devuelve los problemas de una reseña rechazada por la validación', () => {
    expect(apiProblems(error(400, { message: 'x', problemas: ['Faltan respuestas: CP01', 7] }))).toEqual(['Faltan respuestas: CP01']);
    expect(apiProblems(error(409, { problemas: ['x'] }))).toEqual([]);
  });

  it('reconoce el conflicto', () => {
    expect(isConflict(error(409, {}))).toBe(true);
    expect(isConflict(error(400, {}))).toBe(false);
  });
});

import { personalDataReason } from './reviews-api.mock';

describe('personalDataReason (moderación simulada)', () => {
  it('deja pasar un texto sin datos personales', () => {
    expect(personalDataReason('Pagan en fecha y el ambiente es bueno; en 2025 subieron el salario.')).toBeUndefined();
  });

  it('manda a revisión un correo', () => {
    expect(personalDataReason('Escribime a persona@ejemplo.com')).toContain('correo');
  });

  it('manda a revisión un teléfono o una cédula', () => {
    expect(personalDataReason('Llamá al 0981 123 456')).toContain('teléfono');
    expect(personalDataReason('Mi cédula es 4.567.890')).toContain('documento');
  });
});

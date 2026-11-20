import { simulateModeration } from './reviews-api.mock';

describe('simulateModeration (prototipo de la política de moderación)', () => {
  it('publica la crítica a la empresa, aunque sea dura', () => {
    expect(simulateModeration('No pagan el IPS y en 2025 las horas extra se pagaron tarde.').estado).toBe('publicada');
  });

  it('rechaza con explicación un correo, un teléfono, una cédula o un enlace (DP)', () => {
    for (const text of ['Escribime a persona@ejemplo.com', 'Llamá al 0981 123 456', 'Mi cédula es 4.567.890', 'Mirá www.ejemplo.com']) {
      const result = simulateModeration(text);
      expect(result).toMatchObject({ estado: 'rechazada', categoria: 'DP' });
      expect(result.motivo).toContain('Sacalos');
    }
  });

  it('manda a revisión humana una posible acusación de delito (ACU)', () => {
    expect(simulateModeration('La supervisora acosa a las cajeras.')).toMatchObject({ estado: 'en_revision', categoria: 'ACU' });
  });

  it('los datos de contacto ganan sobre la acusación (orden de la tabla de decisión)', () => {
    expect(simulateModeration('Me robaron el sueldo, llamá al 0981 123 456').estado).toBe('rechazada');
  });
});

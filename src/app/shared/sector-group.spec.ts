import { SECTOR_GROUPS, sectorGroup } from './sector-group';

describe('Grupo de rubro', () => {
  it('cubre las 21 secciones CIIU', () => {
    const expected: Record<string, string> = {
      comercio: 'G',
      industria: 'BCDEF',
      servicios: 'JKLMNOPQRTU',
      gastronomia: 'I',
      transporte: 'H',
      'agro-otros': 'AS',
    };
    const seen = Object.entries(expected).flatMap(([group, letters]) =>
      [...letters].map((letter) => {
        expect(sectorGroup(letter), letter).toBe(group);
        return letter;
      }),
    );
    expect(seen.sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTU');
    expect(Object.keys(SECTOR_GROUPS).sort()).toEqual(Object.keys(expected).sort());
  });

  it('un código vacío o desconocido va a «Agro y otros»', () => {
    expect(sectorGroup(null)).toBe('agro-otros');
    expect(sectorGroup('')).toBe('agro-otros');
    expect(sectorGroup('9')).toBe('agro-otros');
  });
});

import { CompanyFacets } from '../../../core/models/company';
import { groupOptions, hasFilters, placeOptions, placeParams, placeValue, reviewOptions, toFilters, toGroup, toOrder, toReviews } from './directory-filters';

const facets: CompanyFacets = {
  total: 4,
  experiencias: 9,
  grupos: { total: 5, opciones: [{ grupo: 'comercio', cantidad: 3 }, { grupo: 'transporte', cantidad: 0 }] },
  departamentos: { total: 6, opciones: [{ id: 5, nombre: 'Caaguazú', cantidad: 2 }] },
  ciudades: { total: 4, opciones: [{ id: 12, nombre: 'Coronel Oviedo', idDepartamento: 5, cantidad: 2 }] },
  resenas: { total: 7, con: 3, sin: 4 },
};
const departments = [{ id: 1, nombre: 'Central' }, { id: 5, nombre: 'Caaguazú' }, { id: 9, nombre: 'Guairá' }];

describe('Filtros del directorio', () => {
  it('lee la URL y descarta valores que no existen', () => {
    expect([toGroup('comercio'), toGroup('otro'), toGroup(undefined)]).toEqual(['comercio', undefined, undefined]);
    expect([toReviews('con'), toReviews('sin'), toReviews('x')]).toEqual(['con', 'sin', undefined]);
    expect([toOrder('nombre'), toOrder('x'), toOrder(undefined)]).toEqual(['nombre', 'resenas', 'resenas']);
  });

  it('traduce a los filtros de la API', () => {
    expect(toFilters({ q: '  banco ', resenas: 'con' })).toEqual({ q: 'banco', grupo: undefined, departamento: undefined, ciudad: undefined, conResenas: true });
    expect(toFilters({ resenas: 'sin' }).conResenas).toBe(false);
    expect(toFilters({}).conResenas).toBeUndefined();
  });

  it('cualquier filtro cuenta como activo, también el departamento solo', () => {
    expect(hasFilters({})).toBe(false);
    expect(hasFilters({ q: '   ' })).toBe(false);
    expect(hasFilters({ departamento: 5 })).toBe(true);
    expect(hasFilters({ resenas: 'sin' })).toBe(true);
  });

  it('cada opción lleva su conteo, y «todos» el total sin ese filtro', () => {
    const groups = groupOptions(facets);
    expect(groups[0]).toEqual({ valor: null, etiqueta: 'todos los rubros', detalle: 5 });
    expect(groups.find((o) => o.valor === 'comercio')).toEqual({ valor: 'comercio', etiqueta: 'comercio', detalle: 3 });
    expect(groups.find((o) => o.valor === 'transporte')?.detalle).toBe(0);
    expect(reviewOptions(facets).map((o) => o.detalle)).toEqual([7, 3, 4]);
    expect(groupOptions(undefined)).toHaveLength(7);
  });

  it('el lugar lista los departamentos con empresas y la ciudad elegida', () => {
    expect(placeOptions({}, facets, departments, undefined).map((o) => o.etiqueta)).toEqual(['todo el país', 'Caaguazú']);
    const withCity = placeOptions({ ciudad: 12 }, facets, departments, { id: 12, nombre: 'Coronel Oviedo' });
    expect(withCity[1]).toEqual({ valor: 'c12', etiqueta: 'Coronel Oviedo', detalle: 2 });
  });

  it('el departamento elegido sigue en la lista aunque otro filtro lo deje en cero', () => {
    expect(placeOptions({ departamento: 9 }, facets, departments, undefined).find((o) => o.valor === 'd9')).toEqual({ valor: 'd9', etiqueta: 'Guairá', detalle: 0 });
    expect(placeOptions({ departamento: 9 }, undefined, [], undefined).find((o) => o.valor === 'd9')?.etiqueta).toBe('el departamento elegido');
  });

  it('el lugar va y vuelve de la URL', () => {
    expect([placeValue({}), placeValue({ departamento: 5 }), placeValue({ departamento: 5, ciudad: 12 })]).toEqual([null, 'd5', 'c12']);
    expect(placeParams('d5')).toEqual({ departamento: 5, ciudad: null });
    expect(placeParams('c12')).toEqual({ departamento: null, ciudad: 12 });
    expect(placeParams(null)).toEqual({ departamento: null, ciudad: null });
  });
});

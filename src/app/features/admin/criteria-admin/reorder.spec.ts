import { moveChanges } from './reorder';

describe('Reordenar criterios', () => {
  const items = [{ id: 10, orden: 1 }, { id: 20, orden: 2 }, { id: 30, orden: 3 }];

  it('cambia solo los dos que se intercambian', () => {
    expect(moveChanges(items, 20, -1)).toEqual([{ id: 20, orden: 1 }, { id: 10, orden: 2 }]);
    expect(moveChanges(items, 20, 1)).toEqual([{ id: 30, orden: 2 }, { id: 20, orden: 3 }]);
  });

  it('en los extremos no hay cambios', () => {
    expect(moveChanges(items, 10, -1)).toEqual([]);
    expect(moveChanges(items, 30, 1)).toEqual([]);
    expect(moveChanges(items, 99, 1)).toEqual([]);
  });

  it('con números repetidos o salteados, los deja seguidos', () => {
    const messy = [{ id: 1, orden: 0 }, { id: 2, orden: 0 }, { id: 3, orden: 7 }];
    expect(moveChanges(messy, 2, -1)).toEqual([{ id: 2, orden: 1 }, { id: 1, orden: 2 }, { id: 3, orden: 3 }]);
  });
});

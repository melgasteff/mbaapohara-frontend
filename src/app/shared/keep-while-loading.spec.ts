import { signal } from '@angular/core';
import { keepWhileLoading } from './keep-while-loading';

describe('keepWhileLoading', () => {
  it('conserva lo anterior mientras carga y lo descarta si hay error', () => {
    const value = signal<string | undefined>('uno');
    const error = signal<unknown>(undefined);
    const kept = keepWhileLoading({ hasValue: () => value() !== undefined, value, error });
    expect(kept()).toBe('uno');
    value.set(undefined);
    expect(kept()).toBe('uno');
    value.set('dos');
    expect(kept()).toBe('dos');
    value.set(undefined);
    error.set(new Error('red'));
    expect(kept()).toBeUndefined();
    error.set(undefined);
    expect(kept()).toBeUndefined();
  });
});

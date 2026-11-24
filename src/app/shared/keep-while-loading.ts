import { linkedSignal, Signal } from '@angular/core';

/** Lo que se usa de un `httpResource`. */
interface ResourceLike<T> {
  hasValue(): boolean;
  value: Signal<T | undefined>;
  error: Signal<unknown>;
}

/**
 * Al cambiar los parámetros, un `httpResource` queda sin valor hasta que responde la API. Esto conserva el valor anterior
 * mientras carga, para que la pantalla no parpadee. Si hay un error no hay valor: lo viejo no corresponde a lo pedido.
 */
export function keepWhileLoading<T>(resource: ResourceLike<T>): Signal<T | undefined> {
  return linkedSignal<{ failed: boolean; value: T | undefined }, T | undefined>({
    source: () => ({ failed: !!resource.error(), value: resource.hasValue() ? resource.value() : undefined }),
    computation: ({ failed, value }, previous) => (failed ? undefined : (value ?? previous?.value)),
  }).asReadonly();
}

/** Transforma un parámetro de la URL en un id positivo; cualquier otro valor queda `undefined`. */
export function toId(value: unknown): number | undefined {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

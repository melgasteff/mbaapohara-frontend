import { CriteriaCategory, ReviewOption } from '../../../core/models/review';

/** Respuesta de cada criterio por código; sin responder es `null`. */
export type Answers = Record<string, string | null>;

/** Dónde está la persona en el paso 3. `cerrada` muestra el resumen de la categoría en lugar de una pregunta. */
export interface CriteriaPosition {
  categoria: number;
  pregunta: number;
  cerrada: boolean;
}

export function answeredCount(category: CriteriaCategory, answers: Answers): number {
  return category.items.filter((item) => answers[item.codigo]).length;
}

export function isComplete(category: CriteriaCategory, answers: Answers): boolean {
  return answeredCount(category, answers) === category.items.length;
}

export function totals(categories: CriteriaCategory[], answers: Answers): { respondidas: number; total: number } {
  return {
    respondidas: categories.reduce((sum, category) => sum + answeredCount(category, answers), 0),
    total: categories.reduce((sum, category) => sum + category.items.length, 0),
  };
}

/** Índice de la primera categoría con algo sin responder; -1 si no queda ninguna. */
export function firstPending(categories: CriteriaCategory[], answers: Answers): number {
  return categories.findIndex((category) => !isComplete(category, answers));
}

/** Entrada a una categoría: su primera pregunta sin responder, o el resumen si está completa. */
export function enterCategory(categories: CriteriaCategory[], index: number, answers: Answers): CriteriaPosition {
  const pending = categories[index]?.items.findIndex((item) => !answers[item.codigo]) ?? -1;
  return { categoria: index, pregunta: Math.max(0, pending), cerrada: pending < 0 };
}

/** Entrada al paso 3: lo primero que falta; con todo respondido, el resumen de la primera categoría. */
export function enterCriteria(categories: CriteriaCategory[], answers: Answers): CriteriaPosition {
  return enterCategory(categories, Math.max(0, firstPending(categories, answers)), answers);
}

/**
 * Después de responder: la siguiente sin respuesta de la categoría, después las que quedaron atrás, y si no falta
 * ninguna, el cierre. `answers` ya incluye la respuesta nueva.
 */
export function advance(categories: CriteriaCategory[], position: CriteriaPosition, answers: Answers): CriteriaPosition {
  const items = categories[position.categoria].items;
  const isPending = (i: number) => !answers[items[i].codigo];
  const indexes = items.map((_, i) => i);
  const next = indexes.find((i) => i > position.pregunta && isPending(i)) ?? indexes.find(isPending);
  return next === undefined ? { ...position, cerrada: true } : { ...position, pregunta: next, cerrada: false };
}

/** Cuántas veces se eligió cada respuesta, en el orden de las opciones y sin las que no se usaron. */
export function answerSummary(categories: CriteriaCategory[], answers: Answers, options: ReviewOption[]): (ReviewOption & { cantidad: number })[] {
  const values = categories.flatMap((category) => category.items.map((item) => answers[item.codigo]));
  return options
    .map((option) => ({ ...option, cantidad: values.filter((value) => value === option.valor).length }))
    .filter((option) => option.cantidad > 0);
}

import { formatDate } from '@angular/common';
import { ComplianceGroup, CriteriaConfig, PublicReview } from '../../../../core/models/review';

/** Metadatos sin género: «Trabajó aquí · Cajera · Casa central, Asunción · hasta 2025». */
export function publicReviewMeta(review: PublicReview): string[] {
  return [
    review.situacion === 'ACTUAL' ? 'Trabaja aquí' : 'Trabajó aquí',
    // Un cargo propuesto se muestra recién cuando el administrador lo aprueba.
    review.cargo ?? 'Otro cargo',
    `${review.local.nombre}, ${review.local.ciudad}`,
    ...(review.situacion === 'ANTERIOR' && review.ultimoAnio ? [`hasta ${review.ultimoAnio}`] : []),
  ];
}

/** «2026-11» → «Noviembre de 2026». La API da solo el mes, nunca el día. */
export function publicationMonth(month: string | null, locale: string): string {
  const [year, monthNumber] = (month ?? '').split('-').map(Number);
  if (!year || !monthNumber) return '';
  const text = formatDate(new Date(year, monthNumber - 1, 1), "MMMM 'de' y", locale);
  return text.charAt(0).toLocaleUpperCase('es') + text.slice(1);
}

/**
 * Respuestas de una reseña agrupadas por categoría, con los textos del JSON de criterios. Un código que el JSON
 * ya no tiene (un criterio retirado) no se muestra.
 */
export function complianceGroups(review: PublicReview, config: CriteriaConfig): ComplianceGroup[] {
  const answers = new Map(review.respuestas.map((a) => [a.codigo, a.respuesta]));
  const labels = new Map(config.opcionesRespuesta.map((o) => [o.valor, o.etiqueta]));
  return [...config.categorias]
    .sort((a, b) => a.orden - b.orden)
    .map((category) => ({
      categoria: category.nombre,
      filas: [...category.items]
        .sort((a, b) => a.orden - b.orden)
        .filter((item) => answers.has(item.codigo))
        .map((item) => {
          const valor = answers.get(item.codigo)!;
          return { codigo: item.codigo, texto: item.texto, valor, etiqueta: labels.get(valor) ?? valor };
        }),
    }))
    .filter((group) => group.filas.length > 0);
}

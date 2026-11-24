import { ComplianceGroup } from '../../../core/models/review';

export interface AnswerCounts {
  si: number;
  enParte: number;
  no: number;
}

/** Cuenta las respuestas de una reseña. «No sé o no aplica» no se cuenta. */
export function answerCounts(groups: ComplianceGroup[]): AnswerCounts {
  const rows = groups.flatMap((group) => group.filas);
  const count = (value: string) => rows.filter((row) => row.valor === value).length;
  return { si: count('SI'), enParte: count('EN_PARTE'), no: count('NO') };
}

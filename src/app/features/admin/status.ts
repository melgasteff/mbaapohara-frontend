import { ProposalStatus } from '../../core/models/company';

/** Etiqueta de cada estado de propuesta (ADAPTACIONES.md: estados con palabra y color de estado). */
export const STATUS: Record<ProposalStatus, { label: string; tag: string }> = {
  pendiente: { label: 'Pendiente', tag: 'mb-tag mb-tag-warning' },
  aprobada: { label: 'Aprobada', tag: 'mb-tag mb-tag-success' },
  rechazada: { label: 'Rechazada', tag: 'mb-tag mb-tag-naranja' },
};

export interface Notice {
  kind: 'ok' | 'error';
  text: string;
}

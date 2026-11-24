import { MyReview, ReviewStatus } from '../../../core/models/review';
import { TabItem } from '../../../shared/ui/tabs/tabs';

export type MyReviewTab = 'todas' | ReviewStatus;

const LABELS: [MyReviewTab, string][] = [
  ['todas', 'Todas'],
  ['publicada', 'Publicadas'],
  ['en_revision', 'En revisión'],
  ['rechazada', 'Necesitan un cambio'],
];

/** Reseñas de una pestaña, según el estado de su última versión. */
export function inTab(reviews: MyReview[], tab: MyReviewTab): MyReview[] {
  return tab === 'todas' ? reviews : reviews.filter((review) => review.ultimaVersion.estado === tab);
}

/** Pestañas con su conteo; el de las que necesitan un cambio pide atención si hay alguna. */
export function myReviewTabs(reviews: MyReview[]): TabItem<MyReviewTab>[] {
  return LABELS.map(([valor, etiqueta]) => {
    const cantidad = inTab(reviews, valor).length;
    return { valor, etiqueta, cantidad, urgente: valor === 'rechazada' && cantidad > 0 };
  });
}

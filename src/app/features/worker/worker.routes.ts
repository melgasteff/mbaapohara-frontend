import { Routes } from '@angular/router';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    title: 'Escribí tu reseña · Mbaapohara',
    loadComponent: () => import('./publish-review/publish-review').then((m) => m.PublishReview),
  },
  {
    // Edición de una reseña propia (3.4): el mismo asistente, con la última versión cargada.
    path: ':id/editar',
    title: 'Editá tu reseña · Mbaapohara',
    loadComponent: () => import('./publish-review/publish-review').then((m) => m.PublishReview),
  },
];

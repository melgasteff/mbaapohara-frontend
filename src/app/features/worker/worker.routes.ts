import { Routes } from '@angular/router';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    title: 'Escribí tu reseña · Mbaapohara',
    data: { encabezado: 'foco', tarea: 'Escribir una reseña' },
    loadComponent: () => import('./publish-review/publish-review').then((m) => m.PublishReview),
  },
  {
    // Edición de una reseña propia (3.4): el mismo asistente, con la última versión cargada.
    path: ':id/editar',
    title: 'Editá tu reseña · Mbaapohara',
    data: { encabezado: 'foco', tarea: 'Editar tu reseña' },
    loadComponent: () => import('./publish-review/publish-review').then((m) => m.PublishReview),
  },
];

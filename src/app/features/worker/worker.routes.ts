import { Routes } from '@angular/router';

export const WORKER_ROUTES: Routes = [
  {
    path: '',
    title: 'Escribí tu reseña · Mbaapohara',
    loadComponent: () => import('./publish-review/publish-review').then((m) => m.PublishReview),
  },
];

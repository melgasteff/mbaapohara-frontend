import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/guards';

// Cada grupo de pantallas se carga de forma diferida (solo cuando se visita).
export const routes: Routes = [
  {
    path: 'publicar',
    canMatch: [authGuard],
    loadChildren: () => import('./features/worker/worker.routes').then((m) => m.WORKER_ROUTES),
  },
  {
    path: 'mi-cuenta',
    canMatch: [authGuard],
    title: 'Mi cuenta · Mbaapohara',
    loadComponent: () => import('./features/worker/my-account/my-account').then((m) => m.MyAccount),
  },
  {
    path: 'mis-resenas',
    canMatch: [authGuard],
    title: 'Mis reseñas · Mbaapohara',
    loadComponent: () => import('./features/worker/my-reviews/my-reviews').then((m) => m.MyReviews),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    data: { encabezado: 'admin' },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    // Sin buscador en el encabezado: la página ya tiene uno.
    path: '**',
    title: 'Página no encontrada · Mbaapohara',
    data: { encabezado: 'inicio' },
    loadComponent: () => import('./features/public/not-found/not-found').then((m) => m.NotFound),
  },
];

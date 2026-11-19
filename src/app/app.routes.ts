import { Routes } from '@angular/router';

// Cada grupo de pantallas se carga de forma diferida (solo cuando se visita).
export const routes: Routes = [
  {
    path: 'publicar',
    loadChildren: () => import('./features/worker/worker.routes').then((m) => m.WORKER_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  { path: '**', redirectTo: '' },
];

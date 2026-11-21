import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout';

// Todo el grupo está protegido por adminGuard (app.routes.ts).
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'empresas' },
      {
        path: 'moderacion',
        title: 'Moderación · Mbaapohara',
        loadComponent: () => import('./moderation-queue/moderation-queue').then((m) => m.ModerationQueue),
      },
      {
        path: 'empresas',
        title: 'Administrar empresas · Mbaapohara',
        loadComponent: () => import('./companies-admin/companies-admin').then((m) => m.CompaniesAdmin),
      },
      {
        path: 'empresas/nueva',
        title: 'Nueva empresa · Mbaapohara',
        loadComponent: () => import('./company-new/company-new').then((m) => m.CompanyNew),
      },
      {
        path: 'empresas/:id',
        title: 'Gestionar empresa · Mbaapohara',
        loadComponent: () => import('./company-manage/company-manage').then((m) => m.CompanyManage),
      },
      {
        path: 'locales',
        title: 'Locales pendientes · Mbaapohara',
        loadComponent: () => import('./offices-pending/offices-pending').then((m) => m.OfficesPending),
      },
      {
        path: 'cargos',
        title: 'Cargos · Mbaapohara',
        loadComponent: () => import('./jobs-admin/jobs-admin').then((m) => m.JobsAdmin),
      },
    ],
  },
];

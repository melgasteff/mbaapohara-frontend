import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AdminLayout } from './admin-layout';

// Todo el grupo está protegido por adminGuard (app.routes.ts).
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'moderacion' },
      {
        path: 'moderacion',
        title: 'Moderación · Mbaapohara',
        loadComponent: () => import('./moderation-queue/moderation-queue').then((m) => m.ModerationQueue),
      },
      {
        path: 'reportes',
        title: 'Reportes · Mbaapohara',
        loadComponent: () => import('./reports/reports-admin').then((m) => m.ReportsAdmin),
      },
      {
        path: 'solicitudes',
        title: 'Solicitudes de empresas · Mbaapohara',
        loadComponent: () => import('./company-requests/requests-admin').then((m) => m.RequestsAdmin),
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
        // Los locales pendientes son una pestaña de Empresas; se conserva la dirección anterior.
        path: 'locales',
        redirectTo: () => inject(Router).createUrlTree(['/admin/empresas'], { queryParams: { estado: 'locales' } }),
      },
      {
        path: 'cargos',
        title: 'Cargos · Mbaapohara',
        loadComponent: () => import('./jobs-admin/jobs-admin').then((m) => m.JobsAdmin),
      },
      {
        path: 'criterios',
        title: 'Criterios · Mbaapohara',
        loadComponent: () => import('./criteria-admin/criteria-admin').then((m) => m.CriteriaAdmin),
      },
    ],
  },
];

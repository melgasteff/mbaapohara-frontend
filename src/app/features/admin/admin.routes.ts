import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'empresas' },
  {
    path: 'empresas',
    title: 'Administrar empresas · Mbaapohara',
    loadComponent: () =>
      import('./companies-admin/companies-admin').then((m) => m.CompaniesAdmin),
  },
];

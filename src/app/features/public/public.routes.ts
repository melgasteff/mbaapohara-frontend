import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Mbaapohara · Tu experiencia vale',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'empresas',
    title: 'Empresas · Mbaapohara',
    loadComponent: () =>
      import('./companies-directory/companies-directory').then((m) => m.CompaniesDirectory),
  },
  {
    path: 'empresas/:id',
    title: 'Empresa · Mbaapohara',
    loadComponent: () => import('./company-profile/company-profile').then((m) => m.CompanyProfile),
  },
  {
    path: 'ingresar',
    title: 'Ingresar · Mbaapohara',
    loadComponent: () => import('./sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Mbaapohara',
    loadComponent: () => import('./sign-up/sign-up').then((m) => m.SignUp),
  },
];

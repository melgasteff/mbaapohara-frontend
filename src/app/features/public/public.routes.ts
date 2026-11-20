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
    loadComponent: () => import('./auth/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'como-moderamos',
    title: 'Cómo moderamos · Mbaapohara',
    loadComponent: () => import('./legal/how-we-moderate').then((m) => m.HowWeModerate),
  },
  {
    path: 'privacidad',
    title: 'Política de privacidad · Mbaapohara',
    loadComponent: () => import('./legal/privacy').then((m) => m.Privacy),
  },
  {
    path: 'terminos',
    title: 'Términos de uso · Mbaapohara',
    loadComponent: () => import('./legal/terms').then((m) => m.Terms),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Mbaapohara',
    loadComponent: () => import('./auth/sign-up/sign-up').then((m) => m.SignUp),
  },
];

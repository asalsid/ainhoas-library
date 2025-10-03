import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () => import('./library/library').then(m => m.Library)
  },
  {
    path: 'books',
    loadChildren: () => import('./library/library.routes').then(m => m.LIBRARY_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];
import { Routes } from '@angular/router';
import { bookResolver, placeResolver } from './core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () => import('./library/library').then(m => m.Library),
    children: [
      {
        path: '',
        redirectTo: '/library/shop',
        pathMatch: 'full'
      },
      {
        path: ':place',
        loadComponent: () => import('./library/book-list/book-list').then(m => m.BookList),
        resolve: { placeResolver }
      },
      {
        path: 'add',
        loadComponent: () => import('./library/book-detail/book-detail').then(m => m.BookDetail),
        resolve: { book: bookResolver }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./library/book-detail/book-detail').then(m => m.BookDetail),
        resolve: { book: bookResolver }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/library/shop'
  }
];
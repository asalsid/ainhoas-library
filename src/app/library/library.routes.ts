import { Routes } from '@angular/router';

export const LIBRARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./book-list/book-list').then(m => m.BookList)
  },
  {
    path: 'add',
    loadComponent: () => import('./book-detail/book-detail').then(m => m.BookDetail)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./book-detail/book-detail').then(m => m.BookDetail)
  }
];
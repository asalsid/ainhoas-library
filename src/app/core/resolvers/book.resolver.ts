import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { BookManagerService } from '../services/book-manager.service';
import { IBook } from '../interfaces/book.interface';

export const bookResolver: ResolveFn<IBook | null> = (route: ActivatedRouteSnapshot) => {
  const bookManager = inject(BookManagerService);
  const id = route.paramMap.get('id');
  
  if (id && id !== 'new') {
    const bookId = parseInt(id);
    return bookManager.getBook(bookId) || null;
  }
  
  return null;
};
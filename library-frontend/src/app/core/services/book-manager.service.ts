import { Injectable, inject, signal, computed } from '@angular/core';
import { IBook, IBookService } from '../interfaces/book.interface';
import { InMemoryBookService } from './inmemory-book.service';
import { HttpBookService } from './http-book.service';

@Injectable()
export class BookManagerService implements IBookService {
  private inMemoryService = inject(InMemoryBookService);
  private httpService = inject(HttpBookService);
  
  private serviceType = signal<'memory' | 'http'>('http');
  
  private currentService = computed(() => 
    this.serviceType() === 'memory' ? this.inMemoryService : this.httpService
  );

  loadBooks() {
    return this.currentService().loadBooks();
  }

  addBook(book: IBook) {
    return this.currentService().addBook(book);
  }

  updateBook(book: IBook) {
    return this.currentService().updateBook(book);
  }

  removeBook(id: number) {
    return this.currentService().removeBook(id);
  }

  getBook(id: number) {
    return this.currentService().getBook(id);
  }

  getBooks() {
    return this.currentService().getBooks();
  }

  getResultMessage() {
    return this.currentService().getResultMessage();
  }

  setServiceType(type: 'memory' | 'http') {
    this.serviceType.set(type);
  }

  getCurrentServiceType() {
    return this.serviceType.asReadonly();
  }
}

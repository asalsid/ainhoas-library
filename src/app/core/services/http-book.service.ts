import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBook, IBookService } from '../interfaces/book.interface';

@Injectable()
export class HttpBookService implements IBookService {
  private readonly apiUrl = 'http://localhost:5000';
  private http = inject(HttpClient);
  private books = signal<IBook[]>([]);
  private resultMessage = signal<{ type: string; msg: string }>({ type: '', msg: '' });
  private eventSource: EventSource | null = null;

  constructor() {
    this.eventSource = new EventSource(`${this.apiUrl}/books/events`);
    this.eventSource.onopen = () => {
      this.loadBooks();
    };
    this.eventSource.onmessage = (event) => {
      const books = JSON.parse(event.data);
      const currentBooks = this.books();
      
      if (JSON.stringify(currentBooks) !== JSON.stringify(books)) {
        this.books.set(books);
        if (currentBooks.length > 0) {
          this.resultMessage.set({ type: 'success', msg: 'Library data updated with HTTP' });
        }
      }
    };
    
    this.eventSource.onerror = () => {
      this.resultMessage.set({ type: 'error', msg: 'Real-time connection error' });
    };
  }

  loadBooks() {
    this.http.get<IBook[]>(`${this.apiUrl}/books`).subscribe({
      next: () => {
        this.resultMessage.set({ type: 'success', msg: 'Books loaded successfully with HTTP' });
      },
      error: (error) => {
        this.resultMessage.set({ type: 'error', msg: `Failed to load books: ${error.status} - ${error.message}` });
      }
    }); 
  }

  addBook(book: IBook) {
    this.http.post<IBook>(`${this.apiUrl}/books`, book).subscribe({
      next: () => {
        this.resultMessage.set({ type: 'success', msg: 'Book added successfully with HTTP' });
      },
      error: () => this.resultMessage.set({ type: 'error', msg: 'Failed to add book' })
    });
  }

  updateBook(book: IBook) {
    this.http.put<IBook>(`${this.apiUrl}/books/${book.id}`, book).subscribe({
      next: () => {
        this.resultMessage.set({ type: 'success', msg: 'Book updated successfully with HTTP' });
      },
      error: () => this.resultMessage.set({ type: 'error', msg: 'Failed to update book' })
    });
  }

  removeBook(id: number) {
    this.http.delete<void>(`${this.apiUrl}/books/${id}`).subscribe({
      next: () => {
        this.resultMessage.set({ type: 'success', msg: 'Book removed successfully with HTTP' });
      },
      error: () => this.resultMessage.set({ type: 'error', msg: 'Failed to remove book' })
    });
  }

  getBook(id: number) {
    return this.books().find(book => book.id === id);
  }

  getBooks() {
    return this.books.asReadonly();
  }

  getResultMessage() {
    return this.resultMessage.asReadonly();
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
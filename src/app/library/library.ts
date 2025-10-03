import { Component, model, signal, effect, inject } from '@angular/core';
import { IBook, BookManagerService } from '../core';
import { BookList } from "./book-list/book-list";
import { BookDetail } from "./book-detail/book-detail";

@Component({
  selector: 'library',
  imports: [BookList, BookDetail],
  templateUrl: './library.html',
  styleUrl: './library.css'
})

export class Library {
  private bMService = inject(BookManagerService);
  
  books = this.bMService.getBooks();
  selectedBook = model<IBook | null>(null);
  detailsVisible = signal(false);

  constructor() {
    effect(() => {
      if (this.selectedBook() !== null) this.detailsVisible.set(true);
    });
  }

  closeDetails() {
    this.selectedBook.set(null);
    this.detailsVisible.set(false);
  }
}
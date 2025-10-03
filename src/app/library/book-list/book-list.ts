import { Component, input, model } from '@angular/core';
import { IBook } from '../../core';

@Component({
  selector: 'app-book-list',
  imports: [],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList {
  books = input<IBook[]>([]);
  selectedBook = model<IBook | null>(null);

  selectBook(book: IBook) {
    this.selectedBook.set(book);
  }
}

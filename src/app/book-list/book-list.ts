import { Component, input, signal } from '@angular/core';
import { BookDetail } from '../book-detail/book-detail';
import { Book } from '../websocket.service';

@Component({
  selector: 'app-book-list',
  imports: [BookDetail],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList {
  books = input<Book[]>([]);
  detailVisible = signal<boolean>(false);
  selectedBook = signal<Book | null>(null);

  selectBook(book: Book) {
    this.selectedBook.set(book);
    this.detailVisible.set(true);
  }

  cleanSelectedBook() {
    this.selectedBook.set(null);
    this.detailVisible.set(false);
  }
}

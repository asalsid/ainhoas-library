import { Component, effect, model, output } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Book, WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-book-detail',
  imports: [KeyValuePipe],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail {
  book = model<Book | null>(null);
  close = output<void>();
  isNew: boolean = false;
  displayableDetails = ['title', 'author', 'year', 'genre'];

  constructor(private wsService: WebsocketService) {
    effect(() => {
      if (this.book() === null) {
        this.isNew = true;
        this.book.set({ id: this.wsService.books.length, title: '', author: '', year: '', genre: '' });
      }
    });
  }

  onInit() {
    if (this.book() === null) {
      this.isNew = true;
      this.book.set({ id: this.wsService.books.length, title: '', author: '', year: '', genre: '' });
    }
  }

  onInputChange(key: string, value: string) {
    this.book.update(book => ({ ...book, [key]: value } as Book) );
  }

  closeDialog() {
    if (this.isNew) {
      this.wsService.addBook(this.book() as Book);
    } else {
      this.wsService.updateBook(this.book() as Book);
    }
    this.close.emit();
  }
}

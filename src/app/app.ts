import { Component, signal, effect } from '@angular/core';
import { BookList } from './book-list/book-list';
import { Book, WebsocketService } from './websocket.service';

@Component({
  selector: 'app',
  imports: [BookList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  books = signal<Book[]>([]);

  constructor(private wsService: WebsocketService) {
    effect(() => {
      this.books.set(this.wsService.books());
    });
  }
}
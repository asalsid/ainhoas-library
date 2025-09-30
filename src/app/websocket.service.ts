import { Injectable, signal } from '@angular/core';
import { Book } from '../server';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
    private ws: WebSocket;
    books = signal<Book[]>([]);

    constructor() {
        this.ws = new WebSocket('ws://localhost:3000');
        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({ type: 'getBooks' }));
        };
        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'books') {
                this.books.set(msg.data);
            } else {
                console.warn('Unknown message type:', msg.type);
            }
        };
    }

    getBook(id: number) {
        this.ws.send(JSON.stringify({ type: 'getBook', data: { id } }));
    }

    addBook(book: Book) {
        this.ws.send(JSON.stringify({ type: 'addBook', data: book }));
    }

    updateBook(book: Book) {
        this.ws.send(JSON.stringify({ type: 'updateBook', data: book }));
    }

    removeBook(id: number) {
        this.ws.send(JSON.stringify({ type: 'removeBook', data: { id } }));
    }
}
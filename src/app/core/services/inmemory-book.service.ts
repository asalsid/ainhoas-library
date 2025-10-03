import { Injectable, signal, NgZone, inject } from '@angular/core';
import { IBook, IBookService } from '../interfaces/book.interface';

@Injectable()
export class InMemoryBookService implements IBookService {
    private ws: WebSocket;
    private books = signal<IBook[]>([]);
    private resultMessage = signal<{ type: string; msg: string }>({ type: '', msg: '' });
    private ngZone = inject(NgZone);

    constructor() {
        this.ws = new WebSocket('ws://localhost:3000');
        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({ type: 'getBooks' }));
        };
        this.ws.onmessage = (event) => {
            this.ngZone.run(() => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'books') {
                    if (this.books().length !== 0) {
                        this.resultMessage.set({ type: 'success', msg: 'The library has been updated.' });
                    }
                    this.books.set([...msg.data]);
                } else if (msg.type === 'error') {
                    this.resultMessage.set({ type: 'error', msg: msg.data });
                }
            });
        };
    }

    addBook(book: IBook) {
        this.ws.send(JSON.stringify({ type: 'addBook', data: book }));
    }

    updateBook(book: IBook) {
        this.ws.send(JSON.stringify({ type: 'updateBook', data: book }));
    }

    removeBook(id: number) {
        this.ws.send(JSON.stringify({ type: 'removeBook', data: { id } }));
    }

    getBooks() {
        return this.books.asReadonly();
    }

    getResultMessage() {
        return this.resultMessage.asReadonly();
    }
}
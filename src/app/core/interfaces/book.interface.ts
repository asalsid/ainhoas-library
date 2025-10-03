import { Signal } from '@angular/core';

export interface IBook {
    id: number;
    title: string;
    author: string;
    year: string;
    genre: string;
}

export interface IBookService {
    addBook(book: IBook): void;
    updateBook(book: IBook): void;
    removeBook(id: number): void;
    getBooks(): Signal<IBook[]>;
    getResultMessage(): Signal<{ type: string; msg: string }>;
}

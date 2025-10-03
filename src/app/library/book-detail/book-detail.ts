import { Component, computed, effect, inject, model, output } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { IBook, BookManagerService, NotificationService } from '../../core';

@Component({
  selector: 'app-book-detail',
  imports: [KeyValuePipe],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail {
  private bMService = inject(BookManagerService);
  private nService = inject(NotificationService);
  
  book = model<IBook | null>(null);
  isNew = computed(() => this.book()?.id === 0 || this.book() === null);
  resultMessage = this.bMService.getResultMessage();
  close = output<void>();
  displayableDetails = ['title', 'author', 'year', 'genre'];

  constructor() {
    effect(() => {
      if (this.book() === null) {
        this.book.set({ id: 0, title: '', author: '', year: '', genre: '' });
      }
    });
  }

  onInputChange(key: string, value: string) {
    this.book.update(book => ({ ...book, [key]: value } as IBook) );
  }

  deleteBook() {
    if (this.book()) {
      const bookTitle = this.book()!.title || 'this book';
      const confirmDelete = confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`);
      if (confirmDelete) {
        this.bMService.removeBook(this.book()!.id);
        this.nService.showResult(this.resultMessage().type, this.resultMessage().msg);
        this.close.emit();
      }
    }
  }

  saveData() {
    if (this.book() && (this.book()?.title.trim() === '' || this.book()?.author.trim() === '')) {
      this.nService.showResult('error', 'Title and Author are required fields.');
      return;
    }
    if (this.isNew()) {
      this.bMService.addBook(this.book() as IBook);
    } else {
      this.bMService.updateBook(this.book() as IBook);
    }
    this.close.emit();
  }
}

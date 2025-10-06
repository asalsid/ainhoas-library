import { Component, inject, computed, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { IBook, BookManagerService } from '../../core';

@Component({
  selector: 'app-book-list',
  imports: [],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList {
  private router = inject(Router);
  private bookManager = inject(BookManagerService);
  
  books = signal<IBook[]>([]);

  constructor() {
    effect(() => {
      const serviceType = this.bookManager.getCurrentServiceType()();
      console.log(`Service type changed to: ${serviceType}, loading books...`);
      this.bookManager.loadBooks();
    });

    effect(() => {
      this.books.set(this.bookManager.getBooks()());
    });
  }
  
  currentPage = signal(1);
  itemsPerPage = signal(5);
  
  totalPages = computed(() => 
    Math.ceil(this.books().length / this.itemsPerPage())
  );
  
  paginatedBooks = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.books().slice(startIndex, endIndex);
  });
  
  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });
  
  canGoPrevious = computed(() => this.currentPage() > 1);
  canGoNext = computed(() => this.currentPage() < this.totalPages());

  selectBook(book: IBook) {
    this.router.navigate(['/library/edit', book.id]);
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
  
  previousPage() {
    if (this.canGoPrevious()) {
      this.currentPage.update(page => page - 1);
    }
  }
  
  nextPage() {
    if (this.canGoNext()) {
      this.currentPage.update(page => page + 1);
    }
  }
  
  changeItemsPerPage(itemsPerPage: number) {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
  }
  
  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.changeItemsPerPage(+target.value);
  }

  getPaginationInfo() {
    return `Showing ${ (this.currentPage() - 1) * this.itemsPerPage() + 1 } - 
      ${ Math.min(this.currentPage() * this.itemsPerPage(), this.books().length) } 
      of ${ this.books().length } books`;
  }
}

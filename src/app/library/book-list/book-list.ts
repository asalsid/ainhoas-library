import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IBook, BookManagerService } from '../../core';

@Component({
  selector: 'app-book-list',
  imports: [],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList {
  private bMService = inject(BookManagerService);
  private router = inject(Router);
  
  books = this.bMService.getBooks();
  
  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  
  // Computed properties for pagination
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

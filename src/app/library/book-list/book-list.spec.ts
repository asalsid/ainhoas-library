import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { BookList } from './book-list';
import { BookManagerService, IBook } from '../../core';

describe('BookList', () => {
  let component: BookList;
  let fixture: ComponentFixture<BookList>;
  let mockBookManagerService: jasmine.SpyObj<BookManagerService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockBooks: IBook[] = [
    { id: 1, title: 'Book 1', author: 'Author 1', year: '2021', genre: 'Fiction' },
    { id: 2, title: 'Book 2', author: 'Author 2', year: '2022', genre: 'Science' },
    { id: 3, title: 'Book 3', author: 'Author 3', year: '2023', genre: 'Fantasy' },
    { id: 4, title: 'Book 4', author: 'Author 4', year: '2024', genre: 'Mystery' },
    { id: 5, title: 'Book 5', author: 'Author 5', year: '2025', genre: 'Romance' },
    { id: 6, title: 'Book 6', author: 'Author 6', year: '2026', genre: 'Horror' }
  ];

  beforeEach(async () => {
    const booksSignal = signal<IBook[]>(mockBooks);
    const serviceTypeSignal = signal<'memory' | 'http'>('memory');

    mockBookManagerService = jasmine.createSpyObj('BookManagerService', [
      'loadBooks',
      'getBooks',
      'getCurrentServiceType'
    ]);

    mockBookManagerService.getBooks.and.returnValue(booksSignal.asReadonly());
    mockBookManagerService.getCurrentServiceType.and.returnValue(serviceTypeSignal.asReadonly());

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        { provide: BookManagerService, useValue: mockBookManagerService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.books.set(mockBooks);
      component.itemsPerPage.set(3);
      fixture.detectChanges();
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages()).toBe(2);
    });

    it('should return correct paginated books for first page', () => {
      component.currentPage.set(1);
      const paginated = component.paginatedBooks();
      expect(paginated.length).toBe(3);
      expect(paginated[0].title).toBe('Book 1');
      expect(paginated[2].title).toBe('Book 3');
    });

    it('should return correct paginated books for second page', () => {
      component.currentPage.set(2);
      const paginated = component.paginatedBooks();
      expect(paginated.length).toBe(3);
      expect(paginated[0].title).toBe('Book 4');
      expect(paginated[2].title).toBe('Book 6');
    });

    it('should generate correct page numbers', () => {
      const pageNumbers = component.pageNumbers();
      expect(pageNumbers).toEqual([1, 2]);
    });

    it('should correctly determine if can go previous', () => {
      component.currentPage.set(1);
      expect(component.canGoPrevious()).toBeFalse();

      component.currentPage.set(2);
      expect(component.canGoPrevious()).toBeTrue();
    });

    it('should correctly determine if can go next', () => {
      component.currentPage.set(1);
      expect(component.canGoNext()).toBeTrue();

      component.currentPage.set(2);
      expect(component.canGoNext()).toBeFalse();
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
      component.books.set(mockBooks);
      component.itemsPerPage.set(3);
      fixture.detectChanges();
    });

    it('should go to specific page when valid', () => {
      component.goToPage(2);
      expect(component.currentPage()).toBe(2);
    });

    it('should not go to page when invalid (too low)', () => {
      component.currentPage.set(1);
      component.goToPage(0);
      expect(component.currentPage()).toBe(1);
    });

    it('should not go to page when invalid (too high)', () => {
      component.currentPage.set(1);
      component.goToPage(3);
      expect(component.currentPage()).toBe(1);
    });

    it('should go to previous page when possible', () => {
      component.currentPage.set(2);
      component.previousPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should not go to previous page when on first page', () => {
      component.currentPage.set(1);
      component.previousPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should go to next page when possible', () => {
      component.currentPage.set(1);
      component.nextPage();
      expect(component.currentPage()).toBe(2);
    });

    it('should not go to next page when on last page', () => {
      component.currentPage.set(2);
      component.nextPage();
      expect(component.currentPage()).toBe(2);
    });
  });

  describe('Items Per Page', () => {
    beforeEach(() => {
      component.books.set(mockBooks);
      fixture.detectChanges();
    });

    it('should change items per page and reset to first page', () => {
      component.currentPage.set(2);
      component.changeItemsPerPage(2);
      
      expect(component.itemsPerPage()).toBe(2);
      expect(component.currentPage()).toBe(1);
    });

    it('should handle onItemsPerPageChange event', () => {
      const mockEvent = {
        target: { value: '10' }
      } as unknown as Event;

      component.onItemsPerPageChange(mockEvent);
      
      expect(component.itemsPerPage()).toBe(10);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('Book Selection', () => {
    it('should navigate to edit page when book is selected', () => {
      const testBook = mockBooks[0];
      component.selectBook(testBook);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/library/edit', testBook.id]);
    });
  });

  describe('Pagination Info', () => {
    beforeEach(() => {
      component.books.set(mockBooks);
      component.itemsPerPage.set(3);
      fixture.detectChanges();
    });

    it('should return correct pagination info for first page', () => {
      component.currentPage.set(1);
      const info = component.getPaginationInfo();
      expect(info.trim()).toBe('Showing 1 - 3 of 6 books');
    });

    it('should return correct pagination info for last page', () => {
      component.currentPage.set(2);
      const info = component.getPaginationInfo();
      expect(info.trim()).toBe('Showing 4 - 6 of 6 books');
    });

    it('should handle partial last page correctly', () => {
      component.books.set(mockBooks.slice(0, 4));
      component.itemsPerPage.set(3);
      component.currentPage.set(2);
      fixture.detectChanges();
      
      const info = component.getPaginationInfo();
      expect(info.trim()).toBe('Showing 4 - 4 of 4 books');
    });
  });

  describe('Empty State', () => {
    it('should handle empty book list', () => {
      component.books.set([]);
      fixture.detectChanges();
      
      expect(component.totalPages()).toBe(0);
      expect(component.paginatedBooks()).toEqual([]);
      expect(component.pageNumbers()).toEqual([]);
      expect(component.canGoPrevious()).toBeFalse();
      expect(component.canGoNext()).toBeFalse();
    });
  });
});

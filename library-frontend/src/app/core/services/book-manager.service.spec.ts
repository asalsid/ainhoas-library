import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BookManagerService } from './book-manager.service';
import { InMemoryBookService } from './inmemory-book.service';
import { HttpBookService } from './http-book.service';
import { IBook } from '../interfaces/book.interface';

describe('BookManagerService', () => {
  let service: BookManagerService;
  let mockInMemoryService: jasmine.SpyObj<InMemoryBookService>;
  let mockHttpService: jasmine.SpyObj<HttpBookService>;

  const mockBooks: IBook[] = [
    { id: 1, title: 'Test Book', author: 'Test Author', year: '2024', genre: 'Fiction' }
  ];

  beforeEach(() => {
    const mockBooksSignal = signal(mockBooks);
    const mockResultSignal = signal({ type: 'success', msg: 'Test message' });

    mockInMemoryService = jasmine.createSpyObj('InMemoryBookService', [
      'loadBooks',
      'addBook',
      'updateBook',
      'removeBook',
      'getBook',
      'getBooks',
      'getResultMessage'
    ]);

    mockHttpService = jasmine.createSpyObj('HttpBookService', [
      'loadBooks',
      'addBook',
      'updateBook',
      'removeBook',
      'getBook',
      'getBooks',
      'getResultMessage'
    ]);

    mockInMemoryService.getBooks.and.returnValue(mockBooksSignal.asReadonly());
    mockInMemoryService.getResultMessage.and.returnValue(mockResultSignal.asReadonly());
    mockInMemoryService.getBook.and.returnValue(mockBooks[0]);

    mockHttpService.getBooks.and.returnValue(mockBooksSignal.asReadonly());
    mockHttpService.getResultMessage.and.returnValue(mockResultSignal.asReadonly());
    mockHttpService.getBook.and.returnValue(mockBooks[0]);

    TestBed.configureTestingModule({
      providers: [
        BookManagerService,
        { provide: InMemoryBookService, useValue: mockInMemoryService },
        { provide: HttpBookService, useValue: mockHttpService }
      ]
    });

    service = TestBed.inject(BookManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Service Type Management', () => {
    it('should start with http service type by default', () => {
      expect(service.getCurrentServiceType()()).toBe('http');
    });

    it('should change service type to memory', () => {
      service.setServiceType('memory');
      expect(service.getCurrentServiceType()()).toBe('memory');
    });

    it('should change service type to http', () => {
      service.setServiceType('http');
      expect(service.getCurrentServiceType()()).toBe('http');
    });
  });

  describe('Service Delegation - Memory Service', () => {
    beforeEach(() => {
      service.setServiceType('memory');
    });

    it('should delegate loadBooks to memory service', () => {
      service.loadBooks();
      expect(mockInMemoryService.loadBooks).toHaveBeenCalled();
      expect(mockHttpService.loadBooks).not.toHaveBeenCalled();
    });

    it('should delegate addBook to memory service', () => {
      const newBook = mockBooks[0];
      service.addBook(newBook);
      expect(mockInMemoryService.addBook).toHaveBeenCalledWith(newBook);
      expect(mockHttpService.addBook).not.toHaveBeenCalled();
    });

    it('should delegate updateBook to memory service', () => {
      const updatedBook = mockBooks[0];
      service.updateBook(updatedBook);
      expect(mockInMemoryService.updateBook).toHaveBeenCalledWith(updatedBook);
      expect(mockHttpService.updateBook).not.toHaveBeenCalled();
    });

    it('should delegate removeBook to memory service', () => {
      service.removeBook(1);
      expect(mockInMemoryService.removeBook).toHaveBeenCalledWith(1);
      expect(mockHttpService.removeBook).not.toHaveBeenCalled();
    });

    it('should delegate getBook to memory service', () => {
      const result = service.getBook(1);
      expect(mockInMemoryService.getBook).toHaveBeenCalledWith(1);
      expect(mockHttpService.getBook).not.toHaveBeenCalled();
      expect(result).toBe(mockBooks[0]);
    });

    it('should delegate getBooks to memory service', () => {
      const result = service.getBooks();
      expect(mockInMemoryService.getBooks).toHaveBeenCalled();
      expect(mockHttpService.getBooks).not.toHaveBeenCalled();
      expect(result()).toEqual(mockBooks);
    });

    it('should delegate getResultMessage to memory service', () => {
      const result = service.getResultMessage();
      expect(mockInMemoryService.getResultMessage).toHaveBeenCalled();
      expect(mockHttpService.getResultMessage).not.toHaveBeenCalled();
      expect(result().type).toBe('success');
    });
  });

  describe('Service Delegation - HTTP Service', () => {
    beforeEach(() => {
      service.setServiceType('http');
    });

    it('should delegate loadBooks to http service', () => {
      service.loadBooks();
      expect(mockHttpService.loadBooks).toHaveBeenCalled();
      expect(mockInMemoryService.loadBooks).not.toHaveBeenCalled();
    });

    it('should delegate addBook to http service', () => {
      const newBook = mockBooks[0];
      service.addBook(newBook);
      expect(mockHttpService.addBook).toHaveBeenCalledWith(newBook);
      expect(mockInMemoryService.addBook).not.toHaveBeenCalled();
    });

    it('should delegate updateBook to http service', () => {
      const updatedBook = mockBooks[0];
      service.updateBook(updatedBook);
      expect(mockHttpService.updateBook).toHaveBeenCalledWith(updatedBook);
      expect(mockInMemoryService.updateBook).not.toHaveBeenCalled();
    });

    it('should delegate removeBook to http service', () => {
      service.removeBook(1);
      expect(mockHttpService.removeBook).toHaveBeenCalledWith(1);
      expect(mockInMemoryService.removeBook).not.toHaveBeenCalled();
    });

    it('should delegate getBook to http service', () => {
      const result = service.getBook(1);
      expect(mockHttpService.getBook).toHaveBeenCalledWith(1);
      expect(mockInMemoryService.getBook).not.toHaveBeenCalled();
      expect(result).toBe(mockBooks[0]);
    });

    it('should delegate getBooks to http service', () => {
      const result = service.getBooks();
      expect(mockHttpService.getBooks).toHaveBeenCalled();
      expect(mockInMemoryService.getBooks).not.toHaveBeenCalled();
      expect(result()).toEqual(mockBooks);
    });

    it('should delegate getResultMessage to http service', () => {
      const result = service.getResultMessage();
      expect(mockHttpService.getResultMessage).toHaveBeenCalled();
      expect(mockInMemoryService.getResultMessage).not.toHaveBeenCalled();
      expect(result().type).toBe('success');
    });
  });

  describe('Service Switching', () => {
    it('should switch from default http to memory and back', () => {
      expect(service.getCurrentServiceType()()).toBe('http');
      
      service.setServiceType('memory');
      expect(service.getCurrentServiceType()()).toBe('memory');
      
      service.setServiceType('http');
      expect(service.getCurrentServiceType()()).toBe('http');
    });

    it('should use correct service after switching', () => {
      service.loadBooks();
      expect(mockHttpService.loadBooks).toHaveBeenCalled();
      
      service.setServiceType('memory');
      service.loadBooks();
      expect(mockInMemoryService.loadBooks).toHaveBeenCalled();
    });
  });
});
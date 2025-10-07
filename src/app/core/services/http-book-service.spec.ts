import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpBookService } from './http-book.service';
import { IBook } from '../interfaces/book.interface';

class MockEventSource {
  static instances: MockEventSource[] = [];
  
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = 0;
  url: string;
  
  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  
  close() {
    this.readyState = 2;
  }
  
  static triggerOpen() {
    MockEventSource.instances.forEach(instance => {
      instance.readyState = 1;
      if (instance.onopen) {
        instance.onopen(new Event('open'));
      }
    });
  }
  
  static triggerMessage(data: any) {
    MockEventSource.instances.forEach(instance => {
      if (instance.onmessage) {
        const event = new MessageEvent('message', { 
          data: JSON.stringify(data) 
        });
        instance.onmessage(event);
      }
    });
  }
  
  static triggerError() {
    MockEventSource.instances.forEach(instance => {
      if (instance.onerror) {
        instance.onerror(new Event('error'));
      }
    });
  }
  
  static reset() {
    MockEventSource.instances = [];
  }
}

(global as any).EventSource = MockEventSource;

describe('HttpBookService', () => {
  let service: HttpBookService;
  let httpMock: HttpTestingController;

  const mockBooks: IBook[] = [
    { id: 1, title: 'Book 1', author: 'Author 1', year: '2024', genre: 'Fiction' },
    { id: 2, title: 'Book 2', author: 'Author 2', year: '2023', genre: 'Drama' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpBookService
      ]
    });
    service = TestBed.inject(HttpBookService);
    httpMock = TestBed.inject(HttpTestingController);
    MockEventSource.reset();
  });

  afterEach(() => {
    httpMock.verify();
    MockEventSource.reset();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty books signal', () => {
      expect(service.getBooks()()).toEqual([]);
    });

    it('should initialize with empty result message', () => {
      const result = service.getResultMessage()();
      expect(result.type).toBe('');
      expect(result.msg).toBe('');
    });

    it('should setup EventSource connection', () => {
      expect(MockEventSource.instances.length).toBe(1);
      expect(MockEventSource.instances[0].url).toBe('http://localhost:5000/books/events');
    });
  });

  describe('EventSource Integration', () => {
    it('should load books when EventSource opens', () => {
      MockEventSource.triggerOpen();
      
      const req = httpMock.expectOne('http://localhost:5000/books');
      expect(req.request.method).toBe('GET');
      
      req.flush(mockBooks);
      
      const result = service.getResultMessage()();
      expect(result.type).toBe('success');
      expect(result.msg).toBe('Books loaded successfully with HTTP');
    });

    it('should handle error when loading books', () => {
      MockEventSource.triggerOpen();
      
      const req = httpMock.expectOne('http://localhost:5000/books');
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      const result = service.getResultMessage()();
      expect(result.type).toBe('error');
      expect(result.msg).toContain('Failed to load books');
    });

    it('should update books from EventSource messages', () => {
      MockEventSource.triggerMessage(mockBooks);
      
      expect(service.getBooks()()).toEqual(mockBooks);
    });

    it('should set success message when books are updated via EventSource', () => {
      MockEventSource.triggerMessage([mockBooks[0]]);
      MockEventSource.triggerMessage(mockBooks);
      
      const result = service.getResultMessage()();
      expect(result.type).toBe('success');
      expect(result.msg).toBe('Library data updated with HTTP');
    });

    it('should handle EventSource error', () => {
      MockEventSource.triggerError();
      
      const result = service.getResultMessage()();
      expect(result.type).toBe('error');
      expect(result.msg).toBe('Real-time connection error');
    });
  });

  describe('Book Operations', () => {
    describe('addBook', () => {
      it('should add a new book successfully', () => {
        const newBook: IBook = { id: 0, title: 'New Book', author: 'New Author', year: '2024', genre: 'Fiction' };
        
        service.addBook(newBook);
        
        const req = httpMock.expectOne('http://localhost:5000/books');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newBook);
        
        req.flush({});
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('success');
        expect(result.msg).toBe('Book added successfully with HTTP');
      });

      it('should handle error when adding book', () => {
        const newBook: IBook = { id: 0, title: 'New Book', author: 'New Author', year: '2024', genre: 'Fiction' };
        
        service.addBook(newBook);
        
        const req = httpMock.expectOne('http://localhost:5000/books');
        req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('error');
        expect(result.msg).toBe('Failed to add book');
      });
    });

    describe('updateBook', () => {
      it('should update a book successfully', () => {
        const updatedBook: IBook = { id: 1, title: 'Updated Book', author: 'Updated Author', year: '2024', genre: 'Fiction' };
        
        service.updateBook(updatedBook);
        
        const req = httpMock.expectOne('http://localhost:5000/books/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedBook);
        
        req.flush({});
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('success');
        expect(result.msg).toBe('Book updated successfully with HTTP');
      });

      it('should handle error when updating book', () => {
        const updatedBook: IBook = { id: 1, title: 'Updated Book', author: 'Updated Author', year: '2024', genre: 'Fiction' };
        
        service.updateBook(updatedBook);
        
        const req = httpMock.expectOne('http://localhost:5000/books/1');
        req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('error');
        expect(result.msg).toBe('Failed to update book');
      });
    });

    describe('removeBook', () => {
      it('should remove a book successfully', () => {
        service.removeBook(1);
        
        const req = httpMock.expectOne('http://localhost:5000/books/1');
        expect(req.request.method).toBe('DELETE');
        
        req.flush({});
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('success');
        expect(result.msg).toBe('Book removed successfully with HTTP');
      });

      it('should handle error when removing book', () => {
        service.removeBook(1);
        
        const req = httpMock.expectOne('http://localhost:5000/books/1');
        req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
        
        const result = service.getResultMessage()();
        expect(result.type).toBe('error');
        expect(result.msg).toBe('Failed to remove book');
      });
    });

    describe('getBook', () => {
      it('should return book by id', () => {
        MockEventSource.triggerMessage(mockBooks);
        
        const book = service.getBook(1);
        expect(book).toEqual(mockBooks[0]);
      });

      it('should return undefined for non-existent book', () => {
        MockEventSource.triggerMessage(mockBooks);
        
        const book = service.getBook(999);
        expect(book).toBeUndefined();
      });
    });
  });

  describe('Service Cleanup', () => {
    it('should close EventSource connection on destroy', () => {
      const eventSource = MockEventSource.instances[0];
      spyOn(eventSource, 'close');
      
      service.ngOnDestroy();
      
      expect(eventSource.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed EventSource messages', () => {
      const eventSource = MockEventSource.instances[0];
      
      if (eventSource.onmessage) {
        const malformedEvent = new MessageEvent('message', { 
          data: 'invalid json' 
        });
        
        expect(() => {
          if (eventSource.onmessage) {
            eventSource.onmessage(malformedEvent);
          }
        }).not.toThrow();
      }
      
      expect(service.getBooks()()).toEqual([]);
    });
  });
});
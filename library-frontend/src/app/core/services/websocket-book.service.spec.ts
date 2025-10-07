import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { WebSocketBookService } from './websocket-book.service';
import { IBook } from '../interfaces/book.interface';

class MockWebSocket {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  
  readyState: number = 0;
  
  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }
  
  send(data: string) {
    this.lastSentMessage = data;
  }
  
  close() {
    this.readyState = 3;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
  
  lastSentMessage: string = '';
  
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { 
        data: JSON.stringify(data) 
      }));
    }
  }
}

describe('WebSocketBookService', () => {
  let service: WebSocketBookService;
  let mockWebSocket: MockWebSocket;
  let ngZone: NgZone;

  const mockBooks: IBook[] = [
    { id: 1, title: 'Book 1', author: 'Author 1', year: '2021', genre: 'Fiction' },
    { id: 2, title: 'Book 2', author: 'Author 2', year: '2022', genre: 'Science' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketBookService]
    });

    ngZone = TestBed.inject(NgZone);
    
    spyOn(window, 'WebSocket').and.callFake((url: string | URL) => {
      mockWebSocket = new MockWebSocket(url.toString()) as any;
      return mockWebSocket as any;
    });

    service = TestBed.inject(WebSocketBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create WebSocket connection to correct URL', () => {
    expect(window.WebSocket).toHaveBeenCalledWith('ws://localhost:3000');
  });

  describe('WebSocket Message Handling', () => {
    beforeEach(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should update books when receiving books message', () => {
      const testBooks = mockBooks;
      
      mockWebSocket.simulateMessage({
        type: 'books',
        data: testBooks
      });

      expect(service.getBooks()()).toEqual(testBooks);
    });

    it('should set success message when books are updated and books already exist', () => {
      mockWebSocket.simulateMessage({
        type: 'books',
        data: [mockBooks[0]]
      });

      mockWebSocket.simulateMessage({
        type: 'books',
        data: mockBooks
      });

      expect(service.getResultMessage()().type).toBe('success');
      expect(service.getResultMessage()().msg).toBe('The library has been updated.');
    });

    it('should not set success message when receiving first books', () => {
      mockWebSocket.simulateMessage({
        type: 'books',
        data: mockBooks
      });

      expect(service.getResultMessage()().type).toBe('');
    });

    it('should handle error messages', () => {
      const errorMsg = 'Test error message';
      
      mockWebSocket.simulateMessage({
        type: 'error',
        data: errorMsg
      });

      expect(service.getResultMessage()().type).toBe('error');
      expect(service.getResultMessage()().msg).toBe(errorMsg);
    });
  });

  describe('Book Operations', () => {
    beforeEach(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      mockWebSocket.lastSentMessage = '';
    });

    it('should send getBooks message when loadBooks is called', () => {
      service.loadBooks();
      
      const sentMessage = JSON.parse(mockWebSocket.lastSentMessage);
      expect(sentMessage.type).toBe('getBooks');
    });

    it('should send addBook message with correct data', () => {
      const newBook = mockBooks[0];
      service.addBook(newBook);
      
      const sentMessage = JSON.parse(mockWebSocket.lastSentMessage);
      expect(sentMessage.type).toBe('addBook');
      expect(sentMessage.data).toEqual(newBook);
    });

    it('should send updateBook message with correct data', () => {
      const updatedBook = { ...mockBooks[0], title: 'Updated Title' };
      service.updateBook(updatedBook);
      
      const sentMessage = JSON.parse(mockWebSocket.lastSentMessage);
      expect(sentMessage.type).toBe('updateBook');
      expect(sentMessage.data).toEqual(updatedBook);
    });

    it('should send removeBook message with correct id', () => {
      service.removeBook(1);
      
      const sentMessage = JSON.parse(mockWebSocket.lastSentMessage);
      expect(sentMessage.type).toBe('removeBook');
      expect(sentMessage.data).toEqual({ id: 1 });
    });
  });

  describe('Book Retrieval', () => {
    beforeEach(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      
      mockWebSocket.simulateMessage({
        type: 'books',
        data: mockBooks
      });
    });

    it('should return correct book by id', () => {
      const book = service.getBook(1);
      expect(book).toEqual(mockBooks[0]);
    });

    it('should return undefined for non-existent book', () => {
      const book = service.getBook(999);
      expect(book).toBeUndefined();
    });

    it('should return readonly books signal', () => {
      const books = service.getBooks();
      expect(books()).toEqual(mockBooks);
      
      expect(() => (books as any).set([])).toThrow();
    });

    it('should return readonly result message signal', () => {
      const resultMessage = service.getResultMessage();
      expect(resultMessage()).toBeDefined();
      
      expect(() => (resultMessage as any).set({ type: 'test', msg: 'test' })).toThrow();
    });
  });

  describe('Initial Connection', () => {
    it('should call loadBooks when WebSocket connection opens', async () => {
      spyOn(service, 'loadBooks');
      
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
      
      expect(service.loadBooks).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should handle malformed JSON messages gracefully', () => {
      spyOn(console, 'error');
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(new MessageEvent('message', { 
          data: 'invalid json' 
        }));
      }
      
      expect(console.error).toHaveBeenCalledWith('Error parsing WebSocket message:', jasmine.any(Error));
    });
  });
});
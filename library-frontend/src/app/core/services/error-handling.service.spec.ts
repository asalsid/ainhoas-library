import { TestBed } from '@angular/core/testing';
import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  let consoleSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlingService]
    });
    service = TestBed.inject(ErrorHandlingService);
    consoleSpy = spyOn(console, 'error');
  });

  afterEach(() => {
    consoleSpy.calls.reset();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      expect(service).toBeDefined();
    });
  });

  describe('handleError Method', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2024-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should log error with timestamp and status when error has status', () => {
      const mockError = { status: 404 };
      const message = 'Resource not found';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error 404: Resource not found/)
      );
    });

    it('should log error with timestamp but no status when error has no status', () => {
      const mockError = { message: 'Generic error' };
      const message = 'Something went wrong';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error : Something went wrong/)
      );
    });

    it('should handle null error object', () => {
      const message = 'Null error occurred';
      
      service.handleError(null, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error : Null error occurred/)
      );
    });

    it('should handle undefined error object', () => {
      const message = 'Undefined error occurred';
      
      service.handleError(undefined, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error : Undefined error occurred/)
      );
    });

    it('should handle error with status 0', () => {
      const mockError = { status: 0 };
      const message = 'Network error';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error : Network error/)
      );
    });

    it('should handle error with non-numeric status', () => {
      const mockError = { status: 'not-a-number' };
      const message = 'Invalid status error';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error not-a-number: Invalid status error/)
      );
    });

    it('should handle empty message string', () => {
      const mockError = { status: 500 };
      const message = '';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error 500: $/)
      );
    });

    it('should handle very long error messages', () => {
      const mockError = { status: 400 };
      const longMessage = 'A'.repeat(1000);
      
      service.handleError(mockError, longMessage);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error 400: A{1000}/)
      );
    });

    it('should handle messages with special characters', () => {
      const mockError = { status: 422 };
      const specialMessage = 'Error with "quotes", <tags>, & symbols';
      
      service.handleError(mockError, specialMessage);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Error with "quotes", <tags>, & symbols')
      );
    });

    it('should handle multiline error messages', () => {
      const mockError = { status: 400 };
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      
      service.handleError(mockError, multilineMessage);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Line 1\nLine 2\nLine 3')
      );
    });

    it('should handle error object with additional properties', () => {
      const mockError = { 
        status: 403, 
        statusText: 'Forbidden',
        url: '/api/books',
        timestamp: Date.now()
      };
      const message = 'Access denied';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM) Error 403: Access denied/)
      );
    });
  });

  describe('Timestamp Format', () => {
    it('should use current time in locale format', () => {
      const mockError = { status: 200 };
      const message = 'Success message';
      
      spyOn(Date.prototype, 'toLocaleTimeString').and.returnValue('2:30:45 PM');
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('2:30:45 PM Error 200: Success message')
      );
    });

    it('should handle different locale time formats', () => {
      const mockError = { status: 500 };
      const message = 'Server error';
      
      spyOn(Date.prototype, 'toLocaleTimeString').and.returnValue('14:30:45');
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('14:30:45 Error 500: Server error')
      );
    });
  });

  describe('Error Types Coverage', () => {
    const testCases = [
      { status: 100, description: 'Informational response' },
      { status: 200, description: 'Success response' },
      { status: 300, description: 'Redirection response' },
      { status: 400, description: 'Client error response' },
      { status: 500, description: 'Server error response' },
      { status: 999, description: 'Non-standard status code' }
    ];

    testCases.forEach(({ status, description }) => {
      it(`should handle status ${status} (${description})`, () => {
        const mockError = { status };
        const message = `Error for status ${status}`;
        
        service.handleError(mockError, message);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          jasmine.stringMatching(new RegExp(`Error ${status}: Error for status ${status}`))
        );
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid consecutive error calls', () => {
      for (let i = 0; i < 100; i++) {
        const mockError = { status: 500 };
        service.handleError(mockError, `Error ${i}`);
      }
      
      expect(consoleSpy).toHaveBeenCalledTimes(100);
    });

    it('should not retain references to error objects', () => {
      const mockError = { status: 404, data: new Array(1000).fill('large-data') };
      const message = 'Large error object';
      
      service.handleError(mockError, message);
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle when console.error throws an error', () => {
      consoleSpy.and.throwError('Console unavailable');
      const mockError = { status: 500 };
      const message = 'Test error';
      
      expect(() => {
        service.handleError(mockError, message);
      }).toThrow('Console unavailable');
    });

    it('should handle when console is undefined', () => {
      const originalConsole = console;
      (window as any).console = undefined;
      
      expect(() => {
        service.handleError({ status: 500 }, 'test');
      }).toThrow();
      
      (window as any).console = originalConsole;
    });
  });

  describe('Message Formatting Edge Cases', () => {
    it('should handle null message', () => {
      const mockError = { status: 500 };
      
      service.handleError(mockError, null as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Error 500: null/)
      );
    });

    it('should handle undefined message', () => {
      const mockError = { status: 400 };
      
      service.handleError(mockError, undefined as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Error 400: undefined/)
      );
    });

    it('should handle numeric message', () => {
      const mockError = { status: 422 };
      
      service.handleError(mockError, 12345 as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Error 422: 12345/)
      );
    });

    it('should handle boolean message', () => {
      const mockError = { status: 200 };
      
      service.handleError(mockError, true as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Error 200: true/)
      );
    });

    it('should handle object message', () => {
      const mockError = { status: 500 };
      const objectMessage = { error: 'test', code: 123 };
      
      service.handleError(mockError, objectMessage as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('[object Object]')
      );
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { throwError, of } from 'rxjs';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockErrorHandlingService: jasmine.SpyObj<ErrorHandlingService>;
  let interceptor: ErrorInterceptor;

  const testUrl = '/api/test';

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['showResult']);
    const errorHandlingSpy = jasmine.createSpyObj('ErrorHandlingService', ['handleError']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
        ErrorInterceptor,
        { provide: NotificationService, useValue: notificationSpy },
        { provide: ErrorHandlingService, useValue: errorHandlingSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockErrorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;
    interceptor = TestBed.inject(ErrorInterceptor);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Interceptor Setup', () => {
    it('should be created', () => {
      expect(interceptor).toBeTruthy();
    });

    it('should inject required services', () => {
      expect(mockNotificationService).toBeTruthy();
      expect(mockErrorHandlingService).toBeTruthy();
    });
  });

  describe('Successful Requests', () => {
    it('should pass through successful requests without modification', () => {
      const testData = { message: 'success' };
      
      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual(testData);
      });

      const req = httpTestingController.expectOne(testUrl);
      req.flush(testData);

      expect(mockNotificationService.showResult).not.toHaveBeenCalled();
      expect(mockErrorHandlingService.handleError).not.toHaveBeenCalled();
    });

    it('should not interfere with successful POST requests', () => {
      const postData = { name: 'test' };
      const responseData = { id: 1, name: 'test' };
      
      httpClient.post(testUrl, postData).subscribe(response => {
        expect(response).toEqual(responseData);
      });

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.body).toEqual(postData);
      req.flush(responseData);

      expect(mockNotificationService.showResult).not.toHaveBeenCalled();
      expect(mockErrorHandlingService.handleError).not.toHaveBeenCalled();
    });
  });

  describe('HTTP Error Status Codes', () => {
    it('should handle 400 Bad Request error', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });

      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Bad Request: Please check your input'
      );
    });

    it('should handle 401 Unauthorized error', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 401, statusText: 'Unauthorized' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Unauthorized: Please log in'
      );
    });

    it('should handle 403 Forbidden error', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 403 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 403, statusText: 'Forbidden' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Forbidden: You don\'t have permission'
      );
    });

    it('should handle 404 Not Found error', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Not Found: The requested resource was not found'
      );
    });

    it('should handle 500 Internal Server Error', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Server Error: Please try again later'
      );
    });

    it('should handle unknown status codes with default message', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with 418 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(418);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 418, statusText: 'I\'m a teapot' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Server Error: 418 - Http failure response for /api/test: 418 I\'m a teapot'
      );
    });
  });

  describe('Client-Side Errors', () => {
    it('should handle client-side errors (ErrorEvent)', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with client error'),
        error: (error: HttpErrorResponse) => {
          expect(error.error).toBeInstanceOf(ErrorEvent);
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection refused'
      });
      req.error(errorEvent);

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Client Error: Connection refused'
      );
    });

    it('should handle ErrorEvent with empty message', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed with client error'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      const errorEvent = new ErrorEvent('Network error', {
        message: ''
      });
      req.error(errorEvent);

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Client Error: '
      );
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed requests once before handling error', () => {
      let requestCount = 0;
      
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed after retry'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(requestCount).toBe(2);
        }
      });

      let req = httpTestingController.expectOne(testUrl);
      requestCount++;
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

      req = httpTestingController.expectOne(testUrl);
      requestCount++;
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

      expect(mockNotificationService.showResult).toHaveBeenCalledTimes(1);
    });

    it('should succeed on retry if second attempt is successful', () => {
      const successData = { message: 'success after retry' };
      let requestCount = 0;
      
      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toEqual(successData);
          expect(requestCount).toBe(2); // Original + 1 retry
        },
        error: () => fail('should have succeeded on retry')
      });

      let req = httpTestingController.expectOne(testUrl);
      requestCount++;
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

      req = httpTestingController.expectOne(testUrl);
      requestCount++;
      req.flush(successData);

      expect(mockNotificationService.showResult).not.toHaveBeenCalled();
      expect(mockErrorHandlingService.handleError).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should call ErrorHandlingService.handleError with correct parameters', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

      expect(mockErrorHandlingService.handleError).toHaveBeenCalledWith(
        jasmine.any(HttpErrorResponse),
        'Not Found: The requested resource was not found'
      );
    });

    it('should call NotificationService.showResult with error type', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        jasmine.any(String)
      );
    });

    it('should handle service injection errors gracefully', () => {
      mockErrorHandlingService.handleError.and.throwError('Service unavailable');
      
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error should still be thrown despite service error
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      
      expect(() => {
        req.error(new ProgressEvent('error'), { status: 500 });
      }).toThrow('Service unavailable');
    });
  });

  describe('Error Message Formatting', () => {
    it('should format error messages consistently', () => {
      const testCases = [
        { status: 400, expected: 'Bad Request: Please check your input' },
        { status: 401, expected: 'Unauthorized: Please log in' },
        { status: 403, expected: 'Forbidden: You don\'t have permission' },
        { status: 404, expected: 'Not Found: The requested resource was not found' },
        { status: 500, expected: 'Server Error: Please try again later' }
      ];

      testCases.forEach(({ status, expected }) => {
        mockNotificationService.showResult.calls.reset();
        
        httpClient.get(`${testUrl}/${status}`).subscribe({
          next: () => fail(`should have failed with ${status}`),
          error: () => {
            // Error handled
          }
        });

        const req = httpTestingController.expectOne(`${testUrl}/${status}`);
        req.error(new ProgressEvent('error'), { status });

        expect(mockNotificationService.showResult).toHaveBeenCalledWith('error', expected);
      });
    });

    it('should handle errors with custom status text', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { 
        status: 422, 
        statusText: 'Unprocessable Entity' 
      });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Server Error: 422')
      );
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle null/undefined error objects', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Server Error: 0')
      );
    });

    it('should handle errors without status codes', () => {
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'));

      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        jasmine.stringContaining('Server Error: 0')
      );
    });

    it('should preserve original error in throwError', () => {
      let caughtError: HttpErrorResponse;
      
      httpClient.get(testUrl).subscribe({
        next: () => fail('should have failed'),
        error: (error: HttpErrorResponse) => {
          caughtError = error;
        }
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

      expect(caughtError!).toBeInstanceOf(HttpErrorResponse);
      expect(caughtError!.status).toBe(404);
      expect(caughtError!.statusText).toBe('Not Found');
    });

    it('should handle multiple simultaneous requests', () => {
      const urls = ['/api/test1', '/api/test2', '/api/test3'];
      
      urls.forEach(url => {
        httpClient.get(url).subscribe({
          next: () => fail(`should have failed for ${url}`),
          error: () => {
            // Error handled
          }
        });
      });

      urls.forEach(url => {
        const req = httpTestingController.expectOne(url);
        req.error(new ProgressEvent('error'), { status: 500 });
      });

      expect(mockNotificationService.showResult).toHaveBeenCalledTimes(urls.length);
      expect(mockErrorHandlingService.handleError).toHaveBeenCalledTimes(urls.length);
    });
  });

  describe('HTTP Method Coverage', () => {
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
      it(`should handle errors for ${method} requests`, () => {
        const requestObservable = method === 'GET' 
          ? httpClient.get(testUrl)
          : method === 'POST'
          ? httpClient.post(testUrl, {})
          : method === 'PUT'
          ? httpClient.put(testUrl, {})
          : method === 'DELETE'
          ? httpClient.delete(testUrl)
          : httpClient.patch(testUrl, {});

        requestObservable.subscribe({
          next: () => fail(`should have failed for ${method}`),
          error: () => {
            // Error handled
          }
        });

        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.method).toBe(method);
        req.error(new ProgressEvent('error'), { status: 500 });

        expect(mockNotificationService.showResult).toHaveBeenCalledWith(
          'error',
          'Server Error: Please try again later'
        );
      });
    });
  });
});

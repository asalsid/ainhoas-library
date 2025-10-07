import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { bookResolver } from './book.resolver';
import { BookManagerService } from '../services/book-manager.service';
import { IBook } from '../interfaces/book.interface';

describe('bookResolver', () => {
  let mockBookManagerService: jasmine.SpyObj<BookManagerService>;
  let mockRoute: jasmine.SpyObj<ActivatedRouteSnapshot>;
  let mockParamMap: jasmine.SpyObj<ParamMap>;

  const mockBook: IBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    year: '2024',
    genre: 'Fiction'
  };

  beforeEach(() => {
    const bookManagerSpy = jasmine.createSpyObj('BookManagerService', ['getBook']);
    const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    const routeSpy = jasmine.createSpyObj('ActivatedRouteSnapshot', [], {
      paramMap: paramMapSpy
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: BookManagerService, useValue: bookManagerSpy }
      ]
    });

    mockBookManagerService = TestBed.inject(BookManagerService) as jasmine.SpyObj<BookManagerService>;
    mockParamMap = paramMapSpy;
    mockRoute = routeSpy;
  });

  describe('Resolver Function', () => {
    it('should be defined', () => {
      expect(bookResolver).toBeDefined();
      expect(typeof bookResolver).toBe('function');
    });
  });

  describe('Route Parameter Handling', () => {
    it('should return null when id parameter is null', () => {
      mockParamMap.get.and.returnValue(null);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
      expect(mockBookManagerService.getBook).not.toHaveBeenCalled();
    });

    it('should return null when id parameter is undefined', () => {
      mockParamMap.get.and.returnValue(null);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
      expect(mockBookManagerService.getBook).not.toHaveBeenCalled();
    });

    it('should return null when id parameter is empty string', () => {
      mockParamMap.get.and.returnValue('');
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
      expect(mockBookManagerService.getBook).not.toHaveBeenCalled();
    });

    it('should return null when id parameter is "new"', () => {
      mockParamMap.get.and.returnValue('new');
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
      expect(mockBookManagerService.getBook).not.toHaveBeenCalled();
    });

    it('should return null when id parameter is "NEW" (case sensitive)', () => {
      mockParamMap.get.and.returnValue('NEW');
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(NaN);
      expect(result).toBeNull();
    });
  });

  describe('Book Retrieval', () => {
    it('should retrieve book when valid numeric id is provided', () => {
      mockParamMap.get.and.returnValue('1');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should retrieve book when valid numeric id with leading zeros is provided', () => {
      mockParamMap.get.and.returnValue('001');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should return null when book is not found', () => {
      mockParamMap.get.and.returnValue('999');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should return null when book service returns null', () => {
      mockParamMap.get.and.returnValue('1');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockParamMap.get).toHaveBeenCalledWith('id');
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });
  });

  describe('ID Parsing Edge Cases', () => {
    it('should handle negative numbers', () => {
      mockParamMap.get.and.returnValue('-1');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(-1);
      expect(result).toBeNull();
    });

    it('should handle decimal numbers (truncated to integer)', () => {
      mockParamMap.get.and.returnValue('1.5');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should handle very large numbers', () => {
      mockParamMap.get.and.returnValue('999999999');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(999999999);
      expect(result).toBeNull();
    });

    it('should handle zero as valid id', () => {
      mockParamMap.get.and.returnValue('0');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockBook);
    });

    it('should handle non-numeric strings (results in NaN)', () => {
      mockParamMap.get.and.returnValue('abc');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(NaN);
      expect(result).toBeNull();
    });

    it('should handle mixed alphanumeric strings', () => {
      mockParamMap.get.and.returnValue('1abc');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it('should handle strings with special characters', () => {
      mockParamMap.get.and.returnValue('1@#$');
      mockBookManagerService.getBook.and.returnValue(undefined);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it('should handle whitespace in id', () => {
      mockParamMap.get.and.returnValue(' 1 ');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });
  });

  describe('Service Integration', () => {
    it('should call BookManagerService.getBook exactly once for valid id', () => {
      mockParamMap.get.and.returnValue('5');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledTimes(1);
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(5);
    });

    it('should handle BookManagerService throwing an error', () => {
      mockParamMap.get.and.returnValue('1');
      mockBookManagerService.getBook.and.throwError('Service error');
      
      expect(() => {
        TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      }).toThrow('Service error');
    });

    it('should handle BookManagerService returning falsy values', () => {
      const falsyValues = [null, undefined, false, 0, '', NaN];
      
      falsyValues.forEach((falsyValue, index) => {
        mockParamMap.get.and.returnValue(`${index + 1}`);
        mockBookManagerService.getBook.and.returnValue(falsyValue as any);
        
        const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Return Value Validation', () => {
    it('should return exact book object when found', () => {
      const complexBook: IBook = {
        id: 123,
        title: 'Complex Book Title with Unicode: 📚',
        author: 'Author with Special Chars: àáâãäå',
        year: '2024',
        genre: 'Science Fiction & Fantasy'
      };
      
      mockParamMap.get.and.returnValue('123');
      mockBookManagerService.getBook.and.returnValue(complexBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(result).toBe(complexBook);
      expect(result).toEqual(complexBook);
    });

    it('should return null for all invalid scenarios', () => {
      const invalidCases = [
        { id: null, description: 'null id' },
        { id: '', description: 'empty string id' },
        { id: 'new', description: 'new keyword' }
      ];
      
      invalidCases.forEach(({ id, description }) => {
        mockParamMap.get.and.returnValue(id);
        
        const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
        
        expect(result).toBeNull(`Expected null for ${description}`);
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should not call getBook multiple times for same resolution', () => {
      mockParamMap.get.and.returnValue('1');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result1 = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      const result2 = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid consecutive calls', () => {
      mockParamMap.get.and.returnValue('1');
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      for (let i = 0; i < 100; i++) {
        TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      }
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledTimes(100);
    });
  });

  describe('Route Snapshot Integration', () => {
    it('should work with real ActivatedRouteSnapshot structure', () => {
      const realParamMap = new Map([['id', '42']]);
      const realRoute = {
        paramMap: {
          get: (key: string) => realParamMap.get(key) || null
        }
      } as ActivatedRouteSnapshot;
      
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(realRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(42);
      expect(result).toEqual(mockBook);
    });

    it('should handle paramMap.get returning different types', () => {
      mockParamMap.get.and.returnValue(123 as any);
      mockBookManagerService.getBook.and.returnValue(mockBook);
      
      const result = TestBed.runInInjectionContext(() => bookResolver(mockRoute, {} as any));
      
      expect(mockBookManagerService.getBook).toHaveBeenCalledWith(123);
      expect(result).toEqual(mockBook);
    });
  });
});
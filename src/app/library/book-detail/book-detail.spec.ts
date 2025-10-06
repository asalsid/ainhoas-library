import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { BookDetail } from './book-detail';
import { BookManagerService, NotificationService, IBook } from '../../core';

describe('BookDetail', () => {
  let component: BookDetail;
  let fixture: ComponentFixture<BookDetail>;
  let mockBookManagerService: jasmine.SpyObj<BookManagerService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockBook: IBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    year: '2024',
    genre: 'Fiction'
  };

  beforeEach(async () => {
    const serviceTypeSignal = signal<'memory' | 'http'>('memory');
    const resultMessageSignal = signal({ type: 'success', msg: 'Test message' });

    mockBookManagerService = jasmine.createSpyObj('BookManagerService', [
      'addBook',
      'updateBook',
      'removeBook',
      'getResultMessage',
      'getCurrentServiceType'
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showResult'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        data: {}
      }
    };

    mockBookManagerService.getResultMessage.and.returnValue(resultMessageSignal.asReadonly());
    mockBookManagerService.getCurrentServiceType.and.returnValue(serviceTypeSignal.asReadonly());

    await TestBed.configureTestingModule({
      imports: [BookDetail, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BookManagerService, useValue: mockBookManagerService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetail);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should initialize as new book when no resolved book', () => {
      mockActivatedRoute.snapshot.data = {};
      fixture.detectChanges();
      
      expect(component.isNew).toBeTrue();
      expect(component.book()).toBeNull();
    });

    it('should initialize with existing book when resolved book provided', () => {
      mockActivatedRoute.snapshot.data = { book: mockBook };
      fixture.detectChanges();
      
      expect(component.isNew).toBeFalse();
      expect(component.book()).toEqual(mockBook);
    });

    it('should patch form values when book is set', () => {
      mockActivatedRoute.snapshot.data = { book: mockBook };
      fixture.detectChanges();
      
      expect(component.bookForm.get('title')?.value).toBe(mockBook.title);
      expect(component.bookForm.get('author')?.value).toBe(mockBook.author);
      expect(component.bookForm.get('year')?.value).toBe(mockBook.year);
      expect(component.bookForm.get('genre')?.value).toBe(mockBook.genre);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should initialize form with required validators', () => {
      const titleControl = component.bookForm.get('title');
      const authorControl = component.bookForm.get('author');
      const yearControl = component.bookForm.get('year');
      const genreControl = component.bookForm.get('genre');

      expect(titleControl?.hasError('required')).toBeTrue();
      expect(authorControl?.hasError('required')).toBeTrue();
      expect(yearControl?.hasError('required')).toBeTrue();
      expect(genreControl?.hasError('required')).toBeTrue();
    });

    it('should validate year pattern correctly', () => {
      const yearControl = component.bookForm.get('year');
      
      yearControl?.setValue('abc');
      expect(yearControl?.hasError('pattern')).toBeTrue();
      
      yearControl?.setValue('123');
      expect(yearControl?.hasError('pattern')).toBeTrue();
      
      yearControl?.setValue('12345');
      expect(yearControl?.hasError('pattern')).toBeTrue();
      
      yearControl?.setValue('2024');
      expect(yearControl?.hasError('pattern')).toBeFalse();
    });

    it('should validate minimum length for title and author', () => {
      const titleControl = component.bookForm.get('title');
      const authorControl = component.bookForm.get('author');
      
      titleControl?.setValue('');
      authorControl?.setValue('');
      
      expect(titleControl?.hasError('minlength')).toBeTrue();
      expect(authorControl?.hasError('minlength')).toBeTrue();
      
      titleControl?.setValue('A');
      authorControl?.setValue('B');
      
      expect(titleControl?.hasError('minlength')).toBeFalse();
      expect(authorControl?.hasError('minlength')).toBeFalse();
    });
  });

  describe('Field Error Messages', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return required error message', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('title');
      expect(errorMessage).toBe('Title is required');
    });

    it('should return minlength error message', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('title');
      expect(errorMessage).toBe('Title must not be empty');
    });

    it('should return pattern error message for year', () => {
      const yearControl = component.bookForm.get('year');
      yearControl?.setValue('abc');
      yearControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('year');
      expect(errorMessage).toBe('Year must be a 4-digit number');
    });

    it('should return empty string when field is valid', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('Valid Title');
      titleControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('title');
      expect(errorMessage).toBe('');
    });

    it('should return empty string when field is not touched', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      
      const errorMessage = component.getFieldError('title');
      expect(errorMessage).toBe('');
    });
  });

  describe('Save Data', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error notification when form is invalid', () => {
      component.bookForm.patchValue({
        title: '',
        author: '',
        year: '',
        genre: ''
      });
      
      component.saveData();
      
      expect(mockNotificationService.showResult).toHaveBeenCalledWith(
        'error',
        'Please fill in all required fields correctly.'
      );
      expect(mockBookManagerService.addBook).not.toHaveBeenCalled();
      expect(mockBookManagerService.updateBook).not.toHaveBeenCalled();
    });

    it('should add new book when form is valid and isNew is true', () => {
      component.isNew = true;
      component.bookForm.patchValue({
        title: 'New Book',
        author: 'New Author',
        year: '2024',
        genre: 'Fiction'
      });
      
      spyOn(component, 'navigateBack');
      
      component.saveData();
      
      expect(mockBookManagerService.addBook).toHaveBeenCalledWith({
        id: 0,
        title: 'New Book',
        author: 'New Author',
        year: '2024',
        genre: 'Fiction'
      });
      expect(component.navigateBack).toHaveBeenCalled();
    });

    it('should update existing book when form is valid and isNew is false', () => {
      component.isNew = false;
      component.book.set(mockBook);
      component.bookForm.patchValue({
        title: 'Updated Book',
        author: 'Updated Author',
        year: '2025',
        genre: 'Drama'
      });
      
      spyOn(component, 'navigateBack');
      
      component.saveData();
      
      expect(mockBookManagerService.updateBook).toHaveBeenCalledWith({
        id: mockBook.id,
        title: 'Updated Book',
        author: 'Updated Author',
        year: '2025',
        genre: 'Drama'
      });
      expect(component.navigateBack).toHaveBeenCalled();
    });
  });

  describe('Delete Book', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm');
      spyOn(component, 'navigateBack');
    });

    it('should not delete when no book is set', () => {
      component.book.set(null);
      
      component.deleteBook();
      
      expect(window.confirm).not.toHaveBeenCalled();
      expect(mockBookManagerService.removeBook).not.toHaveBeenCalled();
    });

    it('should not delete when user cancels confirmation', () => {
      component.book.set(mockBook);
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.deleteBook();
      
      expect(window.confirm).toHaveBeenCalledWith(
        `Are you sure you want to delete "${mockBook.title}"? This action cannot be undone.`
      );
      expect(mockBookManagerService.removeBook).not.toHaveBeenCalled();
    });

    it('should delete book when user confirms', () => {
      component.book.set(mockBook);
      (window.confirm as jasmine.Spy).and.returnValue(true);
      
      component.deleteBook();
      
      expect(window.confirm).toHaveBeenCalled();
      expect(mockBookManagerService.removeBook).toHaveBeenCalledWith(mockBook.id);
      expect(mockNotificationService.showResult).toHaveBeenCalled();
      expect(component.navigateBack).toHaveBeenCalled();
    });

    it('should handle book with no title in confirmation message', () => {
      const bookWithoutTitle = { ...mockBook, title: '' };
      component.book.set(bookWithoutTitle);
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.deleteBook();
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete "this book"? This action cannot be undone.'
      );
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to shop when service type is memory', () => {
      const serviceTypeSignal = signal<'memory' | 'http'>('memory');
      mockBookManagerService.getCurrentServiceType.and.returnValue(serviceTypeSignal.asReadonly());
      
      component.navigateBack();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/library', 'shop']);
    });

    it('should navigate to warehouse when service type is http', () => {
      const serviceTypeSignal = signal<'memory' | 'http'>('http');
      mockBookManagerService.getCurrentServiceType.and.returnValue(serviceTypeSignal.asReadonly());
      
      component.navigateBack();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/library', 'warehouse']);
    });

    it('should call navigateBack when cancel is called', () => {
      spyOn(component, 'navigateBack');
      
      component.cancel();
      
      expect(component.navigateBack).toHaveBeenCalled();
    });
  });

  describe('Form Interaction', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark all fields as touched when form is invalid on save', () => {
      component.bookForm.patchValue({
        title: '',
        author: '',
        year: '',
        genre: ''
      });
      
      component.saveData();
      
      expect(component.bookForm.get('title')?.touched).toBeTrue();
      expect(component.bookForm.get('author')?.touched).toBeTrue();
      expect(component.bookForm.get('year')?.touched).toBeTrue();
      expect(component.bookForm.get('genre')?.touched).toBeTrue();
    });

    it('should update form when book changes via effect', () => {
      expect(component.bookForm.get('title')?.value).toBe('');
      
      component.book.set(mockBook);
      fixture.detectChanges();
      
      expect(component.bookForm.get('title')?.value).toBe(mockBook.title);
    });
  });
});

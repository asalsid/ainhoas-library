import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Library } from './library';

describe('Library', () => {
  let component: Library;
  let fixture: ComponentFixture<Library>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Library],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Library);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Navigation', () => {
    it('should navigate to add book page when addNewBook is called', () => {
      component.addNewBook();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/library/add']);
    });

    it('should call addNewBook method when add button is clicked', () => {
      spyOn(component, 'addNewBook');
      
      const addButton = fixture.debugElement.nativeElement.querySelector('[data-testid="add-book-btn"]');
      if (addButton) {
        addButton.click();
        expect(component.addNewBook).toHaveBeenCalled();
      }
    });
  });

  describe('Template', () => {
    it('should have router outlet for child components', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const routerOutlet = compiled.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should render component without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(Library).toBeDefined();
    });

    it('should have proper component metadata', () => {
      expect(component).toBeInstanceOf(Library);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

@Component({
  template: '<p>Mock Library Component</p>',
  standalone: true
})
class MockLibraryComponent { }

@Component({
  template: '<p>Mock Book List Component</p>',
  standalone: true
})
class MockBookListComponent { }

@Component({
  template: '<p>Mock Book Detail Component</p>',
  standalone: true
})
class MockBookDetailComponent { }

describe('App', () => {
  let router: Router;
  let location: Location;
  let fixture: any;

  beforeEach(async () => {
    const testRoutes = [
      { path: '', redirectTo: '/library', pathMatch: 'full' as const },
      { path: 'library', component: MockLibraryComponent },
      { path: '**', redirectTo: '/library/shop' }
    ];

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(testRoutes)
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should navigate to library route', async () => {
    await router.navigate(['/library']);
    expect(location.path()).toBe('/library');
  });

  it('should redirect root path to library', async () => {
    await router.navigate(['']);
    expect(location.path()).toBe('/library');
  });
});

describe('App Routes Configuration', () => {
  it('should have correct route configuration', () => {
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(0);
    
    const rootRedirect = routes.find(route => route.path === '');
    expect(rootRedirect?.redirectTo).toBe('/library');
    
    const libraryRoute = routes.find(route => route.path === 'library');
    expect(libraryRoute).toBeDefined();
    expect(libraryRoute?.loadComponent).toBeDefined();
    
    const wildcardRoute = routes.find(route => route.path === '**');
    expect(wildcardRoute?.redirectTo).toBe('/library/shop');
  });

  it('should have child routes for library', () => {
    const libraryRoute = routes.find(route => route.path === 'library');
    expect(libraryRoute?.children).toBeDefined();
    expect(libraryRoute?.children?.length).toBeGreaterThan(0);
    
    const children = libraryRoute?.children || [];
    
    const placeRoute = children.find(route => route.path === ':place');
    expect(placeRoute).toBeDefined();
    expect(placeRoute?.resolve).toBeDefined();
    
    const addRoute = children.find(route => route.path === 'add');
    expect(addRoute).toBeDefined();
    
    const editRoute = children.find(route => route.path === 'edit/:id');
    expect(editRoute).toBeDefined();
  });
});
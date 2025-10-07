import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { placeResolver } from './place.resolver';
import { BookManagerService } from '../services/book-manager.service';

describe('placeResolver', () => {
  let mockBookManagerService: jasmine.SpyObj<BookManagerService>;
  let mockRoute: Partial<ActivatedRouteSnapshot>;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockBookManagerService = jasmine.createSpyObj('BookManagerService', [
      'setServiceType'
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: BookManagerService, useValue: mockBookManagerService }
      ]
    });

    mockRoute = {
      paramMap: {
        get: jasmine.createSpy('get')
      } as any,
      params: {}
    };

    mockState = {} as RouterStateSnapshot;
  });

  it('should set memory service type for shop place', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue('shop');
    
    const result = placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockBookManagerService.setServiceType).toHaveBeenCalledWith('memory');
    expect(result).toBeUndefined();
  });

  it('should set http service type for warehouse place', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue('warehouse');
    
    const result = placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockBookManagerService.setServiceType).toHaveBeenCalledWith('http');
    expect(result).toBeUndefined();
  });

  it('should default to memory service for unknown place', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue('unknown');
    
    const result = placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockBookManagerService.setServiceType).toHaveBeenCalledWith('memory');
    expect(result).toBeUndefined();
  });

  it('should not set service type when no place parameter', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue(null);
    
    const result = placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockBookManagerService.setServiceType).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should not set service type when place parameter is empty string', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue('');
    
    const result = placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockBookManagerService.setServiceType).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  describe('Service Type Mapping', () => {
    const testCases = [
      { place: 'shop', expectedServiceType: 'memory' as const },
      { place: 'warehouse', expectedServiceType: 'http' as const },
      { place: 'store', expectedServiceType: 'memory' as const },
      { place: 'inventory', expectedServiceType: 'memory' as const }
    ];

    testCases.forEach(({ place, expectedServiceType }) => {
      it(`should set service type to ${expectedServiceType} for place ${place}`, () => {
        (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue(place);
        
        placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
        
        expect(mockBookManagerService.setServiceType).toHaveBeenCalledWith(expectedServiceType);
      });
    });
  });

  it('should call paramMap.get with "place" parameter', () => {
    (mockRoute.paramMap!.get as jasmine.Spy).and.returnValue('shop');
    
    placeResolver(mockRoute as ActivatedRouteSnapshot, mockState);
    
    expect(mockRoute.paramMap!.get).toHaveBeenCalledWith('place');
  });
});
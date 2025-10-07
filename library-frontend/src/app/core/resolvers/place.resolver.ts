import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { BookManagerService } from '../services/book-manager.service';

export const placeResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const bookManager = inject(BookManagerService);
  const place = route.paramMap.get('place');
  
  if (place) {
    let serviceType: 'memory' | 'http';

    switch (place) {
      case 'shop':
        serviceType = 'memory';
        break;
      case 'warehouse':
        serviceType = 'http';
        break;
      default:
        serviceType = 'memory';
    }

    bookManager.setServiceType(serviceType);
  }
};
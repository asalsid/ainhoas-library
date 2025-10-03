import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  showResult(type: string, msg: string): void {
    alert(`${type.toUpperCase()}: ${msg}`);
  }
}
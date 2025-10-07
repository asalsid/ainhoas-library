import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
  handleError(error: any, msg: string): void {
    console.error(`${new Date().toLocaleTimeString()} Error ${error.status || ''}: ${msg}`);
  }
}
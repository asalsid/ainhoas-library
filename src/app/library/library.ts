import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BookManagerService } from '../core';

@Component({
  selector: 'library',
  imports: [RouterOutlet],
  templateUrl: './library.html',
  styleUrl: './library.css'
})

export class Library {
  private bMService = inject(BookManagerService);
  private router = inject(Router);
  
  currentServiceType = this.bMService.getCurrentServiceType();

  switchServiceType() {
    this.bMService.switchServiceType();
  }

  addNewBook() {
    this.router.navigate(['/library/add']);
  }
}
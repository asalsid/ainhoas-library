import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'library',
  imports: [RouterOutlet],
  templateUrl: './library.html',
  styleUrl: './library.css'
})

export class Library {
  private router = inject(Router);


  addNewBook() {
    this.router.navigate(['/library/add']);
  }
}
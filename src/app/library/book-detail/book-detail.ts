import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IBook, BookManagerService, NotificationService } from '../../core';

@Component({
  selector: 'app-book-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail {
  private bookManager = inject(BookManagerService);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  isNew = false;
  book = signal<IBook | null>(null);
  resultMessage = this.bookManager.getResultMessage();

  bookForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    author: ['', [Validators.required, Validators.minLength(1)]],
    year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    genre: ['', [Validators.required]]
  });

  constructor() {
    const resolvedBook = this.route.snapshot.data['book'] as IBook | null;
    
    if (resolvedBook) {
      this.book.set(resolvedBook);
    } else {
      this.isNew = true;
    }

    effect(() => {      
      if (this.book()) {
        this.bookForm.patchValue({
          title: this.book()!.title,
          author: this.book()!.author,
          year: this.book()!.year,
          genre: this.book()!.genre
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.bookForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not be empty`;
      }
      if (field.errors?.['pattern']) {
        return 'Year must be a 4-digit number';
      }
    }
    return '';
  }

  deleteBook() {
    if (this.book()) {
      const bookTitle = this.book()!.title || 'this book';
      const confirmDelete = confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`);
      if (confirmDelete) {
        this.bookManager.removeBook(this.book()!.id);
        this.notificationService.showResult(this.resultMessage().type, this.resultMessage().msg);
        this.navigateBack();
      }
    }
  }

  saveData() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.notificationService.showResult('error', 'Please fill in all required fields correctly.');
      return;
    }

    const formValue = this.bookForm.value;
    const bookData: IBook = {
      id: this.book()?.id || 0,
      title: formValue.title,
      author: formValue.author,
      year: formValue.year,
      genre: formValue.genre
    };

    if (this.isNew) {
      this.bookManager.addBook(bookData);
    } else {
      this.bookManager.updateBook(bookData);
    }
    this.navigateBack();
  }

  navigateBack() {
    const targetPlace = this.bookManager.getCurrentServiceType()() === 'memory' ? 'shop' : 'warehouse';
    this.router.navigate(['/library', targetPlace]);
  }

  cancel() {
    this.navigateBack();
  }
}
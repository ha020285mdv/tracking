import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  email = signal('');
  password = signal('');
  isSignUp = signal(false);
  error = signal<string | null>(null);
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  handleEmailAuth(): void {
    this.error.set(null);
    this.isLoading.set(true);

    const auth$ = this.isSignUp()
      ? this.authService.signUpWithEmail$(this.email(), this.password())
      : this.authService.signInWithEmail$(this.email(), this.password());

    auth$.subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  handleGoogleSignIn(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.authService.signInWithGoogle$().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleMode(): void {
    this.isSignUp.set(!this.isSignUp());
    this.error.set(null);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { FIREBASE_AUTH } from '../firebase/firebase.tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(FIREBASE_AUTH);

  // signal to track current user state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  constructor() {
    // listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      this.isLoading.set(false);
    });
  }

  getUserId(): string | null {
    return this.currentUser()?.uid ?? null;
  }

  getIdToken$(): Observable<string | null> {
    const user = this.currentUser();
    if (!user) {
      console.warn('No user available for getting ID token');
      return from([null]);
    }
    return from(user.getIdToken(true)).pipe(
      catchError((error) => {
        console.error('Error getting ID token:', error);
        return from([null]);
      })
    );
  }

  // For backward compatibility with interceptor
  async getIdToken(): Promise<string | null> {
    const user = this.currentUser();
    if (!user) {
      console.warn('No user available for getting ID token');
      return null;
    }
    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  signInWithEmail$(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(() => void 0),
      catchError((error) => throwError(() => this.handleAuthError(error)))
    );
  }

  signUpWithEmail$(email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map(() => void 0),
      catchError((error) => throwError(() => this.handleAuthError(error)))
    );
  }

  signInWithGoogle$(): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      map(() => void 0),
      catchError((error) => throwError(() => this.handleAuthError(error)))
    );
  }

  signOut$(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError((error) => throwError(() => this.handleAuthError(error)))
    );
  }

  // handle Firebase Auth errors
  private handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/user-disabled':
        return new Error('This account has been disabled');
      case 'auth/user-not-found':
        return new Error('No account found with this email');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/email-already-in-use':
        return new Error('Email already in use');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters');
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in popup was closed');
      default:
        return new Error(error.message || 'Authentication failed');
    }
  }
}

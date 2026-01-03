import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/components/header/header';
import { WorkoutService } from './core/services/workout.service';
import { AuthService } from './core/services/auth.service';
import { filter, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly workoutService = inject(WorkoutService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUser$ = toObservable(this.authService.currentUser);

  ngOnInit(): void {
    // fetch active training session whenever the authenticated user changes
    this.currentUser$
      .pipe(
        switchMap((user) => {
          if (user) {
            // User is authenticated, fetch their active session
            return this.workoutService.getActiveSession$();
          } else {
            // User is logged out, clear the active session
            this.workoutService.clearActiveSession();
            return of(null);
          }
        }),
        catchError((error) => {
          console.error('Error loading active session:', error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}

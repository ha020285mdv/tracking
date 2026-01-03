import { ResolveFn, Router } from '@angular/router';
import { ActiveSession } from '../models/active-session.model';
import { inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { catchError, of, tap } from 'rxjs';

export const activeSessionResolver: ResolveFn<ActiveSession | null> = () => {
  const workoutService = inject(WorkoutService);
  const router = inject(Router);
  const userId = '007'; // TODO: Get from auth service

  return workoutService.getActiveSession$(userId).pipe(
    tap((session) => {
      // redirect to home if no active session found
      if (!session) {
        router.navigate(['/']);
      } else {
        // Initialize the active session in the service
        workoutService.setActiveSession(session);
      }
    }),
    catchError(() => {
      // redirect to home on error
      router.navigate(['/']);
      return of(null);
    })
  );
};

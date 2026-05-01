import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { ActiveSession } from '../models/active-session.model';
import { inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { catchError, of, tap } from 'rxjs';

export const activeSessionResolver: ResolveFn<ActiveSession | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const workoutService = inject(WorkoutService);
  const router = inject(Router);

  return workoutService.getActiveSession$().pipe(
    tap((session) => {
      // redirect to home if no active session found
      if (!session) {
        router.navigate(['/']);
      } else {
        // Initialize the active session in the service
        workoutService.setActiveSession(session);
      }
    }),
    catchError((error) => {
      console.error('Error fetching active session:', error);
      // redirect to home on error
      router.navigate(['/']);
      return of(null);
    }),
  );
};

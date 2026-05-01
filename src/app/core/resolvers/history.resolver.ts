import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable, of, catchError } from 'rxjs';
import { WorkoutHistory } from '../models/workout-history.model';
import { WorkoutService } from '../services/workout.service';

export const historyResolver: ResolveFn<WorkoutHistory | null> = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): Observable<WorkoutHistory | null> => {
  const workoutService = inject(WorkoutService);
  const id = route.paramMap.get('id');
  if (!id) return of(null);
  return workoutService.getWorkoutHistoryById$(id).pipe(
    catchError((err) => {
      console.error('Failed to load workout history', err);
      return of(null);
    }),
  );
};

import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { Workout } from '../models/workout.model';
import { Observable, of, take, tap } from 'rxjs';
import { DestroyRef, inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const workoutResolver: ResolveFn<Workout | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<Workout | null> => {
  const id: string | null = route.params?.['id'];

  if (!id) {
    return of(null);
  }

  // try to get workout from route first
  const router = inject(Router);
  const navigationWorkout =
    router.currentNavigation()?.extras.state?.['workout'] ?? history.state?.['workout'];

  //if it present, simply return it
  const workoutService = inject(WorkoutService);
  if (navigationWorkout) {
    workoutService.setCurrentWorkout(navigationWorkout); // TODO: delete after testing
    return of(navigationWorkout);
  }

  //fetch workout from server otherwise
  const destroyRef = inject(DestroyRef);
  return workoutService.getWorkoutById$(id).pipe(
    tap((workout) => workoutService.setCurrentWorkout(workout)),
    takeUntilDestroyed(destroyRef)
  );
};

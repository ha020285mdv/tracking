import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { Workout } from '../models/workout.model';
import { Observable, of } from 'rxjs';
import { inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';

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
    return of(navigationWorkout);
  }

  //fetch from server otherwise
  return workoutService.getWorkoutById$(id);
};

import { Component, DestroyRef, inject, input } from '@angular/core';
import { Workout } from '../../models/workout.model';
import { WorkoutItem } from '../../components/workout-item/workout-item';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { WorkoutService } from '../../services/workout.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-workouts',
  imports: [WorkoutItem],
  templateUrl: './workouts-page.html',
  styleUrl: './workouts-page.scss',
})
export class WorkoutsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);

  protected readonly workouts = toSignal(
    this.workoutService.getWorkoutsByUserId$().pipe(
      // TODO: handle errors
      catchError((error) => {
        console.error('Error fetching workouts', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: [] }
  );
}

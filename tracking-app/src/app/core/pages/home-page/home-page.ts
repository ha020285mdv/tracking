import { Component, DestroyRef, inject } from '@angular/core';
import { WorkoutService } from '../../services/workout.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { Calendar } from './calendar/calendar';
import { UserWidget } from './user-widget/user-widget';
import { WorkoutItem } from '../../components/workout-item/workout-item';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [Calendar, UserWidget, WorkoutItem, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);

  private readonly workoutsLimit = 2;

  protected readonly workouts = toSignal(
    this.workoutService.getWorkoutsByUserId$(this.workoutsLimit).pipe(
      // TODO: handle errors
      catchError((error) => {
        console.error('Error fetching workouts', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: [] }
  );

  protected readonly isThereActiveSession = toSignal(
    this.workoutService.activeSession$.pipe(map((session) => !!session)),
    {
      initialValue: false,
    }
  );
}

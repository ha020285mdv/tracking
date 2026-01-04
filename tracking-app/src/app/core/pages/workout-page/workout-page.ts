import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workout } from '../../models/workout.model';
import { map, take } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workout-page',
  imports: [ExerciseCard],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.scss',
})
export class WorkoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);

  protected readonly workout = toSignal<Workout | null>(
    this.route.data.pipe(map((data) => data['workout'] as Workout | null)),
    { initialValue: null }
  );

  protected readonly isThereActiveSession = toSignal(
    this.workoutService.activeSession$.pipe(map((session) => !!session)),
    {
      initialValue: false,
    }
  );

  onStartWorkout() {
    if (this.isThereActiveSession()) {
      return;
    }

    const templateId = this.workout()?.id;
    if (!templateId) {
      return;
    }

    this.workoutService
      .startWorkout$(templateId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigate(['/session']);
        },
        error: (error) => {
          // if there's already an active session (409), navigate to it
          if (error.status === 409) {
            this.router.navigate(['/session']);
          } else {
            console.error('Error starting workout:', error);
          }
        },
      });
  }
}

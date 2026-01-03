import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workout } from '../../models/workout.model';
import { map } from 'rxjs';
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

  private readonly userId = '007'; // TODO: get from auth service

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
    const templateId = this.workout()?.id;
    if (!templateId) {
      return;
    }
    this.workoutService.startWorkout$(this.userId, templateId).subscribe(() => {
      this.router.navigate(['/session']);
    });
  }
}

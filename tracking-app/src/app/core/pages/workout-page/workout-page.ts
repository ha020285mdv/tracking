import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressBar } from './progress-bar/progress-bar';
import { Status } from '../../enums/status.enum';
import { Workout } from '../../models/workout.model';
import { ExerciseCard } from './exercise-card/exercise-card';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-workout-page',
  imports: [ProgressBar, ExerciseCard],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.scss',
})
export class WorkoutPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly workout = toSignal<Workout | null>(
    this.route.data.pipe(map((data) => data['workout'] as Workout | null)),
    { initialValue: null }
  );

  public readonly progress = computed(() => {
    const w = this.workout();
    if (!w) {
      return 0;
    }
    const totalSets = w.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

    const completedSets = w.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.status === Status.Completed).length,
      0
    );

    return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  });

  //TODO: add implementation
  public finish() {
    throw new Error('Method not implemented.');
  }
}

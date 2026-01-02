import { Component, computed, signal } from '@angular/core';
import { ProgressBar } from './progress-bar/progress-bar';
import { Status } from '../../enums/status.enum';
import { Workout } from '../../models/workout.model';
import { mockWorkout } from '../../testing/stubs/workout.stub';
import { ExerciseCard } from './exercise-card/exercise-card';

@Component({
  selector: 'app-active-workout',
  imports: [ProgressBar, ExerciseCard],
  templateUrl: './active-workout.html',
  styleUrl: './active-workout.scss',
})
export class ActiveWorkout {
  public readonly workout = signal<Workout>(mockWorkout());
  //TODO: fetch data from service

  public readonly progress = computed(() => {
    const w = this.workout();
    const totalSets = w.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

    const completedSets = w.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.status === Status.Completed).length,
      0
    );

    return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  });
}

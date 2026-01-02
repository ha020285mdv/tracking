import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ProgressBar } from './progress-bar/progress-bar';
import { Status } from '../../enums/status.enum';
import { Workout } from '../../models/workout.model';
import { mockWorkout } from '../../testing/stubs/workout.stub';
import { ExerciseCard } from './exercise-card/exercise-card';
import { WorkoutService } from '../../services/workout.service';
import { catchError, of, startWith, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-active-workout',
  imports: [ProgressBar, ExerciseCard],
  templateUrl: './active-workout.html',
  styleUrl: './active-workout.scss',
})
export class ActiveWorkout {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);

  private readonly userId = '007'; // TODO: get from auth service

  protected readonly workout = toSignal<Workout | null>(
    this.workoutService.getWorkoutsByUserId$(this.userId).pipe(
      tap((workout) => {
        this.workoutService.setCurrentWorkout(workout);
      }),
      switchMap(() => this.workoutService.currentWorkout$),
      catchError((error) => {
        console.error('Error fetching workout', error);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: null }
  );

  // TODO: check whether it is calculated correctly
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
}

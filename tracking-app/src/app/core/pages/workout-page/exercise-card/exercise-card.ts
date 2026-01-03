import { Component, inject, input } from '@angular/core';
import { Exercise } from '../../../models/exercise.model';
import { SetCardActive } from './set-card-active/set-card-active';
import { SetCard } from './set-card/set-card';
import { Status } from '../../../enums/status.enum';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { WorkoutService } from '../../../services/workout.service';
import { catchError, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-exercise-card',
  imports: [SetCardActive, SetCard],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.scss',
})
export class ExerciseCard {
  private readonly workoutService = inject(WorkoutService);
  public readonly status = Status;

  public readonly workoutId = input.required<string>();
  public readonly exercise = input.required<Exercise>();

  // TODO: add error handling
  onSetActivate($event: ExerciseSet): void {
    const workoutId = this.workoutId();
    this.workoutService
      .activateSet(workoutId, this.exercise().id, $event.id)
      .pipe(
        switchMap(() => this.workoutService.refreshCurrentWorkout(workoutId)),
        take(1)
      )
      .subscribe();
  }

  // TODO: add error handling
  onSetComplete($event: ExerciseSet): void {
    this.workoutService
      .completeSet(this.workoutId(), this.exercise().id, $event)
      .pipe(
        switchMap(() => this.workoutService.refreshCurrentWorkout(this.workoutId())),
        take(1)
      )
      .subscribe();
  }
}

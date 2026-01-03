import { Component, inject, input } from '@angular/core';
import { SetCardActive } from './set-card-active/set-card-active';
import { SetCard } from './set-card/set-card';
import { take } from 'rxjs';
import { WorkoutService } from '../../services/workout.service';
import { Status } from '../../enums/status.enum';
import { Exercise } from '../../models/exercise.model';
import { ExerciseSet } from '../../models/exercise-set.model';

@Component({
  selector: 'app-exercise-card',
  imports: [SetCardActive, SetCard],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.scss',
})
export class ExerciseCard {
  private readonly workoutService = inject(WorkoutService);
  public readonly status = Status;

  public readonly sessionId = input.required<string>();
  public readonly exercise = input.required<Exercise>();

  onSetActivate($event: ExerciseSet): void {
    const sessionId = this.sessionId();
    this.workoutService
      .activateSet(sessionId, this.exercise().id, $event.id)
      .pipe(take(1))
      .subscribe({
        error: (err) => {
          console.error('Failed to activate set:', err);
        },
      });
  }

  onSetComplete($event: ExerciseSet): void {
    const sessionId = this.sessionId();
    this.workoutService
      .completeSet(sessionId, this.exercise().id, $event)
      .pipe(take(1))
      .subscribe({
        error: (err) => {
          console.error('Failed to complete set:', err);
        },
      });
  }
}

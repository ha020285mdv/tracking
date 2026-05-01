import { Component, input, output, computed } from '@angular/core';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { Status } from '../../../enums/status.enum';
import { SetStatusToStringPipe } from '../../../pipes/set-status-to-string.pipe';
import { ExerciseType } from '../../../models/exercise.model';

@Component({
  selector: 'app-set-card',
  imports: [SetStatusToStringPipe],
  templateUrl: './set-card.html',
  styleUrl: './set-card.scss',
})
export class SetCard {
  public readonly status = Status;
  public readonly ExerciseType = ExerciseType;

  public readonly index = input.required<number>();
  public readonly set = input.required<ExerciseSet>();
  public readonly isLocked = input<boolean>(false);
  public readonly exerciseType = input<ExerciseType>(ExerciseType.Standard);

  public readonly activate = output<ExerciseSet>();

  // Check if this is a timed set (has duration, no reps)
  protected readonly isTimed = computed(
    () =>
      this.exerciseType() === ExerciseType.Timed ||
      (this.set().duration !== undefined && this.set().reps === undefined),
  );

  // Format duration in mm:ss or just seconds
  protected formatDuration(seconds: number | undefined): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  public activateSet() {
    // Can't activate if locked or not pending
    if (this.isLocked() || this.set().status !== Status.Pending) {
      return;
    }
    this.activate.emit(this.set());
  }
}

import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseSet } from '../../../../models/exercise-set.model';
import { Status } from '../../../../enums/status.enum';

@Component({
  selector: 'app-set-card-active',
  imports: [FormsModule],
  templateUrl: './set-card-active.html',
  styleUrl: './set-card-active.scss',
})
export class SetCardActive {
  public readonly index = input.required<number>();
  public readonly set = input.required<ExerciseSet>();
  public readonly complete = output<ExerciseSet>();

  public readonly weightActual = signal<number>(0);
  public readonly repsActual = signal<number>(10);

  private readonly minReps = 1;
  private readonly minWeight = 0;
  private readonly step = 1;

  constructor() {
    effect(() => {
      this.weightActual.set(this.set().weight);
    });
    effect(() => {
      this.repsActual.set(this.set().reps);
    });
  }

  completeSet(): void {
    this.complete.emit({
      ...this.set(),
      weight: this.weightActual(),
      reps: this.repsActual(),
      status: Status.Completed,
    });
  }

  onIncrementWeight(): void {
    this.weightActual.update((current) => current + this.step);
  }

  onDecrementWeight(): void {
    this.weightActual.update((current) => {
      if (current === this.minWeight) return current;
      return current - this.step;
    });
  }

  onIncrementReps(): void {
    this.repsActual.update((current) => current + this.step);
  }

  onDecrementReps(): void {
    this.repsActual.update((current) => {
      if (current === this.minReps) return current;
      return current - this.step;
    });
  }
}

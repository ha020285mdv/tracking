import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { Status } from '../../../enums/status.enum';

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

  private readonly minReps = 1;
  private readonly minWeight = 0;
  private readonly step = 1;

  public readonly weightActual = signal<number>(this.minWeight);
  public readonly repsActual = signal<number>(this.minReps);

  constructor() {
    effect(() => {
      const currentSet = this.set();
      this.weightActual.set(currentSet.weight);
      this.repsActual.set(currentSet.reps);
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

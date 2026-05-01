import { Component, effect, input, output, signal, computed, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { Status } from '../../../enums/status.enum';
import { ExerciseType } from '../../../models/exercise.model';

@Component({
  selector: 'app-set-card-active',
  imports: [FormsModule],
  templateUrl: './set-card-active.html',
  styleUrl: './set-card-active.scss',
})
export class SetCardActive implements OnDestroy {
  public readonly index = input.required<number>();
  public readonly set = input.required<ExerciseSet>();
  public readonly exerciseType = input<ExerciseType>(ExerciseType.Standard);
  public readonly complete = output<ExerciseSet>();

  private readonly minReps = 1;
  private readonly minWeight = 0;
  private readonly step = 1;

  public readonly weightActual = signal<number>(this.minWeight);
  public readonly repsActual = signal<number>(this.minReps);

  // Timer state for timed exercises
  public readonly timerRunning = signal(false);
  public readonly elapsedSeconds = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Check if this is a timed exercise
  protected readonly isTimed = computed(
    () =>
      this.exerciseType() === ExerciseType.Timed ||
      (this.set().duration !== undefined && this.set().reps === undefined),
  );

  // Target duration from set
  protected readonly targetDuration = computed(() => this.set().duration ?? 0);

  // Progress percentage
  protected readonly progress = computed(() => {
    const target = this.targetDuration();
    if (target === 0) return 0;
    return Math.min(100, (this.elapsedSeconds() / target) * 100);
  });

  // Format seconds to mm:ss
  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  constructor() {
    effect(() => {
      const currentSet = this.set();
      this.weightActual.set(currentSet.weight ?? this.minWeight);
      this.repsActual.set(currentSet.reps ?? this.minReps);
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  toggleTimer(): void {
    if (this.timerRunning()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer(): void {
    this.timerRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update((s) => s + 1);
    }, 1000);
  }

  private stopTimer(): void {
    this.timerRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.elapsedSeconds.set(0);
  }

  completeSet(): void {
    this.stopTimer();
    if (this.isTimed()) {
      this.complete.emit({
        ...this.set(),
        duration: this.elapsedSeconds() > 0 ? this.elapsedSeconds() : this.targetDuration(),
        status: Status.Completed,
      });
    } else {
      this.complete.emit({
        ...this.set(),
        weight: this.weightActual(),
        reps: this.repsActual(),
        status: Status.Completed,
      });
    }
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

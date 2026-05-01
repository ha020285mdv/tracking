import { Component, inject, input, computed, signal, effect, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SetCardActive } from './set-card-active/set-card-active';
import { SetCard } from './set-card/set-card';
import { TimedExerciseActive } from './timed-exercise-active/timed-exercise-active';
import { take } from 'rxjs';
import { WorkoutService } from '../../services/workout.service';
import { Status } from '../../enums/status.enum';
import { Exercise, ExerciseType } from '../../models/exercise.model';
import { ExerciseSet } from '../../models/exercise-set.model';

@Component({
  selector: 'app-exercise-card',
  imports: [SetCardActive, SetCard, TimedExerciseActive],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.scss',
})
export class ExerciseCard {
  private readonly workoutService = inject(WorkoutService);
  public readonly status = Status;

  public readonly sessionId = input<string | null>(null); // should be provided when used in a session context
  public readonly exercise = input.required<Exercise>();
  public readonly exerciseIndex = input<number>(0); // index of this exercise in the workout

  // Output when exercise completes all sets
  public readonly exerciseCompleted = output<number>();

  // Reactive signal for timer running state
  private readonly timerRunningForExercise = toSignal(
    this.workoutService.timerRunningForExercise$,
    {
      initialValue: null,
    },
  );

  // Track expanded state (only used in session context)
  // Only first exercise starts expanded
  protected readonly isExpanded = signal(true);

  // Track if initial state has been set
  private initialStateSet = false;
  // Track previous hasPendingSets value to detect completion
  private prevHasPending = true;

  constructor() {
    // Set initial expanded state based on exerciseIndex (only first is expanded)
    effect(
      () => {
        const idx = this.exerciseIndex();
        const sid = this.sessionId();
        // Only set initial state once if in session context
        if (!this.initialStateSet && sid !== null) {
          this.initialStateSet = true;
          // Only first exercise starts expanded
          if (idx > 0) {
            this.isExpanded.set(false);
          }
        }
      },
      { allowSignalWrites: true },
    );

    // Auto-collapse when all sets become completed and emit event
    effect(
      () => {
        const hasPending = this.hasPendingSets();
        if (this.sessionId() && this.prevHasPending && !hasPending) {
          // Exercise just completed - collapse it and notify parent
          this.isExpanded.set(false);
          this.exerciseCompleted.emit(this.exerciseIndex());
        }
        this.prevHasPending = hasPending;
      },
      { allowSignalWrites: true },
    );
  }

  // Check if another exercise has a running timer (reactive)
  protected readonly isLockedByOtherTimer = computed(() => {
    const runningExerciseId = this.timerRunningForExercise();
    if (!runningExerciseId) return false;
    return runningExerciseId !== this.exercise().id;
  });

  // Check if exercise is timed (intervals/timed sets)
  protected readonly isTimed = computed(() => {
    return this.exercise().type === ExerciseType.Timed;
  });

  // Check if timed exercise has active work (any pending or active sets)
  protected readonly hasActiveTimedWork = computed(() => {
    if (!this.isTimed()) return false;
    return this.exercise().sets.some(
      (s) => s.status === Status.Pending || s.status === Status.Active,
    );
  });

  // Determine which sets can be activated (only if all previous sets are not pending)
  protected canActivateSet(setIndex: number): boolean {
    const sets = this.exercise().sets;
    // All previous sets must be Completed or Active (not Pending)
    for (let i = 0; i < setIndex; i++) {
      const set = sets[i];
      if (set && set.status === Status.Pending) {
        return false;
      }
    }
    return true;
  }

  // Find the first set that should be focused (first pending or active set)
  protected readonly firstActiveSetIndex = computed(() => {
    const sets = this.exercise().sets;
    // First, look for active set
    const activeIdx = sets.findIndex((s) => s.status === Status.Active);
    if (activeIdx !== -1) return activeIdx;
    // Otherwise, find first pending set that can be activated
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      if (set && set.status === Status.Pending && this.canActivateSet(i)) {
        return i;
      }
    }
    return -1;
  });

  // Check if exercise has any pending work
  protected readonly hasPendingSets = computed(() => {
    return this.exercise().sets.some(
      (s) => s.status === Status.Pending || s.status === Status.Active,
    );
  });

  protected toggleExpanded(): void {
    // Don't allow expanding a timed exercise if another timer is running
    if (!this.isExpanded() && this.isTimed() && this.isLockedByOtherTimer()) {
      return;
    }
    this.isExpanded.update((v) => !v);
  }

  onSetActivate($event: ExerciseSet): void {
    const sessionId = this.sessionId();

    if (!sessionId) {
      return;
    }

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

    if (!sessionId) {
      return;
    }

    this.workoutService
      .completeSet(sessionId, this.exercise().id, $event)
      .pipe(take(1))
      .subscribe({
        error: (err) => {
          console.error('Failed to complete set:', err);
        },
      });
  }

  onTimerStarted(): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    // Track that this exercise has a running timer
    this.workoutService.setTimerRunning(this.exercise().id);

    // Deactivate any active sets in other exercises
    this.workoutService
      .deactivateOtherSets(sessionId, this.exercise().id)
      .pipe(take(1))
      .subscribe({
        error: (err) => {
          console.error('Failed to deactivate other sets:', err);
        },
      });
  }

  onTimerStopped(): void {
    // Clear the running timer state
    this.workoutService.setTimerRunning(null);
  }

  onExerciseComplete(): void {
    // Timer is done, clear state and collapse
    this.workoutService.setTimerRunning(null);
    this.isExpanded.set(false);
    // Notify parent to expand the next exercise
    this.exerciseCompleted.emit(this.exerciseIndex());
  }

  // Public method to expand this exercise from outside
  public expand(): void {
    this.isExpanded.set(true);
  }
}

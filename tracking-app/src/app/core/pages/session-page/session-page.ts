import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressBar } from './progress-bar/progress-bar';
import { Status } from '../../enums/status.enum';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';
import { ActiveSession } from '../../models/active-session.model';
import { WorkoutService } from '../../services/workout.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-session-page',
  imports: [ProgressBar, ExerciseCard],
  templateUrl: './session-page.html',
  styleUrl: './session-page.scss',
})
export class SessionPage {
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);

  // Subscribe to the active session from the service
  protected readonly session = toSignal<ActiveSession | null>(this.workoutService.activeSession$, {
    initialValue: null,
  });

  public readonly progress = computed(() => {
    const s = this.session();
    if (!s) {
      return 0;
    }
    const totalSets = s.currentState.reduce((total, exercise) => total + exercise.sets.length, 0);
    const completedSets = s.currentState.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.status === Status.Completed).length,
      0
    );

    return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  });

  finishWorkout(): void {
    const sessionId = this.session()?.id;
    if (!sessionId) {
      return;
    }

    this.workoutService
      .finishWorkout$(sessionId)
      .pipe(take(1))
      .subscribe(() => {
        // back to home; TODO: maybe show some summary page instead
        this.workoutService.setActiveSession(null);
        this.router.navigate(['/']);
      });
  }
}

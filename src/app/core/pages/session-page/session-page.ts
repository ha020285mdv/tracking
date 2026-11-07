import {
  Component,
  computed,
  inject,
  QueryList,
  ViewChildren,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
export class SessionPage implements OnInit, OnDestroy {
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);

  @ViewChildren(ExerciseCard) exerciseCards!: QueryList<ExerciseCard>;

  // Subscribe to the active session from the service
  protected readonly session = toSignal<ActiveSession | null>(this.workoutService.activeSession$, {
    initialValue: null,
  });

  // Elapsed time signal - recalculated from startedAt to handle tab inactivity
  protected readonly elapsedTime = signal<string>('0min');
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private visibilityHandler: (() => void) | null = null;

  // Scroll state for collapsible header
  protected readonly isScrolled = signal<boolean>(false);
  private readonly scrollThreshold = 20; // pixels to scroll before collapsing

  ngOnInit(): void {
    this.startTimer();
    // When tab becomes visible again, immediately recalculate time
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.updateElapsedTime();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Listen to window scroll for collapsible header
    window.addEventListener('scroll', this.handleWindowScroll, true);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    window.removeEventListener('scroll', this.handleWindowScroll, true);
  }

  private handleWindowScroll = (): void => {
    // Check scroll position of any scrollable container
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled.set(scrollY > this.scrollThreshold);
  };

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.isScrolled.set(target.scrollTop > this.scrollThreshold);
  }

  private startTimer(): void {
    // Update immediately
    this.updateElapsedTime();
    // Then update every second
    this.timerInterval = setInterval(() => this.updateElapsedTime(), 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateElapsedTime(): void {
    const sessionValue = this.session();
    if (!sessionValue?.startedAt) {
      this.elapsedTime.set('0min');
      return;
    }

    const startTime = new Date(sessionValue.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = Math.max(0, now - startTime);

    this.elapsedTime.set(this.formatDuration(elapsedMs));
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    } else {
      return `${seconds}s`;
    }
  }

  public readonly progress = computed(() => {
    const sessionValue = this.session();
    if (!sessionValue) {
      return 0;
    }
    const totalSets = sessionValue.currentState.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
    const completedSets = sessionValue.currentState.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.status === Status.Completed).length,
      0,
    );

    return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  });

  finish(): void {
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

  onExerciseCompleted(completedIndex: number): void {
    // Expand the next exercise in the list
    const nextIndex = completedIndex + 1;
    const cards = this.exerciseCards.toArray();
    if (nextIndex < cards.length) {
      cards[nextIndex]?.expand();
    }
  }
}

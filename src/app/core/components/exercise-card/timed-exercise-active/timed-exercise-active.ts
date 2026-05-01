import { Component, input, output, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { Status } from '../../../enums/status.enum';

interface Segment {
  id: string;
  type: 'interval' | 'rest';
  duration: number; // in seconds
  status: 'pending' | 'active' | 'completed';
  setRef?: ExerciseSet; // reference to original set for intervals
}

@Component({
  selector: 'app-timed-exercise-active',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timed-exercise-active.html',
  styleUrl: './timed-exercise-active.scss',
})
export class TimedExerciseActive implements OnInit, OnDestroy {
  public readonly sets = input.required<ExerciseSet[]>();
  public readonly onComplete = output<ExerciseSet>();
  public readonly onCompleteAll = output<void>();
  public readonly onTimerStart = output<void>();
  public readonly onTimerStop = output<void>();

  // Timer state
  protected readonly isRunning = signal(false);
  protected readonly currentSegmentIndex = signal(0);
  protected readonly segmentElapsed = signal(0);
  protected readonly totalElapsed = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Confirmation state
  protected readonly showFinishConfirmation = signal(false);

  // Build segments from sets (intervals) with rests between them
  protected readonly segments = computed<Segment[]>(() => {
    const inputSets = this.sets();
    const result: Segment[] = [];
    let intervalCount = 0;

    inputSets.forEach((set, idx) => {
      // Determine if this is a rest (has isRest property or duration but no weight/reps context)
      // For now, we treat all sets as intervals and add synthetic rests
      // In a real scenario, rests would be explicit in the data model

      // Add interval
      intervalCount++;
      result.push({
        id: set.id,
        type: 'interval',
        duration: set.duration ?? 30,
        status:
          set.status === Status.Completed
            ? 'completed'
            : set.status === Status.Active
              ? 'active'
              : 'pending',
        setRef: set,
      });

      // Add rest after each interval except the last (if there are multiple sets)
      // Default rest of 30 seconds between intervals
      if (idx < inputSets.length - 1) {
        result.push({
          id: `rest-${idx}`,
          type: 'rest',
          duration: 30, // Default rest duration
          status: 'pending',
        });
      }
    });

    return result;
  });

  // Current segment
  protected readonly currentSegment = computed(() => {
    const segs = this.segments();
    const idx = this.currentSegmentIndex();
    return segs[idx] ?? null;
  });

  // Progress within current segment
  protected readonly segmentProgress = computed(() => {
    const seg = this.currentSegment();
    if (!seg || seg.duration === 0) return 0;
    return Math.min(100, (this.segmentElapsed() / seg.duration) * 100);
  });

  // Total progress across all segments
  protected readonly totalProgress = computed(() => {
    const segs = this.segments();
    const totalDuration = segs.reduce((sum, s) => sum + s.duration, 0);
    if (totalDuration === 0) return 0;
    return Math.min(100, (this.totalElapsed() / totalDuration) * 100);
  });

  // Count completed intervals
  protected readonly completedIntervals = computed(() => {
    return this.segments().filter((s) => s.type === 'interval' && s.status === 'completed').length;
  });

  // Total intervals
  protected readonly totalIntervals = computed(() => {
    return this.segments().filter((s) => s.type === 'interval').length;
  });

  // Is exercise complete?
  protected readonly isComplete = computed(() => {
    return this.currentSegmentIndex() >= this.segments().length;
  });

  ngOnInit(): void {
    // Find the first non-completed segment to start from
    const segs = this.segments();
    const firstPendingIdx = segs.findIndex((s) => s.status !== 'completed');
    if (firstPendingIdx !== -1) {
      this.currentSegmentIndex.set(firstPendingIdx);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  toggleTimer(): void {
    if (this.isRunning()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer(): void {
    if (this.isComplete()) return;

    this.isRunning.set(true);
    this.onTimerStart.emit();
    this.timerInterval = setInterval(() => {
      this.segmentElapsed.update((s) => s + 1);
      this.totalElapsed.update((t) => t + 1);

      // Check if current segment is complete
      const seg = this.currentSegment();
      if (seg && this.segmentElapsed() >= seg.duration) {
        this.completeCurrentSegment();
      }
    }, 1000);
  }

  private stopTimer(): void {
    const wasRunning = this.isRunning();
    this.isRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (wasRunning) {
      this.onTimerStop.emit();
    }
  }

  private completeCurrentSegment(): void {
    const seg = this.currentSegment();
    if (!seg) return;

    // If it's an interval, emit completion
    if (seg.type === 'interval' && seg.setRef) {
      this.onComplete.emit({
        ...seg.setRef,
        duration: this.segmentElapsed(),
        status: Status.Completed,
      });
    }

    // Move to next segment
    this.moveToNextSegment();
  }

  private moveToNextSegment(): void {
    const nextIdx = this.currentSegmentIndex() + 1;
    const segs = this.segments();

    if (nextIdx >= segs.length) {
      // All done
      this.stopTimer();
      this.currentSegmentIndex.set(nextIdx);
      this.onCompleteAll.emit();
    } else {
      this.currentSegmentIndex.set(nextIdx);
      this.segmentElapsed.set(0);
    }
  }

  skipToNext(): void {
    const wasRunning = this.isRunning();
    this.stopTimer();
    this.completeCurrentSegment();
    // Auto-start next segment if timer was running and exercise is not complete
    if (wasRunning && !this.isComplete()) {
      this.startTimer();
    }
  }

  // Show confirmation dialog (pause timer while confirming)
  requestFinishExercise(): void {
    this.stopTimer();
    this.showFinishConfirmation.set(true);
  }

  // Cancel finish and optionally resume timer
  cancelFinish(): void {
    this.showFinishConfirmation.set(false);
  }

  // Confirm and actually finish the exercise
  confirmFinish(): void {
    this.showFinishConfirmation.set(false);

    // Complete all remaining intervals
    const segs = this.segments();
    for (let i = this.currentSegmentIndex(); i < segs.length; i++) {
      const seg = segs[i];
      if (seg && seg.type === 'interval' && seg.setRef && seg.status !== 'completed') {
        this.onComplete.emit({
          ...seg.setRef,
          duration: seg.duration,
          status: Status.Completed,
        });
      }
    }

    this.currentSegmentIndex.set(segs.length);
    this.onCompleteAll.emit();
  }

  // For roadmap: get segment status considering current progress
  getSegmentDisplayStatus(index: number): 'completed' | 'active' | 'pending' {
    const currentIdx = this.currentSegmentIndex();
    if (index < currentIdx) return 'completed';
    if (index === currentIdx) return 'active';
    return 'pending';
  }
}

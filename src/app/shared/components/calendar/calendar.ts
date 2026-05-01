import {
  Component,
  computed,
  inject,
  signal,
  HostListener,
  ElementRef,
  output,
  input,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { WorkoutService } from '../../../core/services/workout.service';
import { WorkoutHistory } from '../../../core/models/workout-history.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  workouts: WorkoutHistory[];
  key: string;
}

@Component({
  selector: 'app-shared-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class SharedCalendar {
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  /** Optional initial month to display */
  readonly initialMonth = input<Date>();

  /** Emits when the displayed month changes */
  readonly monthChange = output<Date>();

  /** Internal month signal */
  readonly currentMonth = signal(this.startOfMonth(new Date()));
  readonly selectedDayKey = signal<string | null>(null);

  constructor() {
    // Sync with initialMonth input if provided
    effect(() => {
      const initial = this.initialMonth();
      if (initial) {
        this.currentMonth.set(this.startOfMonth(initial));
      }
    });
  }

  // Calculate visible date range for the calendar grid (6 weeks)
  private readonly dateRange = computed(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const firstDay = new Date(year, monthIdx, 1);
    const dayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start

    const from = new Date(year, monthIdx, 1 - daysFromPrevMonth);
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 41);
    to.setHours(23, 59, 59, 999);

    return { from: from.toISOString(), to: to.toISOString() };
  });

  /** History data for the visible date range */
  readonly history = toSignal(
    toObservable(this.dateRange).pipe(
      switchMap(({ from, to }) =>
        this.workoutService.getWorkoutHistory$({ from, to }).pipe(
          catchError((err) => {
            console.error('Failed to load workout history', err);
            return of([] as WorkoutHistory[]);
          }),
        ),
      ),
    ),
    { initialValue: [] as WorkoutHistory[] },
  );

  /** History filtered to current month only */
  readonly monthHistory = computed(() => {
    const all = this.history();
    const month = this.currentMonth();
    return all.filter((h) => {
      const d = new Date(h.completedAt);
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
  });

  readonly monthLabel = computed(() => {
    const d = this.currentMonth();
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly isCurrentMonth = computed(() => {
    const now = new Date();
    const cur = this.currentMonth();
    return now.getFullYear() === cur.getFullYear() && now.getMonth() === cur.getMonth();
  });

  readonly weeks = computed<CalendarDay[][]>(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const firstDay = new Date(year, monthIdx, 1);
    const dayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const prevDays = new Date(year, monthIdx, 0).getDate();

    const today = this.startOfDay(new Date());
    const historyByDate = this.groupHistoryByDate(this.history());

    const cells: CalendarDay[] = [];

    // Previous month tail (Monday start)
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const dayNum = prevDays - i;
      const date = new Date(year, monthIdx - 1, dayNum);
      cells.push(this.buildDay(date, dayNum, false, today, historyByDate));
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIdx, d);
      cells.push(this.buildDay(date, d, true, today, historyByDate));
    }

    // Next month head (fill to 42 cells = 6 weeks)
    let nextDay = 1;
    while (cells.length < 42) {
      const date = new Date(year, monthIdx + 1, nextDay);
      cells.push(this.buildDay(date, nextDay, false, today, historyByDate));
      nextDay++;
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  });

  readonly selectedDay = computed(() => {
    const key = this.selectedDayKey();
    if (!key) return null;
    for (const week of this.weeks()) {
      for (const d of week) {
        if (d.key === key) return d;
      }
    }
    return null;
  });

  prevMonth(): void {
    this.currentMonth.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.selectedDayKey.set(null);
    this.monthChange.emit(this.currentMonth());
  }

  nextMonth(): void {
    this.currentMonth.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.selectedDayKey.set(null);
    this.monthChange.emit(this.currentMonth());
  }

  goToCurrentMonth(): void {
    this.currentMonth.set(this.startOfMonth(new Date()));
    this.selectedDayKey.set(null);
    this.monthChange.emit(this.currentMonth());
  }

  /** Set month programmatically (for external control) */
  setMonth(date: Date): void {
    this.currentMonth.set(this.startOfMonth(date));
    this.selectedDayKey.set(null);
  }

  onDayClick(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    if (day.workouts.length === 0) {
      this.selectedDayKey.set(null);
      return;
    }
    if (day.workouts.length === 1) {
      this.selectedDayKey.set(null);
      this.router.navigate(['/history', day.workouts[0]!.id]);
      return;
    }
    this.selectedDayKey.update((current) => (current === day.key ? null : day.key));
  }

  onWorkoutSelect(workout: WorkoutHistory): void {
    this.selectedDayKey.set(null);
    this.router.navigate(['/history', workout.id]);
  }

  trimName(name: string, max = 18): string {
    return name.length > max ? name.slice(0, max - 1) + '…' : name;
  }

  trackDay(_: number, d: CalendarDay): string {
    return d.key;
  }

  trackWeek(i: number): number {
    return i;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.selectedDayKey() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.selectedDayKey.set(null);
    }
  }

  private buildDay(
    date: Date,
    dayNumber: number,
    inCurrentMonth: boolean,
    today: Date,
    historyByDate: Map<string, WorkoutHistory[]>,
  ): CalendarDay {
    const key = this.dateKey(date);
    return {
      date,
      dayNumber,
      inCurrentMonth,
      isToday: this.startOfDay(date).getTime() === today.getTime(),
      workouts: historyByDate.get(key) ?? [],
      key,
    };
  }

  private groupHistoryByDate(history: WorkoutHistory[]): Map<string, WorkoutHistory[]> {
    const map = new Map<string, WorkoutHistory[]>();
    for (const h of history) {
      const d = new Date(h.completedAt);
      const key = this.dateKey(d);
      const list = map.get(key) ?? [];
      list.push(h);
      map.set(key, list);
    }
    return map;
  }

  private dateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}

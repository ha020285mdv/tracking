import { Component, DestroyRef, inject, signal } from '@angular/core';
import { WorkoutService } from '../../services/workout.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, take } from 'rxjs';
import { Calendar } from './calendar/calendar';
import { UserWidget } from './user-widget/user-widget';
import { WorkoutItem } from '../../components/workout-item/workout-item';
import { Router, RouterLink } from '@angular/router';
import { Workout } from '../../models/workout.model';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-landing-page',
  imports: [Calendar, UserWidget, WorkoutItem, RouterLink, ConfirmDialog],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);

  private readonly workoutsLimit = 10; // TODO: make it configurable by user

  protected readonly workouts = toSignal(
    this.workoutService.getFavoriteWorkouts$(this.workoutsLimit).pipe(
      // TODO: handle errors
      catchError((error) => {
        console.error('Error fetching favorite workouts', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef),
    ),
    { initialValue: [] },
  );

  protected readonly isThereActiveSession = toSignal(
    this.workoutService.activeSession$.pipe(map((session) => !!session)),
    {
      initialValue: false,
    },
  );

  // Delete confirmation dialog state
  protected readonly isDeleteDialogOpen = signal(false);
  protected readonly workoutToDelete = signal<Workout | null>(null);
  protected readonly isDeleting = signal(false);

  public onMakeFavorite(workout: Workout) {
    this.workoutService.toggleFavorite$(workout.id).subscribe({
      next: () => {
        // favorites stream will auto-refresh via toggleFavorite$ tap
      },
      error: (err) => console.error('Failed toggling favorite', err),
    });
  }

  public onEdit(workout: Workout) {
    this.router.navigate(['/workouts', workout.id, 'edit']);
  }

  public onDelete(workout: Workout) {
    this.workoutToDelete.set(workout);
    this.isDeleteDialogOpen.set(true);
  }

  public onConfirmDelete() {
    const workout = this.workoutToDelete();
    if (!workout) return;

    this.isDeleting.set(true);
    this.workoutService
      .deleteWorkout$(workout.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isDeleteDialogOpen.set(false);
          this.workoutToDelete.set(null);
          this.isDeleting.set(false);
        },
        error: (err) => {
          console.error('Failed to delete workout', err);
          this.isDeleting.set(false);
        },
      });
  }

  public onCancelDelete() {
    this.isDeleteDialogOpen.set(false);
    this.workoutToDelete.set(null);
  }
}

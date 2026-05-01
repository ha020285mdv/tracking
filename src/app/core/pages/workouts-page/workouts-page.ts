import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WorkoutItem } from '../../components/workout-item/workout-item';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { WorkoutService } from '../../services/workout.service';
import { catchError, of, take } from 'rxjs';
import { Workout } from '../../models/workout.model';

@Component({
  selector: 'app-workouts',
  imports: [WorkoutItem, ConfirmDialog, RouterLink],
  templateUrl: './workouts-page.html',
  styleUrl: './workouts-page.scss',
})
export class WorkoutsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);

  protected readonly workouts = toSignal(
    this.workoutService.getWorkoutsByUserId$().pipe(
      // TODO: handle errors
      catchError((error) => {
        console.error('Error fetching workouts', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef),
    ),
    { initialValue: [] },
  );

  // Delete confirmation dialog state
  protected readonly isDeleteDialogOpen = signal(false);
  protected readonly workoutToDelete = signal<Workout | null>(null);
  protected readonly isDeleting = signal(false);

  public onMakeFavorite(workout: Workout) {
    this.workoutService.toggleFavorite$(workout.id).subscribe({
      next: () => {
        // workouts and favorites streams will auto-refresh via toggleFavorite$ tap
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

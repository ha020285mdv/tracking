import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workout } from '../../models/workout.model';
import { map, take } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';
import { WorkoutService } from '../../services/workout.service';
import { HttpStatusCode } from '@angular/common/http';
import { MenuService } from '../../services/menu.service';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-workout-page',
  imports: [ExerciseCard, ConfirmDialog],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.scss',
})
export class WorkoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);
  private readonly menuService = inject(MenuService);

  protected readonly workout = toSignal<Workout | null>(
    this.route.data.pipe(map((data) => data['workout'] as Workout | null)),
    { initialValue: null },
  );

  protected readonly isThereActiveSession = toSignal(
    this.workoutService.activeSession$.pipe(map((session) => !!session)),
    {
      initialValue: false,
    },
  );

  // Menu state
  protected readonly isMenuOpen = toSignal(
    this.menuService.current$.pipe(map((id) => id === 'workout-page-menu')),
    { initialValue: false },
  );

  // Delete confirmation dialog state
  protected readonly isDeleteDialogOpen = signal(false);
  protected readonly isDeleting = signal(false);

  onToggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuService.toggle('workout-page-menu');
  }

  onMakeFavorite(event: Event): void {
    event.stopPropagation();
    const workout = this.workout();
    if (!workout) return;

    this.workoutService
      .toggleFavorite$(workout.id)
      .pipe(take(1))
      .subscribe({
        error: (err) => console.error('Failed toggling favorite', err),
      });
    this.menuService.close();
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    const workout = this.workout();
    if (!workout) return;

    this.router.navigate(['/workouts', workout.id, 'edit']);
    this.menuService.close();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.menuService.close();
    this.isDeleteDialogOpen.set(true);
  }

  onConfirmDelete(): void {
    const workout = this.workout();
    if (!workout) return;

    this.isDeleting.set(true);
    this.workoutService
      .deleteWorkout$(workout.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isDeleteDialogOpen.set(false);
          this.isDeleting.set(false);
          this.router.navigate(['/workouts']);
        },
        error: (err) => {
          console.error('Failed to delete workout', err);
          this.isDeleting.set(false);
        },
      });
  }

  onCancelDelete(): void {
    this.isDeleteDialogOpen.set(false);
  }

  onStartWorkout(): void {
    if (this.isThereActiveSession()) {
      return;
    }

    const templateId = this.workout()?.id;
    if (!templateId) {
      return;
    }

    this.workoutService
      .startWorkout$(templateId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigate(['/session']);
        },
        error: (error) => {
          // if there's already an active session (409), navigate to it
          if (error.status === HttpStatusCode.Conflict) {
            this.router.navigate(['/session']);
          } else {
            console.error('Error starting workout:', error);
          }
        },
      });
  }
}

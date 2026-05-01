import { Component, inject, OnInit, signal, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../models/workout.model';
import { Exercise, ExerciseType } from '../../models/exercise.model';
import { Status } from '../../enums/status.enum';
import { take } from 'rxjs';

type TimeUnit = 'sec' | 'min';

interface EditableExercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  type: ExerciseType;
  timeUnit: TimeUnit;
  sets: EditableSet[];
  isExpanded: boolean;
  userExpanded: boolean; // Track if user manually expanded
}

interface EditableSet {
  id: string;
  weight: number;
  reps: number;
  duration: number; // stored in seconds
  isRest: boolean;
}

@Component({
  selector: 'app-workout-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './workout-form-page.html',
  styleUrls: ['./workout-form-page.scss'],
})
export class WorkoutFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);
  private readonly elementRef = inject(ElementRef);

  protected readonly ExerciseType = ExerciseType;

  protected readonly isEditMode = signal(false);
  protected readonly workoutId = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly error = signal<string | null>(null);

  // Form fields
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly exercises = signal<EditableExercise[]>([]);

  // New exercise input
  protected readonly newExerciseName = signal('');
  protected readonly newExerciseType = signal<ExerciseType>(ExerciseType.Standard);

  // Available muscle groups
  protected readonly muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Legs',
    'Core',
    'Glutes',
    'Calves',
    'Forearms',
    'Full Body',
    'Cardio',
  ];

  // Computed: all target muscles from exercises
  protected readonly workoutTargetMuscles = computed(() => {
    const muscles = new Set<string>();
    this.exercises().forEach((e) => {
      e.targetMuscles.forEach((m) => muscles.add(m));
    });
    return Array.from(muscles);
  });

  protected readonly isFormValid = computed(() => {
    return this.name().trim().length > 0 && this.exercises().length > 0;
  });

  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Workout' : 'Create Workout',
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.workoutId.set(id);
      this.loadWorkout(id);
    }
  }

  private loadWorkout(id: string): void {
    this.isLoading.set(true);
    this.workoutService
      .getWorkoutById$(id)
      .pipe(take(1))
      .subscribe({
        next: (workout) => {
          this.name.set(workout.name);
          this.description.set(workout.description || '');
          this.exercises.set(
            workout.exercises.map((ex) => ({
              id: ex.id,
              name: ex.name,
              description: ex.description || '',
              targetMuscles: ex.targetMuscle ? [ex.targetMuscle] : [],
              type: ex.type || ExerciseType.Standard,
              timeUnit: 'sec' as TimeUnit,
              sets: ex.sets.map((s) => ({
                id: s.id,
                weight: s.weight ?? 0,
                reps: s.reps ?? 0,
                duration: s.duration ?? 0,
                isRest: false,
              })),
              isExpanded: false,
              userExpanded: false,
            })),
          );
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load workout');
          this.isLoading.set(false);
          console.error(err);
        },
      });
  }

  // Text normalization: capitalize first letter if it's a letter, trim multiple spaces
  protected normalizeText(text: string): string {
    // Trim and replace multiple spaces with single space
    let normalized = text.trim().replace(/\s+/g, ' ');
    // Capitalize first letter if it's a letter
    if (normalized.length > 0 && /^[a-zA-Z]/.test(normalized)) {
      normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
    return normalized;
  }

  protected onNameBlur(): void {
    this.name.set(this.normalizeText(this.name()));
  }

  protected onExerciseNameBlur(exerciseId: string): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId ? { ...e, name: this.normalizeText(e.name) } : e,
      ),
    );
  }

  protected addExercise(): void {
    const name = this.normalizeText(this.newExerciseName());
    if (!name) return;

    // Collapse all other exercises that weren't manually expanded
    const updatedExercises = this.exercises().map((e) => ({
      ...e,
      isExpanded: e.userExpanded,
    }));

    const newExercise: EditableExercise = {
      id: this.generateId(),
      name,
      description: '',
      targetMuscles: [],
      type: this.newExerciseType(),
      timeUnit: 'sec',
      sets: [],
      isExpanded: true,
      userExpanded: false,
    };

    this.exercises.set([...updatedExercises, newExercise]);
    this.newExerciseName.set('');
    this.newExerciseType.set(ExerciseType.Standard);

    // Focus the name input of the newly created exercise after DOM update
    setTimeout(() => {
      const nameInput = this.elementRef.nativeElement.querySelector(
        `[data-exercise-name="${newExercise.id}"]`,
      ) as HTMLInputElement | null;
      nameInput?.focus();
    }, 0);
  }

  protected removeExercise(exerciseId: string): void {
    this.exercises.set(this.exercises().filter((e) => e.id !== exerciseId));
  }

  protected toggleExerciseExpanded(exerciseId: string): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId ? { ...e, isExpanded: !e.isExpanded, userExpanded: !e.isExpanded } : e,
      ),
    );
  }

  protected updateExerciseDescription(exerciseId: string, description: string): void {
    this.exercises.set(
      this.exercises().map((e) => (e.id === exerciseId ? { ...e, description } : e)),
    );
  }

  protected toggleExerciseTargetMuscle(exerciseId: string, muscle: string): void {
    this.exercises.set(
      this.exercises().map((e) => {
        if (e.id !== exerciseId) return e;
        const current = e.targetMuscles;
        const newMuscles = current.includes(muscle)
          ? current.filter((m) => m !== muscle)
          : [...current, muscle];
        return { ...e, targetMuscles: newMuscles };
      }),
    );
  }

  protected updateExerciseTimeUnit(exerciseId: string, unit: TimeUnit): void {
    this.exercises.set(
      this.exercises().map((e) => (e.id === exerciseId ? { ...e, timeUnit: unit } : e)),
    );
  }

  protected updateExerciseName(exerciseId: string, name: string): void {
    this.exercises.set(this.exercises().map((e) => (e.id === exerciseId ? { ...e, name } : e)));
  }

  protected moveExerciseUp(index: number): void {
    if (index <= 0) return;
    const list = [...this.exercises()];
    const temp = list[index - 1]!;
    list[index - 1] = list[index]!;
    list[index] = temp;
    this.exercises.set(list);
  }

  protected moveExerciseDown(index: number): void {
    const list = this.exercises();
    if (index >= list.length - 1) return;
    const newList = [...list];
    const temp = newList[index]!;
    newList[index] = newList[index + 1]!;
    newList[index + 1] = temp;
    this.exercises.set(newList);
  }

  protected addSet(exerciseId: string): void {
    this.exercises.set(
      this.exercises().map((e) => {
        if (e.id !== exerciseId) return e;

        // Get defaults from last non-rest set or use defaults
        const lastSet = [...e.sets].reverse().find((s) => !s.isRest);
        const newSet: EditableSet =
          e.type === ExerciseType.Timed
            ? {
                id: this.generateId(),
                weight: 0,
                reps: 0,
                duration: lastSet?.duration ?? 60,
                isRest: false,
              }
            : {
                id: this.generateId(),
                weight: lastSet?.weight ?? 20,
                reps: lastSet?.reps ?? 10,
                duration: 0,
                isRest: false,
              };

        return { ...e, sets: [...e.sets, newSet], isExpanded: true };
      }),
    );
  }

  protected addRest(exerciseId: string): void {
    this.exercises.set(
      this.exercises().map((e) => {
        if (e.id !== exerciseId) return e;

        // Prevent consecutive rests - last item must not be a rest
        const lastSet = e.sets[e.sets.length - 1];
        if (lastSet?.isRest) return e;

        // Get defaults from last rest or use 30 seconds
        const lastRest = [...e.sets].reverse().find((s) => s.isRest);
        const newRest: EditableSet = {
          id: this.generateId(),
          weight: 0,
          reps: 0,
          duration: lastRest?.duration ?? 30,
          isRest: true,
        };

        return { ...e, sets: [...e.sets, newRest], isExpanded: true };
      }),
    );
  }

  // Check if rest can be added (last set must not be a rest)
  protected canAddRest(exercise: EditableExercise): boolean {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    return !lastSet?.isRest;
  }

  // Count only non-rest sets
  protected getSetCount(exercise: EditableExercise): number {
    return exercise.sets.filter((s) => !s.isRest).length;
  }

  // Count rest sets before the given index (for numbering)
  protected getRestCountBefore(exercise: EditableExercise, index: number): number {
    return exercise.sets.slice(0, index).filter((s) => s.isRest).length;
  }

  protected removeSet(exerciseId: string, setId: string): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
      ),
    );
  }

  protected updateSetWeight(exerciseId: string, setId: string, weight: number): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, weight: Math.max(0, weight) } : s)),
            }
          : e,
      ),
    );
  }

  protected updateSetReps(exerciseId: string, setId: string, reps: number): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, reps: Math.max(1, reps) } : s)),
            }
          : e,
      ),
    );
  }

  protected updateSetDuration(exerciseId: string, setId: string, duration: number): void {
    this.exercises.set(
      this.exercises().map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId ? { ...s, duration: Math.max(1, duration) } : s,
              ),
            }
          : e,
      ),
    );
  }

  protected setNoWeight(exerciseId: string, setId: string): void {
    this.updateSetWeight(exerciseId, setId, 0);
  }

  protected incrementWeight(exerciseId: string, setId: string, currentWeight: number): void {
    this.updateSetWeight(exerciseId, setId, currentWeight + 2.5);
  }

  protected decrementWeight(exerciseId: string, setId: string, currentWeight: number): void {
    this.updateSetWeight(exerciseId, setId, Math.max(0, currentWeight - 2.5));
  }

  protected incrementReps(exerciseId: string, setId: string, currentReps: number): void {
    this.updateSetReps(exerciseId, setId, currentReps + 1);
  }

  protected decrementReps(exerciseId: string, setId: string, currentReps: number): void {
    this.updateSetReps(exerciseId, setId, Math.max(1, currentReps - 1));
  }

  protected incrementDuration(
    exerciseId: string,
    setId: string,
    currentDuration: number,
    unit: TimeUnit,
  ): void {
    const increment = unit === 'min' ? 5 * 60 : 5;
    this.updateSetDuration(exerciseId, setId, currentDuration + increment);
  }

  protected decrementDuration(
    exerciseId: string,
    setId: string,
    currentDuration: number,
    unit: TimeUnit,
  ): void {
    const decrement = unit === 'min' ? 5 * 60 : 5;
    const min = unit === 'min' ? 60 : 5;
    this.updateSetDuration(exerciseId, setId, Math.max(min, currentDuration - decrement));
  }

  protected formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  protected getDurationInUnit(seconds: number, unit: TimeUnit): number {
    return unit === 'min' ? Math.round(seconds / 60) : seconds;
  }

  protected setDurationFromUnit(
    exerciseId: string,
    setId: string,
    value: number,
    unit: TimeUnit,
  ): void {
    const seconds = unit === 'min' ? value * 60 : value;
    this.updateSetDuration(exerciseId, setId, seconds);
  }

  protected onSave(): void {
    if (!this.isFormValid()) return;

    this.isSaving.set(true);
    this.error.set(null);

    const exercises: Exercise[] = this.exercises().map((e) => {
      // Filter out rest sets for now (we'll handle them separately in the model later if needed)
      const workoutSets = e.sets.filter((s) => !s.isRest);

      const exercise: Exercise = {
        id: e.id,
        name: this.normalizeText(e.name),
        type: e.type,
        sets: workoutSets.map((s) => {
          if (e.type === ExerciseType.Timed) {
            return {
              id: s.id,
              duration: s.duration,
              status: Status.NotStarted,
            };
          }
          return {
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            status: Status.NotStarted,
          };
        }),
      };
      if (e.description.trim()) exercise.description = e.description.trim();
      // Use first target muscle for backward compatibility
      const firstMuscle = e.targetMuscles[0];
      if (firstMuscle) exercise.targetMuscle = firstMuscle;
      return exercise;
    });

    if (this.isEditMode() && this.workoutId()) {
      // Update existing workout
      const updates: Parameters<typeof this.workoutService.updateWorkout$>[1] = {
        name: this.normalizeText(this.name()),
        exercises,
      };
      const desc = this.description().trim();
      if (desc) updates.description = desc;

      this.workoutService
        .updateWorkout$(this.workoutId()!, updates)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/workouts']);
          },
          error: (err) => {
            this.error.set('Failed to update workout');
            this.isSaving.set(false);
            console.error(err);
          },
        });
    } else {
      // Create new workout
      const workout: Partial<Workout> = {
        name: this.normalizeText(this.name()),
        exercises,
      };
      const desc = this.description().trim();
      if (desc) workout.description = desc;

      this.workoutService
        .createWorkout$(workout as Workout)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/workouts']);
          },
          error: (err) => {
            this.error.set('Failed to create workout');
            this.isSaving.set(false);
            console.error(err);
          },
        });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}

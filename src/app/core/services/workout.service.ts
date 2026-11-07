import { BehaviorSubject, Observable, tap, switchMap, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Workout } from '../models/workout.model';
import { ExerciseSet } from '../models/exercise-set.model';
import { ActiveSession } from '../models/active-session.model';
import { WorkoutHistory } from '../models/workout-history.model';
import { Status } from '../enums/status.enum';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private http = inject(HttpClient);

  private readonly _activeSession$ = new BehaviorSubject<ActiveSession | null>(null);
  public readonly activeSession$ = this._activeSession$.asObservable();

  // Track if a timed exercise timer is currently running (exerciseId or null)
  private readonly _timerRunningForExercise$ = new BehaviorSubject<string | null>(null);
  public readonly timerRunningForExercise$ = this._timerRunningForExercise$.asObservable();

  setTimerRunning(exerciseId: string | null): void {
    this._timerRunningForExercise$.next(exerciseId);
  }

  isTimerRunning(): boolean {
    return this._timerRunningForExercise$.getValue() !== null;
  }

  getRunningTimerExerciseId(): string | null {
    return this._timerRunningForExercise$.getValue();
  }

  // trigger to refresh favorites list after changes
  private readonly favRefresh$ = new BehaviorSubject<void>(undefined);
  // trigger to refresh general workouts list after changes
  private readonly workoutsRefresh$ = new BehaviorSubject<void>(undefined);

  setActiveSession(session: ActiveSession | null): void {
    this._activeSession$.next(session);
  }

  clearActiveSession(): void {
    this._activeSession$.next(null);
  }

  createWorkout$(workout: Workout): Observable<Workout> {
    return this.http
      .post<Workout>(`${environment.firebaseApiBase}/workouts`, workout)
      .pipe(tap(() => this.workoutsRefresh$.next()));
  }

  updateWorkout$(
    workoutId: string,
    updates: Partial<Pick<Workout, 'name' | 'description' | 'exercises'>>,
  ): Observable<Workout> {
    return this.http
      .patch<Workout>(`${environment.firebaseApiBase}/workouts/${workoutId}`, updates)
      .pipe(
        tap(() => {
          this.workoutsRefresh$.next();
          this.favRefresh$.next();
        }),
      );
  }

  deleteWorkout$(workoutId: string): Observable<{ message: string; workout: Workout }> {
    return this.http
      .delete<{
        message: string;
        workout: Workout;
      }>(`${environment.firebaseApiBase}/workouts/${workoutId}`)
      .pipe(
        tap(() => {
          this.workoutsRefresh$.next();
          this.favRefresh$.next();
        }),
      );
  }

  getWorkoutById$(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${environment.firebaseApiBase}/workouts/${id}`);
  }

  getWorkoutsByUserId$(limit?: number): Observable<Workout[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.workoutsRefresh$.pipe(
      switchMap(() =>
        this.http.get<Workout[]>(`${environment.firebaseApiBase}/workouts`, { params }),
      ),
    );
  }

  getFavoriteWorkouts$(limit?: number): Observable<Workout[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    // Interceptor automatically adds auth header
    return this.favRefresh$.pipe(
      switchMap(() =>
        this.http.get<Workout[]>(`${environment.firebaseApiBase}/workouts/favorites`, { params }),
      ),
    );
  }

  toggleFavorite$(workoutId: string): Observable<Workout> {
    // Interceptor automatically adds auth header
    return this.http
      .post<Workout>(`${environment.firebaseApiBase}/workouts/${workoutId}/favorite`, {})
      .pipe(
        tap(() => {
          this.favRefresh$.next();
          this.workoutsRefresh$.next();
        }),
      );
  }

  // Public helper to force a refresh of the favorites stream
  refreshFavorites(): void {
    this.favRefresh$.next();
  }

  // Public helper to force a refresh of the workouts stream
  refreshWorkouts(): void {
    this.workoutsRefresh$.next();
  }

  startWorkout$(templateId: string): Observable<ActiveSession> {
    return this.http
      .post<ActiveSession>(`${environment.firebaseApiBase}/sessions/start`, {
        templateId,
      })
      .pipe(tap((session) => this._activeSession$.next(session)));
  }

  finishWorkout$(sessionId: string, notes?: string): Observable<WorkoutHistory> {
    return this.http
      .post<WorkoutHistory>(`${environment.firebaseApiBase}/sessions/${sessionId}/finish`, {
        notes,
      })
      .pipe(tap(() => this._activeSession$.next(null)));
  }

  getActiveSession$(): Observable<ActiveSession | null> {
    return this.http
      .get<ActiveSession | null>(`${environment.firebaseApiBase}/sessions/active`)
      .pipe(tap((session) => this._activeSession$.next(session)));
  }

  activateSet(sessionId: string, exerciseId: string, setId: string): Observable<ActiveSession> {
    return this.http
      .post<ActiveSession>(`${environment.firebaseApiBase}/sessions/${sessionId}/activate-set`, {
        exerciseId,
        setId,
      })
      .pipe(tap((session) => this._activeSession$.next(session)));
  }

  completeSet(sessionId: string, exerciseId: string, set: ExerciseSet): Observable<ActiveSession> {
    return this.http
      .post<ActiveSession>(`${environment.firebaseApiBase}/sessions/${sessionId}/complete-set`, {
        exerciseId,
        set,
      })
      .pipe(tap((session) => this._activeSession$.next(session)));
  }

  /**
   * Complete a set and automatically activate the next pending set.
   * Looks for next pending set in current exercise, then in subsequent exercises.
   */
  completeSetAndActivateNext(
    sessionId: string,
    exerciseId: string,
    set: ExerciseSet,
  ): Observable<ActiveSession> {
    return this.completeSet(sessionId, exerciseId, set).pipe(
      switchMap((session) => {
        const nextSet = this.findNextPendingSet(session, exerciseId);
        if (nextSet) {
          return this.activateSet(sessionId, nextSet.exerciseId, nextSet.setId);
        }
        return of(session);
      }),
    );
  }

  /**
   * Find the next pending set to activate after completing a set.
   * First looks in the current exercise, then in subsequent exercises.
   * Only considers sets that are Pending (not Completed or Active).
   */
  private findNextPendingSet(
    session: ActiveSession,
    currentExerciseId: string,
  ): { exerciseId: string; setId: string } | null {
    const exercises = session.currentState;
    const currentExerciseIndex = exercises.findIndex((e) => e.id === currentExerciseId);

    if (currentExerciseIndex === -1) return null;

    // First, look for next pending set in current exercise
    const currentExercise = exercises[currentExerciseIndex];
    if (currentExercise) {
      for (const set of currentExercise.sets) {
        // Only activate sets that are still pending (not completed, not already active)
        if (set.status === Status.Pending) {
          return { exerciseId: currentExercise.id, setId: set.id };
        }
      }
    }

    // Then look in subsequent exercises
    for (let i = currentExerciseIndex + 1; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (exercise) {
        for (const set of exercise.sets) {
          if (set.status === Status.Pending) {
            return { exerciseId: exercise.id, setId: set.id };
          }
        }
      }
    }

    // If nothing found after current exercise, look from the beginning
    // (in case user skipped sets earlier)
    for (let i = 0; i < currentExerciseIndex; i++) {
      const exercise = exercises[i];
      if (exercise) {
        for (const set of exercise.sets) {
          if (set.status === Status.Pending) {
            return { exerciseId: exercise.id, setId: set.id };
          }
        }
      }
    }

    return null;
  }

  deactivateOtherSets(sessionId: string, exceptExerciseId: string): Observable<ActiveSession> {
    return this.http
      .post<ActiveSession>(
        `${environment.firebaseApiBase}/sessions/${sessionId}/deactivate-others`,
        {
          exceptExerciseId,
        },
      )
      .pipe(tap((session) => this._activeSession$.next(session)));
  }

  getWorkoutHistory$(options?: {
    limit?: number;
    from?: string;
    to?: string;
  }): Observable<WorkoutHistory[]> {
    let params = new HttpParams();
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.from) {
      params = params.set('from', options.from);
    }
    if (options?.to) {
      params = params.set('to', options.to);
    }
    return this.http.get<WorkoutHistory[]>(`${environment.firebaseApiBase}/history`, { params });
  }

  getWorkoutHistoryById$(historyId: string): Observable<WorkoutHistory> {
    return this.http.get<WorkoutHistory>(`${environment.firebaseApiBase}/history/${historyId}`);
  }
}

import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Workout } from '../models/workout.model';
import { ExerciseSet } from '../models/exercise-set.model';
import { ActiveSession } from '../models/active-session.model';
import { WorkoutHistory } from '../models/workout-history.model';

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

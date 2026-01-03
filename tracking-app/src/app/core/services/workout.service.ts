import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  ///    WORKOUT TEMPLATES ///
  // TODO: maybe delete?
  private readonly _currentWorkout$ = new BehaviorSubject<Workout | null>(null);

  // used
  get currentWorkout$(): Observable<Workout | null> {
    return this._currentWorkout$.asObservable();
  }

  createWorkout$(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(`${environment.firebaseApiBase}/workouts`, workout);
  }

  getWorkoutById$(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${environment.firebaseApiBase}/workouts/${id}`);
  }

  /*    
  getWorkoutsByUserId$(userId: string): Observable<Workout> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Workout>(`${environment.firebaseApiBase}/workouts`, { params });
  }
   */

  getWorkoutsByUserId$(userId: string, limit?: number): Observable<Workout[]> {
    let params = new HttpParams().set('userId', userId);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<Workout[]>(`${environment.firebaseApiBase}/workouts`, { params });
  }

  refreshCurrentWorkout(workoutId: string): Observable<Workout> {
    return this.getWorkoutById$(workoutId).pipe(
      tap((workout) => this._currentWorkout$.next(workout))
    );
  }

  //used
  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout$.next(workout);
  }

  ///    SESSIONS TEMPLATES ///
  // Start workout
  startWorkout$(userId: string, templateId: string): Observable<ActiveSession> {
    return this.http.post<ActiveSession>(`${environment.firebaseApiBase}/sessions/start`, {
      userId,
      templateId,
    });
  }

  // Get active session
  getActiveSession$(userId: string): Observable<ActiveSession | null> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ActiveSession | null>(`${environment.firebaseApiBase}/sessions/active`, {
      params,
    });
  }

  //used
  activateSet(sessionId: string, exerciseId: string, setId: string): Observable<ActiveSession> {
    return this.http.post<ActiveSession>(
      `${environment.firebaseApiBase}/sessions/${sessionId}/activate-set`,
      { exerciseId, setId }
    );
  }

  //used
  completeSet(sessionId: string, exerciseId: string, set: ExerciseSet): Observable<ActiveSession> {
    return this.http.post<ActiveSession>(
      `${environment.firebaseApiBase}/sessions/${sessionId}/complete-set`,
      { exerciseId, set }
    );
  }

  // Finish workout
  finishWorkout$(sessionId: string, notes?: string): Observable<WorkoutHistory> {
    return this.http.post<WorkoutHistory>(
      `${environment.firebaseApiBase}/sessions/${sessionId}/finish`,
      { notes }
    );
  }

  ///    SESSIONS TEMPLATES ///
  // Get workout history
  getWorkoutHistory$(userId: string, limit?: number): Observable<WorkoutHistory[]> {
    let params = new HttpParams().set('userId', userId);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<WorkoutHistory[]>(`${environment.firebaseApiBase}/history`, { params });
  }
}

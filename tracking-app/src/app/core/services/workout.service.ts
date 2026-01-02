import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Workout } from '../models/workout.model';
import { ExerciseSet } from '../models/exercise-set.model';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private http = inject(HttpClient);

  // TODO: maybe delete?
  private readonly _currentWorkout$ = new BehaviorSubject<Workout | null>(null);

  get currentWorkout$(): Observable<Workout | null> {
    return this._currentWorkout$.asObservable();
  }

  createWorkout$(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(`${environment.firebaseApiBase}/workouts`, workout);
  }

  getWorkoutById$(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${environment.firebaseApiBase}/workouts/${id}`);
  }

  getWorkoutsByUserId$(userId: string): Observable<Workout> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Workout>(`${environment.firebaseApiBase}/workouts`, { params });
  }

  activateSet(workoutId: string, exerciseId: string, setId: string): Observable<Workout> {
    return this.http.post<Workout>(
      `${environment.firebaseApiBase}/workouts/${workoutId}/activate-set`,
      { exerciseId, setId }
    );
  }

  completeSet(workoutId: string, exerciseId: string, set: ExerciseSet): Observable<Workout> {
    return this.http.post<Workout>(
      `${environment.firebaseApiBase}/workouts/${workoutId}/complete-set`,
      { exerciseId, set }
    );
  }

  refreshCurrentWorkout(workoutId: string): Observable<Workout> {
    return this.getWorkoutById$(workoutId).pipe(
      tap((workout) => this._currentWorkout$.next(workout))
    );
  }

  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout$.next(workout);
  }
}

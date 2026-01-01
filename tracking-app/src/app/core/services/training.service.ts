import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TrainingModel } from '../models/training.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private http = inject(HttpClient);

  createTraining$(training: TrainingModel): Observable<TrainingModel> {
    return this.http.post<TrainingModel>(`${environment.firebaseApiBase}/trainings`, training);
  }

  getTrainingById$(id: string): Observable<TrainingModel> {
    return this.http.get<TrainingModel>(`${environment.firebaseApiBase}/training/${id}`);
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrainingService } from './core/services/training.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  trainingService = inject(TrainingService);

  protected readonly title = signal('tracking-app');

  constructor() {
    /*  this.trainingService
      .createTraining$({
        userId: '000001',
        trainingId: '1',
        state: TrainingState.NOT_STARTED,
        startedAt: new Date().toISOString(),
      })
      .subscribe(
        (training) => console.log('Fetched training:', training),
        (error) => console.error('Error fetching training:', error)
      ); */
  }
}

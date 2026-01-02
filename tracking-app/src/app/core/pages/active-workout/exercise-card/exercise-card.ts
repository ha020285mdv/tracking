import { Component, input } from '@angular/core';
import { Exercise } from '../../../models/exercise.model';
import { SetCardActive } from './set-card-active/set-card-active';
import { SetCard } from './set-card/set-card';
import { Status } from '../../../enums/status.enum';
import { ExerciseSet } from '../../../models/exercise-set.model';

@Component({
  selector: 'app-exercise-card',
  imports: [SetCardActive, SetCard],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.scss',
})
export class ExerciseCard {
  public readonly status = Status;
  public readonly exercise = input.required<Exercise>();

  onSetActivate($event: ExerciseSet) {
    console.log('Activate set', $event);
  }
  onSetComplete($event: ExerciseSet) {
    console.log('Complete set', $event);
  }
}

import { Component, input, output } from '@angular/core';
import { ExerciseSet } from '../../../models/exercise-set.model';
import { Status } from '../../../enums/status.enum';

@Component({
  selector: 'app-set-card',
  imports: [],
  templateUrl: './set-card.html',
  styleUrl: './set-card.scss',
})
export class SetCard {
  public readonly status = Status;

  public readonly index = input.required<number>();
  public readonly set = input.required<ExerciseSet>();

  public readonly activate = output<ExerciseSet>();

  public activateSet() {
    if (this.set().status === Status.Completed) {
      return;
    }
    this.activate.emit(this.set());
  }
}

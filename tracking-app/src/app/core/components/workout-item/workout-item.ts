import { Component, computed, input } from '@angular/core';
import { Workout } from '../../models/workout.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workout-item',
  imports: [RouterLink],
  templateUrl: './workout-item.html',
  styleUrl: './workout-item.scss',
})
export class WorkoutItem {
  public readonly workout = input.required<Workout>();

  public readonly exerciseCount = computed(() => this.workout().exercises.length);
  public readonly setsCount = computed(() =>
    this.workout().exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0)
  );
}

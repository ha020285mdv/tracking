import { Exercise } from './exercise.model';

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

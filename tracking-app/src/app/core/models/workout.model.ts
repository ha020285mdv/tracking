import { Exercise } from './exercise.model';

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

import { ExerciseSet } from './exercise-set.model';

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

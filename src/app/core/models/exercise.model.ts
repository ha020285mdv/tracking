import { ExerciseSet } from './exercise-set.model';

export enum ExerciseType {
  Standard = 'standard',
  Timed = 'timed',
}

export interface Exercise {
  id: string;
  name: string;
  /** Optional description for the exercise */
  description?: string;
  /** Target body part for this exercise */
  targetMuscle?: string;
  /** Type of exercise: standard (weight/reps) or timed (duration) */
  type: ExerciseType;
  sets: ExerciseSet[];
}

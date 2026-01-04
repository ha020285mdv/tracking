import { Exercise } from './exercise.model';

export interface Workout {
  id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

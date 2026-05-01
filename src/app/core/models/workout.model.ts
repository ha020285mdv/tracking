import { Exercise } from './exercise.model';

export interface Workout {
  id: string;
  userId: string;
  name: string;
  /** Text description of the workout */
  description?: string;
  /** whether the workout is marked as favorite by the user */
  favorite?: boolean;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp - null if not deleted */
  deletedAt?: string | null;
}

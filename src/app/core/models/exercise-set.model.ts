import { Status } from '../enums/status.enum';

export interface ExerciseSet {
  id: string;
  /** Weight in kg (for standard exercises) */
  weight?: number;
  /** Number of reps (for standard exercises) */
  reps?: number;
  /** Duration in seconds (for timed exercises) */
  duration?: number;
  status: Status;
}

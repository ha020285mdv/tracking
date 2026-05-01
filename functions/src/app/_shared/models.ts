export interface WorkoutDto {
  id: string;
  userId: string;
  name: string;
  /** Text description of the workout */
  description?: string;
  /** whether the workout is marked as favorite by the user */
  favorite?: boolean;
  exercises: ExerciseDto[];
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp - null if not deleted */
  deletedAt?: string | null;
}

export enum ExerciseType {
  Standard = 'standard',
  Timed = 'timed',
}

export interface ExerciseDto {
  id: string;
  name: string;
  /** Optional description for the exercise */
  description?: string;
  /** Target body part for this exercise */
  targetMuscle?: string;
  /** Type of exercise: standard (weight/reps) or timed (duration) */
  type: ExerciseType;
  sets: ExerciseSetDto[];
}

export interface ExerciseSetDto {
  id: string;
  /** Weight in kg (for standard exercises) */
  weight?: number;
  /** Number of reps (for standard exercises) */
  reps?: number;
  /** Duration in seconds (for timed exercises) */
  duration?: number;
  status: StatusEnum;
}

export enum StatusEnum {
  NotStarted = 'not-started',
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
}

// Active workout session
export interface ActiveSessionDto {
  id: string;
  userId: string;
  templateId: string; // reference to original workout
  templateSnapshot: {
    name: string;
    exercises: ExerciseDto[];
  };
  currentState: ExerciseDto[]; // modified version during workout
  startedAt: string;
  lastModifiedAt: string;
  expiresAt: string; // auto-cleanup after 24h
}

// Completed workout history
export interface WorkoutHistoryDto {
  id: string;
  userId: string;
  templateId: string;
  sessionId: string;
  name: string;
  exercises: ExerciseDto[]; // final state
  startedAt: string;
  completedAt: string;
  duration: number; // milliseconds
  notes?: string;
}

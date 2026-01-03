export interface WorkoutDto {
  id: string;
  userId: string;
  name: string;
  exercises: ExerciseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseDto {
  id: string;
  name: string;
  sets: ExerciseSetDto[];
}

export interface ExerciseSetDto {
  id: string;
  weight: number;
  reps: number;
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

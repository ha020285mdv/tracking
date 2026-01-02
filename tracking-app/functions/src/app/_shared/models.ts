export interface WorkoutDto {
  id: string;
  name: string;
  exercises: ExerciseDto[];
}

export interface ExerciseDto {
  id: string;
  name: string;
  sets: ExerciseSetDto[];
}

export interface ExerciseSetDto {
  id: string;
  weight: number | null;
  reps: number;
  status: StatusEnum;
}

export enum StatusEnum {
  Completed = 'completed',
  Pending = 'pending',
  Active = 'active',
}

import { Status } from "../enums/status.enum";

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  status: Status;
}
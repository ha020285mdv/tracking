import { Status } from "../enums/status.enum";

export interface ExerciseSet {
  id: number;
  weight: number | null;
  reps: number;
  status: Status;
}
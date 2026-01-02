import { Status } from "../enums/status.enum";

export interface ExerciseSet {
  id: string;
  weight: number | null;
  reps: number;
  status: Status;
}
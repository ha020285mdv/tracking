import { Status } from "../enums/status.enum";

export interface TrainingModel {
  userId: string;
  trainingId: string;
  status: Status;
  startedAt: string;
}

import { TrainingState } from '../enums/training-state.enum';

export interface TrainingModel {
  userId: string;
  trainingId: string;
  state: TrainingState;
  startedAt: string;
}

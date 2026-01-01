
export interface TrainingModelDto {
  userId: string;
  trainingId: string;
  state: TrainingStateDto;
  startedAt: string;
}

export enum TrainingStateDto {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
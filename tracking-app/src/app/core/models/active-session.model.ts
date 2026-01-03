import { Exercise } from './exercise.model';

export interface ActiveSession {
  id: string;
  userId: string;
  templateId: string;
  templateSnapshot: {
    name: string;
    exercises: Exercise[];
  };
  currentState: Exercise[];
  startedAt: string;
  lastModifiedAt: string;
  expiresAt: string;
}

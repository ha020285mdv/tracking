import { Exercise } from './exercise.model';

export interface WorkoutHistory {
  id: string;
  userId: string;
  templateId: string;
  sessionId: string;
  name: string;
  exercises: Exercise[];
  startedAt: string;
  completedAt: string;
  duration: number;
  notes?: string;
}

import { createTraining } from './training.repository';

export async function create(training: any) {
  if (!training.userId) {
    throw new Error('userId required');
  }

  return createTraining({
    ...training,
    createdAt: new Date().toISOString(),
  });
}

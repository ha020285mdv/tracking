import { db } from '../core/firebase/firebase.admin';
import { TrainingModelDto } from '../_shared/models';

export async function createTraining(training: TrainingModelDto) {
  const ref = await db.collection('trainings').add({
    ...training,
    createdAt: new Date().toISOString(), // always track creation time
  });
  return { id: ref.id, ...training };
}

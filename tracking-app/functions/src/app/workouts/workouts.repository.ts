import { db } from '../core/firebase/firebase.admin';
import { WorkoutDto, StatusEnum } from '../_shared/models';

export async function createWorkout(training: WorkoutDto): Promise<WorkoutDto> {
  const ref = await db.collection('workouts').add({
    ...training,
    createdAt: new Date().toISOString(),
  });
  return { ...training, id: ref.id };
}

export async function getWorkoutByUserId(userId: string, limit?: number): Promise<WorkoutDto[]> {
  let query = db.collection('workouts').where('userId', '==', userId);

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkoutDto));
}

export async function getWorkoutById(id: string) {
  const doc = await db.collection('workouts').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as WorkoutDto;
}

export async function activateSet(
  workoutId: string,
  exerciseId: string,
  setId: string
): Promise<WorkoutDto | null> {
  const docRef = db.collection('workouts').doc(workoutId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const workout = doc.data() as WorkoutDto;

  // Update all sets to pending, then set the target set to active
  const updatedExercises = workout.exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      status:
        exercise.id === exerciseId && set.id === setId
          ? StatusEnum.Active
          : set.status === StatusEnum.Active
          ? StatusEnum.Pending
          : set.status,
    })),
  }));

  await docRef.update({ exercises: updatedExercises });

  return { ...workout, id: doc.id, exercises: updatedExercises };
}

export async function completeSet(
  workoutId: string,
  exerciseId: string,
  completedSet: any
): Promise<WorkoutDto | null> {
  const docRef = db.collection('workouts').doc(workoutId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const workout = doc.data() as WorkoutDto;

  // Update the specific set with completed status and data
  const updatedExercises = workout.exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) =>
      exercise.id === exerciseId && set.id === completedSet.id
        ? { ...set, ...completedSet, status: StatusEnum.Completed }
        : set
    ),
  }));

  await docRef.update({ exercises: updatedExercises });

  return { ...workout, id: doc.id, exercises: updatedExercises };
}

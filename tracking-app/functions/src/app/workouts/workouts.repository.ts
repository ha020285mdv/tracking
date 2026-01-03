import { db } from '../core/firebase/firebase.admin';
import { WorkoutDto, StatusEnum, ActiveSessionDto, WorkoutHistoryDto } from '../_shared/models';

export async function createWorkout(training: WorkoutDto): Promise<WorkoutDto> {
  const now = new Date().toISOString();
  const ref = await db.collection('workouts').add({
    ...training,
    createdAt: now,
    updatedAt: now,
  });
  return { ...training, id: ref.id, createdAt: now, updatedAt: now };
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
  sessionId: string,
  exerciseId: string,
  setId: string
): Promise<ActiveSessionDto | null> {
  const docRef = db.collection('activeSessions').doc(sessionId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const session = doc.data() as ActiveSessionDto;

  // Update all sets to pending, then set the target set to active
  const updatedExercises = session.currentState.map((exercise) => ({
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

  const lastModifiedAt = new Date().toISOString();
  await docRef.update({
    currentState: updatedExercises,
    lastModifiedAt,
  });

  return {
    ...session,
    id: sessionId,
    currentState: updatedExercises,
    lastModifiedAt,
  };
}

export async function completeSet(
  sessionId: string,
  exerciseId: string,
  completedSet: any
): Promise<ActiveSessionDto | null> {
  const docRef = db.collection('activeSessions').doc(sessionId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const session = doc.data() as ActiveSessionDto;

  // Update the specific set with completed status and data
  const updatedExercises = session.currentState.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) =>
      exercise.id === exerciseId && set.id === completedSet.id
        ? { ...set, ...completedSet, status: StatusEnum.Completed }
        : set
    ),
  }));

  const lastModifiedAt = new Date().toISOString();
  await docRef.update({
    currentState: updatedExercises,
    lastModifiedAt,
  });

  return {
    ...session,
    id: sessionId,
    currentState: updatedExercises,
    lastModifiedAt,
  };
}

// ============= ACTIVE SESSIONS =============

export async function startWorkoutSession(
  userId: string,
  templateId: string
): Promise<ActiveSessionDto> {
  // Get the workout template
  const templateDoc = await db.collection('workouts').doc(templateId).get();

  if (!templateDoc.exists) {
    throw new Error('Workout template not found');
  }

  const template = templateDoc.data() as WorkoutDto;

  // Check if user already has an active session
  const existingSessions = await db
    .collection('activeSessions')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (!existingSessions.empty) {
    throw new Error('User already has an active workout session');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Convert NotStarted sets to Pending when starting workout
  const initialExercises = template.exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      status: set.status === StatusEnum.NotStarted ? StatusEnum.Pending : set.status,
    })),
  }));

  const activeSession: Omit<ActiveSessionDto, 'id'> = {
    userId,
    templateId,
    templateSnapshot: {
      name: template.name,
      exercises: template.exercises,
    },
    currentState: initialExercises,
    startedAt: now.toISOString(),
    lastModifiedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const ref = await db.collection('activeSessions').add(activeSession);

  return { ...activeSession, id: ref.id };
}

export async function getActiveSessionByUserId(userId: string): Promise<ActiveSessionDto | null> {
  const snapshot = await db
    .collection('activeSessions')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as ActiveSessionDto;
}

export async function getActiveSessionById(sessionId: string): Promise<ActiveSessionDto | null> {
  const doc = await db.collection('activeSessions').doc(sessionId).get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as ActiveSessionDto;
}

export async function updateActiveSession(
  sessionId: string,
  updates: Partial<Pick<ActiveSessionDto, 'currentState'>>
): Promise<ActiveSessionDto | null> {
  const docRef = db.collection('activeSessions').doc(sessionId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  await docRef.update({
    ...updates,
    lastModifiedAt: new Date().toISOString(),
  });

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as ActiveSessionDto;
}

// ============= WORKOUT HISTORY =============

export async function finishWorkoutSession(
  sessionId: string,
  notes?: string
): Promise<WorkoutHistoryDto> {
  const sessionDoc = await db.collection('activeSessions').doc(sessionId).get();

  if (!sessionDoc.exists) {
    throw new Error('Active session not found');
  }

  const session = sessionDoc.data() as ActiveSessionDto;
  const completedAt = new Date();
  const startedAt = new Date(session.startedAt);
  const duration = completedAt.getTime() - startedAt.getTime();

  // Convert Pending sets back to NotStarted in history
  const finalExercises = session.currentState.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      status: set.status === StatusEnum.Pending ? StatusEnum.NotStarted : set.status,
    })),
  }));

  // Create history record
  const historyRecord: Omit<WorkoutHistoryDto, 'id'> = {
    userId: session.userId,
    templateId: session.templateId,
    sessionId,
    name: session.templateSnapshot.name,
    exercises: finalExercises, // Final state with Pending converted to NotStarted
    startedAt: session.startedAt,
    completedAt: completedAt.toISOString(),
    duration,
    ...(notes !== undefined && { notes }),
  };

  // Use transaction to ensure both operations succeed
  const historyRef = db.collection('workoutHistory').doc();

  await db.runTransaction(async (transaction) => {
    // Create history record
    transaction.set(historyRef, historyRecord);

    // Delete active session
    transaction.delete(sessionDoc.ref);
  });

  return { ...historyRecord, id: historyRef.id };
}

export async function getWorkoutHistoryByUserId(
  userId: string,
  limit?: number
): Promise<WorkoutHistoryDto[]> {
  let query = db
    .collection('workoutHistory')
    .where('userId', '==', userId)
    .orderBy('completedAt', 'desc');

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkoutHistoryDto));
}

export async function getWorkoutHistoryById(historyId: string): Promise<WorkoutHistoryDto | null> {
  const doc = await db.collection('workoutHistory').doc(historyId).get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as WorkoutHistoryDto;
}

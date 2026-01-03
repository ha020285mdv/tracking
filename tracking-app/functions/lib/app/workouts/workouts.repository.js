"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkout = createWorkout;
exports.getWorkoutByUserId = getWorkoutByUserId;
exports.getWorkoutById = getWorkoutById;
exports.activateSet = activateSet;
exports.completeSet = completeSet;
exports.startWorkoutSession = startWorkoutSession;
exports.getActiveSessionByUserId = getActiveSessionByUserId;
exports.getActiveSessionById = getActiveSessionById;
exports.updateActiveSession = updateActiveSession;
exports.finishWorkoutSession = finishWorkoutSession;
exports.getWorkoutHistoryByUserId = getWorkoutHistoryByUserId;
exports.getWorkoutHistoryById = getWorkoutHistoryById;
const firebase_admin_1 = require("../core/firebase/firebase.admin");
const models_1 = require("../_shared/models");
async function createWorkout(training) {
    const now = new Date().toISOString();
    const ref = await firebase_admin_1.db.collection('workouts').add({
        ...training,
        createdAt: now,
        updatedAt: now,
    });
    return { ...training, id: ref.id, createdAt: now, updatedAt: now };
}
async function getWorkoutByUserId(userId, limit) {
    let query = firebase_admin_1.db.collection('workouts').where('userId', '==', userId);
    if (limit) {
        query = query.limit(limit);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
async function getWorkoutById(id) {
    const doc = await firebase_admin_1.db.collection('workouts').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}
async function activateSet(sessionId, exerciseId, setId) {
    const docRef = firebase_admin_1.db.collection('activeSessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const session = doc.data();
    // Update all sets to pending, then set the target set to active
    const updatedExercises = session.currentState.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({
            ...set,
            status: exercise.id === exerciseId && set.id === setId
                ? models_1.StatusEnum.Active
                : set.status === models_1.StatusEnum.Active
                    ? models_1.StatusEnum.Pending
                    : set.status,
        })),
    }));
    await docRef.update({
        currentState: updatedExercises,
        lastModifiedAt: new Date().toISOString(),
    });
    return { ...session, currentState: updatedExercises };
}
async function completeSet(sessionId, exerciseId, completedSet) {
    const docRef = firebase_admin_1.db.collection('activeSessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const session = doc.data();
    // Update the specific set with completed status and data
    const updatedExercises = session.currentState.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => exercise.id === exerciseId && set.id === completedSet.id
            ? { ...set, ...completedSet, status: models_1.StatusEnum.Completed }
            : set),
    }));
    await docRef.update({
        currentState: updatedExercises,
        lastModifiedAt: new Date().toISOString(),
    });
    return { ...session, currentState: updatedExercises };
}
// ============= ACTIVE SESSIONS =============
async function startWorkoutSession(userId, templateId) {
    // Get the workout template
    const templateDoc = await firebase_admin_1.db.collection('workouts').doc(templateId).get();
    if (!templateDoc.exists) {
        throw new Error('Workout template not found');
    }
    const template = templateDoc.data();
    // Check if user already has an active session
    const existingSessions = await firebase_admin_1.db
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
            status: set.status === models_1.StatusEnum.NotStarted ? models_1.StatusEnum.Pending : set.status,
        })),
    }));
    const activeSession = {
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
    const ref = await firebase_admin_1.db.collection('activeSessions').add(activeSession);
    return { ...activeSession, id: ref.id };
}
async function getActiveSessionByUserId(userId) {
    const snapshot = await firebase_admin_1.db
        .collection('activeSessions')
        .where('userId', '==', userId)
        .limit(1)
        .get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}
async function getActiveSessionById(sessionId) {
    const doc = await firebase_admin_1.db.collection('activeSessions').doc(sessionId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}
async function updateActiveSession(sessionId, updates) {
    const docRef = firebase_admin_1.db.collection('activeSessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    await docRef.update({
        ...updates,
        lastModifiedAt: new Date().toISOString(),
    });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
}
// ============= WORKOUT HISTORY =============
async function finishWorkoutSession(sessionId, notes) {
    const sessionDoc = await firebase_admin_1.db.collection('activeSessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
        throw new Error('Active session not found');
    }
    const session = sessionDoc.data();
    const completedAt = new Date();
    const startedAt = new Date(session.startedAt);
    const duration = completedAt.getTime() - startedAt.getTime();
    // Convert Pending sets back to NotStarted in history
    const finalExercises = session.currentState.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({
            ...set,
            status: set.status === models_1.StatusEnum.Pending ? models_1.StatusEnum.NotStarted : set.status,
        })),
    }));
    // Create history record
    const historyRecord = {
        userId: session.userId,
        templateId: session.templateId,
        sessionId,
        name: session.templateSnapshot.name,
        exercises: finalExercises, // Final state with Pending converted to NotStarted
        startedAt: session.startedAt,
        completedAt: completedAt.toISOString(),
        duration,
        notes,
    };
    // Use transaction to ensure both operations succeed
    const historyRef = firebase_admin_1.db.collection('workoutHistory').doc();
    await firebase_admin_1.db.runTransaction(async (transaction) => {
        // Create history record
        transaction.set(historyRef, historyRecord);
        // Delete active session
        transaction.delete(sessionDoc.ref);
    });
    return { ...historyRecord, id: historyRef.id };
}
async function getWorkoutHistoryByUserId(userId, limit) {
    let query = firebase_admin_1.db
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
async function getWorkoutHistoryById(historyId) {
    const doc = await firebase_admin_1.db.collection('workoutHistory').doc(historyId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

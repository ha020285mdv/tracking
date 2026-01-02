"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkout = createWorkout;
exports.getWorkoutByUserId = getWorkoutByUserId;
exports.getWorkoutById = getWorkoutById;
exports.activateSet = activateSet;
exports.completeSet = completeSet;
const firebase_admin_1 = require("../core/firebase/firebase.admin");
const models_1 = require("../_shared/models");
async function createWorkout(training) {
    const ref = await firebase_admin_1.db.collection('workouts').add({
        ...training,
        createdAt: new Date().toISOString(),
    });
    return { ...training, id: ref.id };
}
async function getWorkoutByUserId(userId) {
    const snapshot = await firebase_admin_1.db.collection('workouts').where('userId', '==', userId).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}
async function getWorkoutById(id) {
    const doc = await firebase_admin_1.db.collection('workouts').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}
async function activateSet(workoutId, exerciseId, setId) {
    const docRef = firebase_admin_1.db.collection('workouts').doc(workoutId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const workout = doc.data();
    // Update all sets to pending, then set the target set to active
    const updatedExercises = workout.exercises.map((exercise) => ({
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
    await docRef.update({ exercises: updatedExercises });
    return { ...workout, id: doc.id, exercises: updatedExercises };
}
async function completeSet(workoutId, exerciseId, completedSet) {
    const docRef = firebase_admin_1.db.collection('workouts').doc(workoutId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const workout = doc.data();
    // Update the specific set with completed status and data
    const updatedExercises = workout.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => exercise.id === exerciseId && set.id === completedSet.id
            ? { ...set, ...completedSet, status: models_1.StatusEnum.Completed }
            : set),
    }));
    await docRef.update({ exercises: updatedExercises });
    return { ...workout, id: doc.id, exercises: updatedExercises };
}

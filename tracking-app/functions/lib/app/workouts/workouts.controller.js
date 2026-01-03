"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSetHandler = exports.activateSetHandler = exports.getWorkoutByIdHandler = exports.getWorkoutByUserIdHandler = exports.createWorkoutHandler = void 0;
const workouts_repository_1 = require("./workouts.repository");
const createWorkoutHandler = async (req, res) => {
    try {
        const workout = req.body;
        const result = await (0, workouts_repository_1.createWorkout)(workout);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createWorkoutHandler = createWorkoutHandler;
const getWorkoutByUserIdHandler = async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const result = await (0, workouts_repository_1.getWorkoutByUserId)(userId, limit);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getWorkoutByUserIdHandler = getWorkoutByUserIdHandler;
const getWorkoutByIdHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await (0, workouts_repository_1.getWorkoutById)(id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getWorkoutByIdHandler = getWorkoutByIdHandler;
const activateSetHandler = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { exerciseId, setId } = req.body;
        const result = await (0, workouts_repository_1.activateSet)(workoutId, exerciseId, setId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.activateSetHandler = activateSetHandler;
const completeSetHandler = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { exerciseId, set } = req.body;
        const result = await (0, workouts_repository_1.completeSet)(workoutId, exerciseId, set);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.completeSetHandler = completeSetHandler;

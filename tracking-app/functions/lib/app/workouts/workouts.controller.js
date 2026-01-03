"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkoutHistoryByIdHandler = exports.getWorkoutHistoryHandler = exports.finishWorkoutHandler = exports.updateActiveSessionHandler = exports.getActiveSessionByIdHandler = exports.getActiveSessionHandler = exports.startWorkoutHandler = exports.completeSetHandler = exports.activateSetHandler = exports.getWorkoutByIdHandler = exports.getWorkoutByUserIdHandler = exports.createWorkoutHandler = void 0;
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
        const { sessionId } = req.params;
        const { exerciseId, setId } = req.body;
        const result = await (0, workouts_repository_1.activateSet)(sessionId, exerciseId, setId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.activateSetHandler = activateSetHandler;
const completeSetHandler = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { exerciseId, set } = req.body;
        const result = await (0, workouts_repository_1.completeSet)(sessionId, exerciseId, set);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.completeSetHandler = completeSetHandler;
// ============= ACTIVE SESSIONS =============
const startWorkoutHandler = async (req, res) => {
    try {
        const { userId, templateId } = req.body;
        if (!userId || !templateId) {
            return res.status(400).json({ error: 'userId and templateId are required' });
        }
        const result = await (0, workouts_repository_1.startWorkoutSession)(userId, templateId);
        res.status(201).json(result);
    }
    catch (err) {
        if (err.message.includes('already has an active')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};
exports.startWorkoutHandler = startWorkoutHandler;
const getActiveSessionHandler = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const result = await (0, workouts_repository_1.getActiveSessionByUserId)(userId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getActiveSessionHandler = getActiveSessionHandler;
const getActiveSessionByIdHandler = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await (0, workouts_repository_1.getActiveSessionById)(sessionId);
        if (!result) {
            return res.status(404).json({ error: 'Active session not found' });
        }
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getActiveSessionByIdHandler = getActiveSessionByIdHandler;
const updateActiveSessionHandler = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { currentState } = req.body;
        const result = await (0, workouts_repository_1.updateActiveSession)(sessionId, { currentState });
        if (!result) {
            return res.status(404).json({ error: 'Active session not found' });
        }
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateActiveSessionHandler = updateActiveSessionHandler;
// ============= WORKOUT HISTORY =============
const finishWorkoutHandler = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { notes } = req.body;
        const result = await (0, workouts_repository_1.finishWorkoutSession)(sessionId, notes);
        res.status(201).json(result);
    }
    catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};
exports.finishWorkoutHandler = finishWorkoutHandler;
const getWorkoutHistoryHandler = async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const result = await (0, workouts_repository_1.getWorkoutHistoryByUserId)(userId, limit);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getWorkoutHistoryHandler = getWorkoutHistoryHandler;
const getWorkoutHistoryByIdHandler = async (req, res) => {
    try {
        const { historyId } = req.params;
        const result = await (0, workouts_repository_1.getWorkoutHistoryById)(historyId);
        if (!result) {
            return res.status(404).json({ error: 'Workout history not found' });
        }
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getWorkoutHistoryByIdHandler = getWorkoutHistoryByIdHandler;

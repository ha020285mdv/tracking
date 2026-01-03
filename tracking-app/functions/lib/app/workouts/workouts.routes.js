"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingsApi = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("../_shared/auth");
const workouts_controller_1 = require("./workouts.controller");
exports.trainingsApi = (0, express_1.default)();
exports.trainingsApi.use((0, cors_1.default)({ origin: true }));
exports.trainingsApi.use(express_1.default.json());
exports.trainingsApi.get('/ping', (_req, res) => res.json({ ok: true }));
// Apply authentication middleware to all routes below
exports.trainingsApi.use(auth_1.authenticateUser);
// Workout Templates
exports.trainingsApi.post('/workouts', workouts_controller_1.createWorkoutHandler);
exports.trainingsApi.get('/workouts', workouts_controller_1.getWorkoutByUserIdHandler);
exports.trainingsApi.get('/workouts/:id', workouts_controller_1.getWorkoutByIdHandler);
// Active Sessions
exports.trainingsApi.post('/sessions/start', workouts_controller_1.startWorkoutHandler);
exports.trainingsApi.get('/sessions/active', workouts_controller_1.getActiveSessionHandler);
exports.trainingsApi.get('/sessions/:sessionId', workouts_controller_1.getActiveSessionByIdHandler);
exports.trainingsApi.patch('/sessions/:sessionId', workouts_controller_1.updateActiveSessionHandler);
exports.trainingsApi.post('/sessions/:sessionId/activate-set', workouts_controller_1.activateSetHandler);
exports.trainingsApi.post('/sessions/:sessionId/complete-set', workouts_controller_1.completeSetHandler);
exports.trainingsApi.post('/sessions/:sessionId/finish', workouts_controller_1.finishWorkoutHandler);
// Workout History
exports.trainingsApi.get('/history', workouts_controller_1.getWorkoutHistoryHandler);
exports.trainingsApi.get('/history/:historyId', workouts_controller_1.getWorkoutHistoryByIdHandler);

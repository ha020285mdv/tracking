"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingsApi = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const workouts_controller_1 = require("./workouts.controller");
exports.trainingsApi = (0, express_1.default)();
exports.trainingsApi.use((0, cors_1.default)({ origin: true }));
exports.trainingsApi.use(express_1.default.json());
exports.trainingsApi.get('/ping', (_req, res) => res.json({ ok: true }));
exports.trainingsApi.post('/workouts', workouts_controller_1.createWorkoutHandler);
exports.trainingsApi.get('/workouts', workouts_controller_1.getWorkoutByUserIdHandler);
exports.trainingsApi.get('/workouts/:id', workouts_controller_1.getWorkoutByIdHandler);
exports.trainingsApi.post('/workouts/:workoutId/activate-set', workouts_controller_1.activateSetHandler);
exports.trainingsApi.post('/workouts/:workoutId/complete-set', workouts_controller_1.completeSetHandler);

import express from 'express';
import cors from 'cors';
import {
  createWorkoutHandler,
  getWorkoutByUserIdHandler,
  getWorkoutByIdHandler,
  activateSetHandler,
  completeSetHandler
} from './workouts.controller';

export const trainingsApi = express();

trainingsApi.use(cors({ origin: true }));
trainingsApi.use(express.json());

trainingsApi.get('/ping', (_req, res) => res.json({ ok: true }));
trainingsApi.post('/workouts', createWorkoutHandler);
trainingsApi.get('/workouts', getWorkoutByUserIdHandler);
trainingsApi.get('/workouts/:id', getWorkoutByIdHandler);
trainingsApi.post('/workouts/:workoutId/activate-set', activateSetHandler);
trainingsApi.post('/workouts/:workoutId/complete-set', completeSetHandler);
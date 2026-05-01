import express from 'express';
import cors from 'cors';
import { authenticateUser } from '../_shared/auth';
import {
  createWorkoutHandler,
  getWorkoutByUserIdHandler,
  getWorkoutByIdHandler,
  updateWorkoutHandler,
  deleteWorkoutHandler,
  getFavoriteWorkoutsHandler,
  toggleFavoriteHandler,
  activateSetHandler,
  completeSetHandler,
  deactivateOtherSetsHandler,
  startWorkoutHandler,
  getActiveSessionHandler,
  getActiveSessionByIdHandler,
  updateActiveSessionHandler,
  finishWorkoutHandler,
  getWorkoutHistoryHandler,
  getWorkoutHistoryByIdHandler,
} from './workouts.controller';

export const trainingsApi = express();

trainingsApi.use(cors({ origin: true }));
trainingsApi.use(express.json());

trainingsApi.get('/ping', (_req, res) => res.json({ ok: true }));

// Apply authentication middleware to all routes below
trainingsApi.use(authenticateUser);

// Workout Templates
trainingsApi.post('/workouts', createWorkoutHandler);
trainingsApi.get('/workouts', getWorkoutByUserIdHandler);
trainingsApi.get('/workouts/favorites', getFavoriteWorkoutsHandler);
trainingsApi.get('/workouts/:id', getWorkoutByIdHandler);
trainingsApi.patch('/workouts/:id', updateWorkoutHandler);
trainingsApi.delete('/workouts/:id', deleteWorkoutHandler);
trainingsApi.post('/workouts/:id/favorite', toggleFavoriteHandler);

// Active Sessions
trainingsApi.post('/sessions/start', startWorkoutHandler);
trainingsApi.get('/sessions/active', getActiveSessionHandler);
trainingsApi.get('/sessions/:sessionId', getActiveSessionByIdHandler);
trainingsApi.patch('/sessions/:sessionId', updateActiveSessionHandler);
trainingsApi.post('/sessions/:sessionId/activate-set', activateSetHandler);
trainingsApi.post('/sessions/:sessionId/complete-set', completeSetHandler);
trainingsApi.post('/sessions/:sessionId/deactivate-others', deactivateOtherSetsHandler);
trainingsApi.post('/sessions/:sessionId/finish', finishWorkoutHandler);

// Workout History
trainingsApi.get('/history', getWorkoutHistoryHandler);
trainingsApi.get('/history/:historyId', getWorkoutHistoryByIdHandler);

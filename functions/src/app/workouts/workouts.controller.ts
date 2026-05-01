import { Response } from 'express';
import { AuthenticatedRequest } from '../_shared/auth';
import {
  createWorkout,
  getWorkoutByUserId,
  getWorkoutById,
  getFavoriteWorkoutsByUserId,
  toggleFavoriteWorkout,
  updateWorkout,
  deleteWorkout,
  activateSet,
  completeSet,
  deactivateOtherSets,
  startWorkoutSession,
  getActiveSessionByUserId,
  getActiveSessionById,
  updateActiveSession,
  finishWorkoutSession,
  getWorkoutHistoryByUserId,
  getWorkoutHistoryById,
} from './workouts.repository';

export const createWorkoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workout = { ...req.body, userId: req.userId };
    const result = await createWorkout(workout);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutByUserIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const result = await getWorkoutByUserId(userId, limit);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFavoriteWorkoutsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const result = await getFavoriteWorkoutsByUserId(userId, limit);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleFavoriteHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    // temporary debug logging to help trace authorization issues
    console.log('[toggleFavoriteHandler] authUser:', userId, 'workoutId:', id);
    const result = await toggleFavoriteWorkout(userId, id);
    if (result) {
      console.log('[toggleFavoriteHandler] workoutId:', result.id, 'favorite:', result.favorite);
    }
    if (!result) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('Not authorized')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const result = await getWorkoutById(id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWorkoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, description, exercises } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (exercises !== undefined) updates.exercises = exercises;

    const result = await updateWorkout(userId, id, updates);

    if (!result) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('Not authorized')) {
      return res.status(403).json({ error: err.message });
    }
    if (err.message.includes('deleted')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteWorkoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const result = await deleteWorkout(userId, id);

    if (!result) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.status(200).json({ message: 'Workout deleted successfully', workout: result });
  } catch (err: any) {
    if (err.message.includes('Not authorized')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const activateSetHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { exerciseId, setId } = req.body;
    const result = await activateSet(sessionId, exerciseId, setId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const completeSetHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { exerciseId, set } = req.body;
    const result = await completeSet(sessionId, exerciseId, set);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deactivateOtherSetsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { exceptExerciseId } = req.body;
    const result = await deactivateOtherSets(sessionId, exceptExerciseId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ============= ACTIVE SESSIONS =============

export const startWorkoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const result = await startWorkoutSession(userId, templateId);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('already has an active')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getActiveSessionHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await getActiveSessionByUserId(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getActiveSessionByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await getActiveSessionById(sessionId);

    if (!result) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateActiveSessionHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { currentState } = req.body;

    const result = await updateActiveSession(sessionId, { currentState });

    if (!result) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ============= WORKOUT HISTORY =============

export const finishWorkoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const result = await finishWorkoutSession(sessionId, notes);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutHistoryHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const result = await getWorkoutHistoryByUserId(userId, { limit, from, to });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutHistoryByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { historyId } = req.params;
    const result = await getWorkoutHistoryById(historyId);

    if (!result) {
      return res.status(404).json({ error: 'Workout history not found' });
    }

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

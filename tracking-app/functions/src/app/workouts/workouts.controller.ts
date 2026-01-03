import { Request, Response } from 'express';
import {
  createWorkout,
  getWorkoutByUserId,
  getWorkoutById,
  activateSet,
  completeSet,
  startWorkoutSession,
  getActiveSessionByUserId,
  getActiveSessionById,
  updateActiveSession,
  finishWorkoutSession,
  getWorkoutHistoryByUserId,
  getWorkoutHistoryById,
} from './workouts.repository';

export const createWorkoutHandler = async (req: Request, res: Response) => {
  try {
    const workout = req.body;
    const result = await createWorkout(workout);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const result = await getWorkoutByUserId(userId, limit);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await getWorkoutById(id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const activateSetHandler = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { exerciseId, setId } = req.body;
    const result = await activateSet(sessionId, exerciseId, setId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const completeSetHandler = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { exerciseId, set } = req.body;
    const result = await completeSet(sessionId, exerciseId, set);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ============= ACTIVE SESSIONS =============

export const startWorkoutHandler = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.body;

    if (!userId || !templateId) {
      return res.status(400).json({ error: 'userId and templateId are required' });
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

export const getActiveSessionHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await getActiveSessionByUserId(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getActiveSessionByIdHandler = async (req: Request, res: Response) => {
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

export const updateActiveSessionHandler = async (req: Request, res: Response) => {
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

export const finishWorkoutHandler = async (req: Request, res: Response) => {
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

export const getWorkoutHistoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await getWorkoutHistoryByUserId(userId, limit);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutHistoryByIdHandler = async (req: Request, res: Response) => {
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

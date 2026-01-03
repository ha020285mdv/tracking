import { Request, Response } from 'express';
import {
  createWorkout,
  getWorkoutByUserId,
  getWorkoutById,
  activateSet,
  completeSet,
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
    const { workoutId } = req.params;
    const { exerciseId, setId } = req.body;
    const result = await activateSet(workoutId, exerciseId, setId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const completeSetHandler = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const { exerciseId, set } = req.body;
    const result = await completeSet(workoutId, exerciseId, set);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

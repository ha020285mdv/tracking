import { Request, Response } from 'express';
import { createTraining } from './training.repository';

export const createTrainingHandler = async (req: Request, res: Response) => {
  try {
    const training = req.body;
    const result = await createTraining(training);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

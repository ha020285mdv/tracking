import express from 'express';
import cors from 'cors';
import { createTrainingHandler } from './training.controller';

export const trainingsApi = express();

trainingsApi.use(cors({ origin: true }));
trainingsApi.use(express.json());

trainingsApi.get('/ping', (_req, res) => res.json({ ok: true }));
trainingsApi.post('/trainings', createTrainingHandler);

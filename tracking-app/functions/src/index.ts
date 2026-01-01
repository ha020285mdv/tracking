import * as functions from 'firebase-functions/v2';
import { trainingsApi } from './app/training/training.routes';

export const api = functions.https.onRequest({ region: 'europe-west1' }, trainingsApi);

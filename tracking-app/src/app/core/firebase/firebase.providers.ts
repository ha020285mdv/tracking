import { Provider } from '@angular/core';
import { firebaseApp } from './firebase.init';
import { auth } from './firebase.auth';
import { db } from './firebase.db';
import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB } from './firebase.tokens';

export const FIREBASE_PROVIDERS: Provider[] = [
  { provide: FIREBASE_APP, useValue: firebaseApp },
  { provide: FIREBASE_AUTH, useValue: auth },
  { provide: FIREBASE_DB, useValue: db },
];

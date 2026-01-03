import { Provider } from '@angular/core';
import { firebaseApp } from './firebase.init';
// import { auth } from './firebase.auth'; // Commented out until Authentication is enabled in Firebase Console
import { db } from './firebase.db';
import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB } from './firebase.tokens';

export const FIREBASE_PROVIDERS: Provider[] = [
  { provide: FIREBASE_APP, useValue: firebaseApp },
  // { provide: FIREBASE_AUTH, useValue: auth }, // Commented out until Authentication is enabled
  { provide: FIREBASE_DB, useValue: db },
];

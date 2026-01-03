import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';

// Initialize Firebase with automaticDataCollectionEnabled disabled to prevent auto-initialization errors
export const firebaseApp = initializeApp(firebaseConfig, {
  automaticDataCollectionEnabled: false,
});

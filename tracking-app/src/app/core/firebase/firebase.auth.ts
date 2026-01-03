import { getAuth, Auth } from 'firebase/auth';
import { firebaseApp } from './firebase.init';

// Lazy initialization to avoid CONFIGURATION_NOT_FOUND errors
// Auth will only initialize when actually used
let authInstance: Auth | null = null;

export const getAuthInstance = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
};

// For backward compatibility
export const auth = getAuthInstance();

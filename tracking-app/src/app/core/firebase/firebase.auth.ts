import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase.init';

export const auth = getAuth(firebaseApp);

import { getAnalytics } from 'firebase/analytics';
import { firebaseApp } from './firebase.init';

export const analytics = getAnalytics(firebaseApp);

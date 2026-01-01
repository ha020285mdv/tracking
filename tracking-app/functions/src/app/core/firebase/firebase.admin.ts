import admin from 'firebase-admin';

// Initialize default Firebase Admin app
export const firebaseAdminApp = admin.apps.length ? admin.app() : admin.initializeApp();

// Firestore & Auth exports
export const db = firebaseAdminApp.firestore();
export const auth = firebaseAdminApp.auth();

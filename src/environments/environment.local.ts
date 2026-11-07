import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  // Points to local Firebase Functions emulator
  firebaseApiBase: 'http://127.0.0.1:5001/easyworkouttrack/europe-west1/api',
  apiHostMarker: '127.0.0.1',
  firebase: {
    apiKey: 'AIzaSyCTtKdnTSGv9ZD4jpYCvYaeSl4n9RV545s',
    authDomain: 'easyworkouttrack.firebaseapp.com',
    projectId: 'easyworkouttrack',
    storageBucket: 'easyworkouttrack.firebasestorage.app',
    messagingSenderId: '977546614994',
    appId: '1:977546614994:web:f14c2e658961141e67750b',
    measurementId: 'G-6071HXC57K',
  },
};

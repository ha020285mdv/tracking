import type { Environment } from './environment.model';
import packageInfo from '../../package.json';

export const environment = {
  production: false,
  firebaseApiBase: 'https://europe-west1-easyworkouttrack.cloudfunctions.net/api',
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

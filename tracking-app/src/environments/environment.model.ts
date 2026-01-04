export interface Environment {
  production: boolean,
  firebaseApiBase: string,
  apiHostMarker: string,
  firebase: {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId: string,
  }
}
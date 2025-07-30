// src/app/firebase.ts

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { environment } from '../environments/environment';

// 1) Initialize the Firebase App with the renamed key:
export const firebaseApp = initializeApp(environment.firebaseConfig);

// 2) Auth instance, pointing to emulator when in dev
export const auth = getAuth(firebaseApp);
if (environment.useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true,
  });
}

// 3) Firestore instance, pointing to emulator when in dev
export const db = getFirestore(firebaseApp);
if (environment.useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
}

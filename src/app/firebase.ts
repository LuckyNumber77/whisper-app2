import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);

export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ renamed from firestore → db
export const storage = getStorage(app);

if (!environment.production) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080); // ✅ updated to db
  connectStorageEmulator(storage, 'localhost', 9199);
}

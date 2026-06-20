import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Firebase Admin credentials are not fully defined in environment variables.');
    } else {
      // Handle the literal \n characters in the environment variable
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

// We safely export the db. If initialization failed, it will be undefined or throw when accessed.
const adminDb = getApps().length ? getFirestore() : null;

export { adminDb, FieldValue };

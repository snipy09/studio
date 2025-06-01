
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you plan to use Firebase Analytics

const firebaseConfigBase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let firebaseConfig: any = { ...firebaseConfigBase };

if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.trim() !== "") {
  firebaseConfig.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  console.info(
    `Firebase client is configured with storageBucket: ${firebaseConfig.storageBucket}. ` +
    `Ensure appropriate GCS/Firebase Storage permissions and rules are set for the service account ` +
    `(e.g., your App Hosting service account or Genkit's service account) if you encounter 'AccessDenied' errors. ` +
    `This typically requires granting roles like 'Storage Object Viewer' (for reads) or 'Storage Object Creator' (for writes) ` +
    `in Google Cloud IAM for the specified bucket. If your application does not directly use Firebase Storage SDK features for file uploads/downloads, ` +
    `you might consider omitting NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET from your .env file to simplify permissions.`
  );
} else {
  console.info(
    `Firebase client storageBucket is NOT configured (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set or is empty). ` +
    `Firebase Storage SDK features that rely on this specific client configuration (e.g., direct file uploads/downloads initiated by client code) will not be available unless a bucket is implicitly determined or configured elsewhere. ` +
    `This can help avoid GCS permission errors if the backend service account lacks access to a default or previously specified bucket.`
  );
}


// IMPORTANT PERMISSIONS NOTE FOR GCS (Google Cloud Storage) in general:
// If you specify `storageBucket` in your `firebaseConfig` (e.g., via NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
// or if Genkit/other services attempt to access GCS:
// Ensure that the necessary IAM permissions (like `storage.objects.get` for reading,
// `storage.objects.create` for writing) are granted:
// 1. For users accessing via Firebase Storage: Check your Firebase Storage Rules in the Firebase Console.
// 2. For service accounts (e.g., your App Hosting service account, Genkit service account): Check IAM
//    permissions in the Google Cloud Console for the service account identity.
//    This service account needs permissions on the GCS bucket it's trying to access.
// An "AccessDenied" error for GCS usually means these permissions are missing for the relevant identity.

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;
// let analytics: Analytics | undefined; // Optional

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Try to initialize Auth
  try {
    auth = getAuth(app);
  } catch (e) {
    console.warn(
      `Firebase getAuth failed: ${(e as Error).message}. Firebase Auth will be unavailable.`
    );
    // auth remains null
  }

  // Try to initialize Firestore
  try {
    db = getFirestore(app);
  } catch (e) {
    console.warn(
      `Firebase getFirestore failed: ${(e as Error).message}. Firestore will be unavailable.`
    );
    // db remains null
  }

} catch (initError) {
  console.error(
    `Critical Firebase app initialization failed: ${(initError as Error).message}. Firebase services will be largely unavailable.`
  );
  if (!app!) {
     app = {} as FirebaseApp;
  }
}


export { app, auth, db };



import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you plan to use Firebase Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// IMPORTANT PERMISSIONS NOTE FOR GCS (Google Cloud Storage):
// If you specify `storageBucket` in your `firebaseConfig` (e.g., via NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
// ensure that the necessary IAM permissions (like `storage.objects.get` for reading,
// `storage.objects.create` for writing) are granted:
// 1. For users: Check your Firebase Storage Rules in the Firebase Console.
// 2. For service accounts (if your backend/Genkit interacts with GCS): Check IAM
//    permissions in the Google Cloud Console for the service account running your code.
// An "AccessDenied" error for GCS usually means these permissions are missing.

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

  // Optional: Initialize Analytics
  // if (typeof window !== 'undefined') {
  //   try {
  //     analytics = getAnalytics(app);
  //   } catch (e) {
  //     console.warn(`Firebase getAnalytics failed: ${(e as Error).message}. Analytics will be unavailable.`);
  //   }
  // }

  if (firebaseConfig.storageBucket) {
    console.info(
        `Firebase is configured with storageBucket: ${firebaseConfig.storageBucket}. ` +
        `Ensure appropriate GCS/Firebase Storage permissions and rules are set if you encounter 'AccessDenied' errors related to storage.`
    );
  }


} catch (initError) {
  console.error(
    `Critical Firebase app initialization failed: ${(initError as Error).message}. Firebase services will be largely unavailable.`
  );
  // If initializeApp itself fails, app might not be valid.
  // For safety, ensure 'app' is defined for export, though it might be a shell.
  if (!app!) {
     // This case means Firebase is fundamentally broken.
     // Assign a temporary, non-functional app object for type consistency if strictly needed,
     // though using it would lead to further errors.
     app = {} as FirebaseApp; // Or handle more gracefully by not exporting.
  }
}


export { app, auth, db };

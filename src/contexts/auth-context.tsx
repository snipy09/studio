
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
// Import types directly, actual functions will be imported dynamically
import type { User as FirebaseUser, Auth, signOut as signOutType, onAuthStateChanged as onAuthStateChangedType } from "firebase/auth";
import type { UserProfile } from "@/lib/types";

// --- START DUMMY AUTH CONFIGURATION ---
const DUMMY_AUTH_ENABLED = true; 

const dummyUser: UserProfile = {
  uid: "dummy-user-uid-123",
  email: "dummy@example.com",
  displayName: "Dummy User",
  photoURL: "https://placehold.co/100x100.png", // data-ai-hint="user avatar"
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  } as any, 
  providerData: [
    {
      providerId: "password",
      uid: "dummy-user-uid-123",
      displayName: "Dummy User",
      email: "dummy@example.com",
      photoURL: "https://placehold.co/100x100.png", // data-ai-hint="user avatar"
      phoneNumber: null,
    }
  ],
  refreshToken: "dummy-refresh-token",
  tenantId: null,
  delete: async () => { console.log("Dummy user delete called"); },
  getIdToken: async (_forceRefresh?: boolean) => "dummy-id-token",
  getIdTokenResult: async (_forceRefresh?: boolean) => ({
    token: "dummy-id-token",
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: "password",
    signInSecondFactor: null,
    claims: {},
  } as any), 
  reload: async () => { console.log("Dummy user reload called"); },
  toJSON: () => ({
    uid: "dummy-user-uid-123",
    email: "dummy@example.com",
    displayName: "Dummy User",
    photoURL: "https://placehold.co/100x100.png", // data-ai-hint="user avatar"
    emailVerified: true,
    isAnonymous: false,
  }),
};
// --- END DUMMY AUTH CONFIGURATION ---

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isManuallySignedOut: boolean;
  setIsManuallySignedOut: (value: boolean) => void;
  logout: () => Promise<void>;
  dummyLogin?: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallySignedOut, setIsManuallySignedOut] = useState(false);

  const [fbAuthService, setFbAuthService] = useState<Auth | null>(null);
  const [fbSignOut, setFbSignOut] = useState<(() => typeof signOutType) | null>(null);
  const [fbOnAuthStateChanged, setFbOnAuthStateChanged] = useState<(() => typeof onAuthStateChangedType) | null>(null);

  const _internalDummyLogin = useCallback(() => {
    if (DUMMY_AUTH_ENABLED) {
      setUser(dummyUser);
      setLoading(false);
      setIsManuallySignedOut(false);
    }
  }, []);

  const handleAppLogout = useCallback(async () => {
    setUser(null);
    setIsManuallySignedOut(true);
    if (!DUMMY_AUTH_ENABLED && fbAuthService && fbSignOut) {
      try {
        const signOutFn = fbSignOut();
        await signOutFn(fbAuthService);
      } catch (error) {
        console.error("Error signing out with Firebase:", error);
      }
    }
  }, [fbAuthService, fbSignOut]);

  useEffect(() => {
    if (DUMMY_AUTH_ENABLED) {
      setLoading(false);
      return; // No Firebase interaction needed for dummy mode's initial setup.
    }

    const loadFirebase = async () => {
      try {
        // Dynamically import Firebase config and auth functions
        const { auth: firebaseAuthInstance } = await import("@/lib/firebase/config");
        const { signOut: signOutFn, onAuthStateChanged: onAuthStateChangedFn } = await import("firebase/auth");
        
        if (firebaseAuthInstance) {
            setFbAuthService(firebaseAuthInstance);
        } else {
            console.error("Firebase auth instance not loaded from config.");
        }
        setFbSignOut(() => signOutFn); // Store a function that returns signOutFn
        setFbOnAuthStateChanged(() => onAuthStateChangedFn); // Store a function that returns onAuthStateChangedFn
      } catch (error) {
        console.error("Failed to load Firebase services:", error);
        // This error (e.g., auth/invalid-api-key from config.ts) might be caught here client-side
        setLoading(false);
      }
    };

    loadFirebase();
  }, []); // Runs once on mount if not in dummy mode

  useEffect(() => {
    // This effect attaches the onAuthStateChanged listener once Firebase services are loaded
    if (DUMMY_AUTH_ENABLED) {
      // Loading state is already handled, and dummy login is manual via button
      return;
    }

    if (fbAuthService && fbOnAuthStateChanged) {
      const onAuthStateChangedFn = fbOnAuthStateChanged();
      const unsubscribe = onAuthStateChangedFn(fbAuthService, (currentFbUser: FirebaseUser | null) => {
        if (currentFbUser) {
          setUser(currentFbUser as UserProfile);
          setIsManuallySignedOut(false);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!fbAuthService && !loading && !DUMMY_AUTH_ENABLED) {
      // Firebase services might have failed to load, or still loading
      // If loading is false here, it means loadFirebase() completed, possibly with an error.
      console.warn("Firebase auth service not available for auth state listener. App might not function correctly with real auth.");
      setLoading(false); // Ensure loading is false if it hasn't been set by onAuthStateChanged
    }
  }, [fbAuthService, fbOnAuthStateChanged, loading, DUMMY_AUTH_ENABLED]); // Re-run if services become available

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isManuallySignedOut,
      setIsManuallySignedOut,
      logout: handleAppLogout,
      dummyLogin: DUMMY_AUTH_ENABLED ? _internalDummyLogin : undefined
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

    
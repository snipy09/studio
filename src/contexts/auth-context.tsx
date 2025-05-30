
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
// Import types directly, actual functions will be imported dynamically
import type { User as FirebaseUser, Auth, signOut as signOutType, onAuthStateChanged as onAuthStateChangedType } from "firebase/auth";
import type { UserProfile } from "@/lib/types";

// --- START DUMMY AUTH CONFIGURATION ---
export const DUMMY_AUTH_ENABLED = true; 

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

  const dummyLogin = useCallback(() => {
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
      return;
    }

    const loadFirebase = async () => {
      try {
        const { auth: firebaseAuthInstance } = await import("@/lib/firebase/config");
        const { signOut: signOutFn, onAuthStateChanged: onAuthStateChangedFn } = await import("firebase/auth");
        
        if (firebaseAuthInstance) { // Check if auth was successfully initialized in config.ts
            setFbAuthService(firebaseAuthInstance);
            setFbSignOut(() => signOutFn); 
            setFbOnAuthStateChanged(() => onAuthStateChangedFn);
        } else {
            console.warn("Firebase Auth service not loaded from config. Real auth will not function.");
            setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load Firebase services for AuthContext:", error);
        setLoading(false);
      }
    };

    loadFirebase();
  }, [DUMMY_AUTH_ENABLED]); 

  useEffect(() => {
    if (DUMMY_AUTH_ENABLED || !fbAuthService || !fbOnAuthStateChanged) {
      if (!DUMMY_AUTH_ENABLED && !fbAuthService && !loading) {
        // This means loadFirebase() completed, but fbAuthService is still null (init failed in config or here)
         console.warn("Firebase auth service not available for onAuthStateChanged listener. Real auth will not function.");
      }
      setLoading(false); // Ensure loading is false if we can't set up listener
      return;
    }
    
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
  }, [DUMMY_AUTH_ENABLED, fbAuthService, fbOnAuthStateChanged, loading]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isManuallySignedOut,
      setIsManuallySignedOut,
      logout: handleAppLogout,
      dummyLogin: DUMMY_AUTH_ENABLED ? dummyLogin : undefined
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

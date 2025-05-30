
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";

// --- START DUMMY AUTH CONFIGURATION ---
const DUMMY_AUTH_ENABLED = true; // Set to true to enable dummy login button and functionality

const dummyUser: UserProfile = {
  uid: "dummy-user-uid-123",
  email: "dummy@example.com",
  displayName: "Dummy User",
  photoURL: "https://placehold.co/100x100.png",
  emailVerified: true,
  isAnonymous: false,
  // --- FirebaseUser specific fields (mocked) ---
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  } as any, // Using 'any' for simplicity for UserMetadata
  providerData: [
    {
      providerId: "password",
      uid: "dummy-user-uid-123",
      displayName: "Dummy User",
      email: "dummy@example.com",
      photoURL: "https://placehold.co/100x100.png",
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
  } as any), // Using 'any' for simplicity for IdTokenResult
  reload: async () => { console.log("Dummy user reload called"); },
  toJSON: () => ({
    uid: "dummy-user-uid-123",
    email: "dummy@example.com",
    displayName: "Dummy User",
    photoURL: "https://placehold.co/100x100.png",
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
  dummyLogin?: () => void; // Optional: only available if DUMMY_AUTH_ENABLED is true
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallySignedOut, setIsManuallySignedOut] = useState(false);

  const handleAppLogout = async () => {
    setUser(null);
    setIsManuallySignedOut(true); // Always set this true on any logout action
    if (!DUMMY_AUTH_ENABLED) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out with Firebase:", error);
      }
    }
  };

  const _internalDummyLogin = () => {
    // This function is only called if DUMMY_AUTH_ENABLED is true
    setUser(dummyUser);
    setLoading(false);
    setIsManuallySignedOut(false);
  };

  useEffect(() => {
    if (DUMMY_AUTH_ENABLED) {
      setLoading(false); // In dummy mode, loading is done. User is initially null until dummyLogin is called.
      return; // No Firebase listener needed for dummy mode.
    }

    // Original Firebase auth logic (only runs if DUMMY_AUTH_ENABLED is false)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser as UserProfile);
        setIsManuallySignedOut(false);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount

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

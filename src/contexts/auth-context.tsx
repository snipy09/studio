
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";

// --- START DUMMY AUTH CONFIGURATION ---
const DUMMY_AUTH_ENABLED = true;

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
  logout: () => Promise<void>; // Added logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallySignedOut, setIsManuallySignedOut] = useState(false);

  const handleAppLogout = async () => {
    if (DUMMY_AUTH_ENABLED) {
      setUser(null);
      setIsManuallySignedOut(true);
    } else {
      try {
        await signOut(auth);
        // onAuthStateChanged will handle setting user to null
        setIsManuallySignedOut(true);
      } catch (error) {
        console.error("Error signing out with Firebase:", error);
        // Fallback or error handling for real sign out
        setUser(null); // Ensure user is cleared
        setIsManuallySignedOut(true);
      }
    }
  };

  useEffect(() => {
    if (DUMMY_AUTH_ENABLED) {
      setUser(dummyUser);
      setLoading(false);
      setIsManuallySignedOut(false); // User is "logged in"
      return () => {}; // No Firebase listener to unsubscribe
    }

    // Original Firebase auth logic
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser as UserProfile);
        // setIsManuallySignedOut(false); // If user is authenticated, they are not manually signed out.
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount

  return (
    <AuthContext.Provider value={{ user, loading, isManuallySignedOut, setIsManuallySignedOut, logout: handleAppLogout }}>
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


"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
// Import types directly, actual functions will be imported dynamically
import type { User as FirebaseUser, Auth, SignOut, OnAuthStateChanged } from "firebase/auth"; // Changed to direct types
import type { UserProfile } from "@/lib/types";

// --- START DEMO AUTH CONFIGURATION ---
export const DEMO_AUTH_ENABLED = true; 

const demoUser: UserProfile = {
  uid: "demo-user-uid-123",
  email: "demo@example.com",
  displayName: "Demo User",
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
      uid: "demo-user-uid-123",
      displayName: "Demo User",
      email: "demo@example.com",
      photoURL: "https://placehold.co/100x100.png", // data-ai-hint="user avatar"
      phoneNumber: null,
    }
  ],
  refreshToken: "demo-refresh-token",
  tenantId: null,
  delete: async () => { console.log("Demo user delete called"); },
  getIdToken: async (_forceRefresh?: boolean) => "demo-id-token",
  getIdTokenResult: async (_forceRefresh?: boolean) => ({
    token: "demo-id-token",
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: "password",
    signInSecondFactor: null,
    claims: {},
  } as any), 
  reload: async () => { console.log("Demo user reload called"); },
  toJSON: () => ({
    uid: "demo-user-uid-123",
    email: "demo@example.com",
    displayName: "Demo User",
    photoURL: "https://placehold.co/100x100.png", // data-ai-hint="user avatar"
    emailVerified: true,
    isAnonymous: false,
  }),
};
// --- END DEMO AUTH CONFIGURATION ---

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isManuallySignedOut: boolean;
  setIsManuallySignedOut: (value: boolean) => void;
  logout: () => Promise<void>;
  demoLogin?: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallySignedOut, setIsManuallySignedOut] = useState(false);

  const [fbAuthService, setFbAuthService] = useState<Auth | null>(null);
  const [fbSignOut, setFbSignOut] = useState<SignOut | null>(null); // Store the function directly
  const [fbOnAuthStateChanged, setFbOnAuthStateChanged] = useState<OnAuthStateChanged | null>(null); // Store the function directly

  const demoLogin = useCallback(() => {
    if (DEMO_AUTH_ENABLED) {
      setUser(demoUser);
      setLoading(false);
      setIsManuallySignedOut(false);
    }
  }, []);

  const handleAppLogout = useCallback(async () => {
    setUser(null);
    setIsManuallySignedOut(true);
    if (!DEMO_AUTH_ENABLED && fbAuthService && fbSignOut) {
      try {
        await fbSignOut(fbAuthService); // Call directly
      } catch (error) {
        console.error("Error signing out with Firebase:", error);
      }
    }
  }, [fbAuthService, fbSignOut]);

  useEffect(() => {
    if (DEMO_AUTH_ENABLED) {
      setLoading(false); 
      return;
    }

    const loadFirebase = async () => {
      try {
        const { auth: firebaseAuthInstance } = await import("@/lib/firebase/config");
        const { signOut: signOutFnImport, onAuthStateChanged: onAuthStateChangedFnImport } = await import("firebase/auth");
        
        if (firebaseAuthInstance) { 
            setFbAuthService(firebaseAuthInstance);
            setFbSignOut(() => signOutFnImport); 
            setFbOnAuthStateChanged(() => onAuthStateChangedFnImport);
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
  }, [DEMO_AUTH_ENABLED]); 

  useEffect(() => {
    if (DEMO_AUTH_ENABLED || !fbAuthService || !fbOnAuthStateChanged) {
      if (!DEMO_AUTH_ENABLED && !fbAuthService && !loading) {
         console.warn("Firebase auth service not available for onAuthStateChanged listener. Real auth will not function.");
      }
      setLoading(false); 
      return;
    }
    
    const unsubscribe = fbOnAuthStateChanged(fbAuthService, (currentFbUser: FirebaseUser | null) => { // Call directly
      if (currentFbUser) {
        setUser(currentFbUser as UserProfile);
        setIsManuallySignedOut(false);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [DEMO_AUTH_ENABLED, fbAuthService, fbOnAuthStateChanged, loading]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isManuallySignedOut,
      setIsManuallySignedOut,
      logout: handleAppLogout,
      demoLogin: DEMO_AUTH_ENABLED ? demoLogin : undefined
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


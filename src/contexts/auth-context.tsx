"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isManuallySignedOut: boolean;
  setIsManuallySignedOut: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallySignedOut, setIsManuallySignedOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // You can extend the user profile here if needed
        // For now, we'll use the FirebaseUser directly as UserProfile
        setUser(firebaseUser as UserProfile);
        setIsManuallySignedOut(false); 
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isManuallySignedOut, setIsManuallySignedOut }}>
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

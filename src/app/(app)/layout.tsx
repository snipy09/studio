
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from "@/components/onboarding/onboarding-modal"; // Import the modal and key

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, isManuallySignedOut } = useAuth();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isManuallySignedOut) {
      router.push("/login");
    }
    if (!loading && user) {
      // Check if onboarding has been completed
      const onboardingCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [user, loading, router, isManuallySignedOut]);

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    // Note: localStorage.setItem is handled within OnboardingModal's triggerFinish
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-32 mr-6" />
            <Skeleton className="h-8 w-20 mr-4" />
            <Skeleton className="h-8 w-20" />
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <Skeleton className="h-screen w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the redirect,
     // but as a fallback, show loading or minimal UI.
     // Or, if isManuallySignedOut is true, this state might be hit briefly before redirect completes.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showOnboarding && <OnboardingModal open={showOnboarding} onFinish={handleOnboardingFinish} />}
    </div>
  );
}

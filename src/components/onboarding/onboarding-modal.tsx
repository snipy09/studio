
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, LayoutDashboard, Sparkles, FolderKanban, Lightbulb, HelpCircle, LayoutGrid } from "lucide-react";
import Image from 'next/image';

const ONBOARDING_STORAGE_KEY = "flowforge_onboarding_completed_v1";

interface OnboardingStep {
  title: string;
  icon: React.ElementType;
  description: string;
  image?: string;
  imageHint?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to FlowForge!",
    icon: Sparkles,
    description: "Your personal productivity companion. Let's take a quick tour of the key features to help you get started and make the most out of FlowForge.",
    image: "https://placehold.co/400x200.png",
    imageHint: "welcome illustration"
  },
  {
    title: "Dashboard: Your Command Center",
    icon: LayoutDashboard,
    description: "The dashboard is your central hub. Here you can view your tasks, create new flows, or jump back into existing ones. Stay organized and keep track of your progress at a glance.",
    image: "https://placehold.co/400x200.png",
    imageHint: "dashboard overview"
  },
  {
    title: "Create & Manage Flows",
    icon: FolderKanban,
    description: "Design custom workflows tailored to your needs. Add steps, set deadlines, and track progress. You can create flows manually or use our AI Flow Generator for a quick start!",
    image: "https://placehold.co/400x200.png",
    imageHint: "flow creation interface"
  },
  {
    title: "Discover Your Next Big Thing",
    icon: Lightbulb,
    description: "Feeling unsure about your next project or goal? Use the 'Discover' feature. Answer a few reflective questions, and our AI will provide personalized insights, project ideas, and relevant resources.",
    image: "https://placehold.co/400x200.png",
    imageHint: "discover feature preview"
  },
  {
    title: "Feeling Stuck? Get AI Help",
    icon: HelpCircle,
    description: "Everyone hits a roadblock sometimes. If you're feeling stuck, describe your challenge, and our AI will offer a practical roadmap, solution insights, and helpful resources to get you moving again.",
    image: "https://placehold.co/400x200.png",
    imageHint: "feeling stuck help"
  },
  {
    title: "Flow Templates",
    icon: LayoutGrid,
    description: "Kickstart your projects with our library of pre-built flow templates. Find templates for common tasks like UI design, marketing campaigns, content creation, and more.",
    image: "https://placehold.co/400x200.png",
    imageHint: "template library"
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!onboardingCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  const ActiveIcon = steps[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if(!open) handleFinish(); // If user closes dialog via X or overlay click
    }}>
      <DialogContent className="sm:max-w-lg p-0" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center text-xl">
            <ActiveIcon className="mr-3 h-6 w-6 text-primary" />
            {steps[currentStep].title}
          </DialogTitle>
          {steps[currentStep].image && (
             <div className="mt-4 mb-2 h-40 relative overflow-hidden rounded-md bg-muted">
                <Image 
                    src={steps[currentStep].image!} 
                    alt={steps[currentStep].title} 
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={steps[currentStep].imageHint || "feature illustration"}
                />
             </div>
           )}
          <DialogDescription className="text-sm text-muted-foreground pt-2 min-h-[60px]">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
            <div className="flex justify-center space-x-1 mb-6">
                {steps.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                    currentStep === index ? "bg-primary w-4" : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                />
                ))}
            </div>

            <DialogFooter className="flex flex-row justify-between w-full">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            ) : (
              <div /> // Placeholder to keep "Next" button to the right
            )}
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Finish Tour
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

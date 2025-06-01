
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Sparkles, Send } from "lucide-react";
// Removed generateGoalsFromReflection import as AI call moves to results page
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { GenerateDetailedDiscoveryPlanInput } from '@/lib/types';

const formSchema = z.object({
  energizingActivities: z.string().min(10, "Please provide a bit more detail (at least 10 characters)."),
  solveProblem: z.string().min(10, "Please elaborate slightly (at least 10 characters)."),
  skillsToLearn: z.string().min(10, "Describe the skills in a bit more detail (at least 10 characters)."),
  currentChallenge: z.string().min(10, "Explain the challenge further (at least 10 characters)."),
});

export const DISCOVERY_DATA_LOCAL_STORAGE_KEY = "discoveryFormData";

export default function DiscoverPage() {
  const { toast } = useToast();
  const router = useRouter();
  // isLoading is now primarily for form submission, not AI call on this page
  const [isSubmitting, setIsSubmitting] = useState(false);
  // AI results state is removed as results are shown on a new page
  // const [aiResults, setAiResults] = useState<GenerateGoalsOutput | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      energizingActivities: "",
      solveProblem: "",
      skillsToLearn: "",
      currentChallenge: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const inputForNextPage: GenerateDetailedDiscoveryPlanInput = {
        energizingActivities: values.energizingActivities,
        solveProblem: values.solveProblem,
        skillsToLearn: values.skillsToLearn,
        currentChallenge: values.currentChallenge,
      };
      
      // Store data in localStorage for the results page
      localStorage.setItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY, JSON.stringify(inputForNextPage));
      
      toast({ title: "Reflections Captured!", description: "Taking you to your personalized insights..." });
      router.push('/discover/results');

    } catch (error: any) {
      console.error("Error during form submission or redirection:", error);
      toast({
        title: "Submission Error",
        description: error.message || "An unexpected error occurred while preparing your insights.",
        variant: "destructive",
      });
      setIsSubmitting(false); // Only set to false on error here, otherwise page navigates away
    }
    // No finally block to setIsSubmitting(false) because successful submission navigates away
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center justify-center">
          <Lightbulb className="mr-3 h-8 w-8 text-primary" />
          Discover Your Next Big Thing
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Answer a few questions to help our AI understand you better. Your insights will be generated on the next page.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Reflect & Inspire</CardTitle>
          <CardDescription>Your honest answers will lead to more relevant suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="energizingActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">What activities make you feel most energized and engaged?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Solving complex puzzles, creating art, helping others, learning new technologies..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="solveProblem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">If you had unlimited time and resources, what problem would you try to solve?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Climate change, education inequality, finding a cure for a disease, improving local community..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillsToLearn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">What skills do you want to learn or improve in the next year?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Public speaking, coding in Python, playing a musical instrument, financial literacy..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentChallenge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">What are you currently dissatisfied with, or what challenge are you facing that you'd like to overcome?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Feeling stuck in my career, managing my time better, building healthier habits..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate My Inspired Plan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* AI results display section is removed from this page */}
    </div>
  );
}

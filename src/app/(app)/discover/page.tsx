
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { generateGoalsFromReflection, type GenerateGoalsInput, type GenerateGoalsOutput } from '@/ai/flows/generate-goals-flow';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  energizingActivities: z.string().min(10, "Please provide a bit more detail."),
  solveProblem: z.string().min(10, "Please elaborate slightly."),
  skillsToLearn: z.string().min(10, "Describe the skills in a bit more detail."),
  currentChallenge: z.string().min(10, "Explain the challenge further."),
});

export default function DiscoverPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResults, setAiResults] = useState<GenerateGoalsOutput | null>(null);

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
    setIsLoading(true);
    setAiResults(null);
    try {
      const input: GenerateGoalsInput = {
        energizingActivities: values.energizingActivities,
        solveProblem: values.solveProblem,
        skillsToLearn: values.skillsToLearn,
        currentChallenge: values.currentChallenge,
      };
      const result = await generateGoalsFromReflection(input);
      setAiResults(result);
      toast({ title: "Ideas Generated!", description: "Check out your personalized suggestions below." });
    } catch (error: any) {
      console.error("Goal Generation error:", error);
      toast({
        title: "AI Error",
        description: error.message || "An unexpected error occurred with the AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center justify-center">
          <Lightbulb className="mr-3 h-8 w-8 text-primary" />
          Discover Your Next Big Thing
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Answer a few questions to help our AI understand you better and suggest potential goals or projects you might find fulfilling.
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Inspired!
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {aiResults && (
        <Card className="max-w-3xl mx-auto mt-10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              Your AI-Generated Ideas
            </CardTitle>
            <CardDescription>Here are some goals and project suggestions based on your reflections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {aiResults.suggestedGoals && aiResults.suggestedGoals.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2 font-headline">Suggested Goals</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {aiResults.suggestedGoals.map((goal, index) => (
                    <li key={`goal-${index}`}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiResults.projectSuggestions && aiResults.projectSuggestions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 font-headline">Project Ideas</h3>
                <div className="space-y-4">
                  {aiResults.projectSuggestions.map((project, index) => (
                    <div key={`project-${index}`} className="p-4 border rounded-md bg-muted/30">
                      <h4 className="font-semibold text-lg mb-1">{project.name}</h4>
                      {project.firstSteps && project.firstSteps.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">First Steps:</p>
                          <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-0.5 pl-2">
                            {project.firstSteps.map((step, stepIndex) => (
                              <li key={`project-${index}-step-${stepIndex}`}>{step}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
             {!aiResults.suggestedGoals?.length && !aiResults.projectSuggestions?.length && (
                <p className="text-muted-foreground text-center py-4">The AI couldn't generate specific suggestions this time. Try rephrasing your answers or providing more detail.</p>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

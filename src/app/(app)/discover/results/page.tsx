
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Lightbulb, ArrowLeft, Target, ListChecks, AlertTriangle, Trophy, Youtube, FileText, Globe } from "lucide-react";
import { generateDetailedDiscoveryPlan } from '@/ai/flows/generate-detailed-discovery-plan-flow';
import type { GenerateDetailedDiscoveryPlanInput, GenerateDetailedDiscoveryPlanOutput, ProjectBreakdown, FlowSuggestedResources } from '@/lib/types';
import { DISCOVERY_DATA_LOCAL_STORAGE_KEY } from '../page'; // Import the key

export default function DiscoverResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [aiResults, setAiResults] = useState<GenerateDetailedDiscoveryPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const inputData: GenerateDetailedDiscoveryPlanInput = JSON.parse(storedData);
        // localStorage.removeItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY); // Remove after fetching, or on unmount

        generateDetailedDiscoveryPlan(inputData)
          .then(results => {
            setAiResults(results);
            toast({ title: "Your Inspired Plan is Ready!", description: "Explore your personalized suggestions below." });
          })
          .catch(err => {
            console.error("AI Detailed Plan Generation error:", err);
            setError(err.message || "Failed to generate your detailed plan. Please try again.");
            toast({
              title: "AI Error",
              description: err.message || "An unexpected error occurred with the AI.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsLoading(false);
            localStorage.removeItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY); // Ensure it's removed
          });

      } catch (e) {
        console.error("Error parsing stored discovery data:", e);
        setError("Could not retrieve your reflection data. Please start over.");
        setIsLoading(false);
        localStorage.removeItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY);
      }
    } else {
      setError("No reflection data found. Please start by answering the questions on the Discover page.");
      setIsLoading(false);
      toast({ title: "Missing Data", description: "Please go back to the Discover page and share your reflections first.", variant: "default" });
    }
    
    return () => {
        // Optional: ensure cleanup if user navigates away while loading, though primary removal is after fetch.
        // localStorage.removeItem(DISCOVERY_DATA_LOCAL_STORAGE_KEY); 
    }

  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Crafting Your Inspired Plan...</h2>
        <p className="text-muted-foreground">The AI is working its magic. This might take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/discover')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Discover
        </Button>
      </div>
    );
  }

  if (!aiResults || (!aiResults.suggestedGoals?.length && !aiResults.projectBreakdowns?.length)) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center min-h-screen flex flex-col items-center justify-center">
        <Lightbulb className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">No Specific Suggestions Generated</h2>
        <p className="text-muted-foreground mb-6">The AI couldn't generate a detailed plan this time. This can sometimes happen with very broad or very specific inputs. Try rephrasing your answers on the Discover page.</p>
        <Button onClick={() => router.push('/discover')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Try Again on Discover Page
        </Button>
      </div>
    );
  }

  const renderResources = (resources?: FlowSuggestedResources) => {
    if (!resources || (!resources.youtubeVideos?.length && !resources.articles?.length && !resources.websites?.length)) {
      return <p className="text-sm text-muted-foreground">No specific resources suggested for this project.</p>;
    }
    return (
      <div className="space-y-3">
        {resources.youtubeVideos && resources.youtubeVideos.length > 0 && (
          <div>
            <h5 className="font-semibold text-sm mb-1 flex items-center"><Youtube className="mr-2 h-4 w-4 text-red-600"/>YouTube Videos:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.youtubeVideos.map((video, i) => (
                <li key={`yt-${i}`} className="text-xs"><Link href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{video.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {resources.articles && resources.articles.length > 0 && (
          <div>
            <h5 className="font-semibold text-sm mb-1 flex items-center"><FileText className="mr-2 h-4 w-4 text-blue-600"/>Articles/Blogs:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.articles.map((article, i) => (
                <li key={`article-${i}`} className="text-xs"><Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{article.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {resources.websites && resources.websites.length > 0 && (
          <div>
            <h5 className="font-semibold text-sm mb-1 flex items-center"><Globe className="mr-2 h-4 w-4 text-green-600"/>Websites/Tools:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.websites.map((site, i) => (
                <li key={`site-${i}`} className="text-xs"><Link href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{site.name}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight font-headline">Your Inspired Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Here are AI-powered goals and detailed project ideas based on your reflections.
        </p>
      </div>

      {aiResults.suggestedGoals && aiResults.suggestedGoals.length > 0 && (
        <Card className="mb-10 shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Target className="mr-3 h-7 w-7 text-primary" />
              Overarching Goals
            </CardTitle>
            <CardDescription>These aspirational goals can guide your broader journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-lg text-foreground/80 pl-2">
              {aiResults.suggestedGoals.map((goal, index) => (
                <li key={`goal-${index}`}>{goal}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {aiResults.projectBreakdowns && aiResults.projectBreakdowns.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline mb-6 text-center flex items-center justify-center">
             <Lightbulb className="mr-3 h-8 w-8 text-primary" />
            Detailed Project Ideas
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiResults.projectBreakdowns.map((project, index) => (
              <Card key={`project-${index}`} className="shadow-xl flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-5">
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-primary/90">Why this project?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.detailedRationale}</p>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-md font-semibold">
                        <ListChecks className="mr-2 h-5 w-5 text-primary" /> Key Steps to Get Started
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                          {project.keySteps.map((step, stepIndex) => (
                            <li key={`project-${index}-step-${stepIndex}`}>{step}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {project.potentialChallenges && project.potentialChallenges.length > 0 && (
                       <AccordionItem value="item-2">
                        <AccordionTrigger className="text-md font-semibold">
                           <AlertTriangle className="mr-2 h-5 w-5 text-amber-600" /> Potential Challenges & Tips
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                            {project.potentialChallenges.map((challenge, chalIndex) => (
                              <li key={`project-${index}-challenge-${chalIndex}`}>{challenge}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-md font-semibold">
                         <Trophy className="mr-2 h-5 w-5 text-green-600" /> Expected Outcome
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground pl-1">{project.expectedOutcome}</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {project.suggestedResources && (
                      <AccordionItem value="item-4">
                        <AccordionTrigger className="text-md font-semibold">
                           <Sparkles className="mr-2 h-5 w-5 text-purple-600" /> Suggested Resources
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderResources(project.suggestedResources)}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground italic">Remember, these are AI suggestions. Adapt them to your unique journey!</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-12 text-center">
        <Button onClick={() => router.push('/discover')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reflections
        </Button>
      </div>
    </div>
  );
}

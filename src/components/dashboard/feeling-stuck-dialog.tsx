
"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Lightbulb, Youtube, FileText, Globe, Milestone, Brain, HelpCircle } from "lucide-react";
import { getUnstuckAdvice, type GetUnstuckInput, type GetUnstuckOutput } from '@/ai/flows/get-unstuck-flow';
import type { FlowSuggestedResources } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const formSchema = z.object({
  problemDescription: z.string().min(10, { message: "Please describe your problem in at least 10 characters." }),
});

type FeelingStuckDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeelingStuckDialog({ open, onOpenChange }: FeelingStuckDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<GetUnstuckOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAiAdvice(null);
    try {
      const result = await getUnstuckAdvice(values);
      setAiAdvice(result);
      toast({ title: "AI Advice Ready!", description: "Here's some guidance to help you get unstuck." });
    } catch (error: any) {
      console.error("Feeling Stuck AI error:", error);
      toast({
        title: "AI Error",
        description: error.message || "An unexpected error occurred while fetching advice.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleDialogClose = () => {
    onOpenChange(false);
    // Delay reset to allow dialog to close smoothly
    setTimeout(() => {
        form.reset();
        setAiAdvice(null);
        setIsLoading(false);
    }, 300);
  }

  const renderResources = (resources?: FlowSuggestedResources) => {
    if (!resources || (!resources.youtubeVideos?.length && !resources.articles?.length && !resources.websites?.length)) {
      return <p className="text-sm text-muted-foreground">No specific resources suggested.</p>;
    }
    return (
      <div className="space-y-3 text-sm">
        {resources.youtubeVideos && resources.youtubeVideos.length > 0 && (
          <div>
            <h5 className="font-semibold mb-1 flex items-center"><Youtube className="mr-2 h-4 w-4 text-red-500"/>YouTube Videos:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.youtubeVideos.map((video, i) => (
                <li key={`yt-${i}`}><Link href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{video.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {resources.articles && resources.articles.length > 0 && (
          <div>
            <h5 className="font-semibold mb-1 flex items-center"><FileText className="mr-2 h-4 w-4 text-blue-500"/>Articles/Blogs:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.articles.map((article, i) => (
                <li key={`article-${i}`}><Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{article.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {resources.websites && resources.websites.length > 0 && (
          <div>
            <h5 className="font-semibold mb-1 flex items-center"><Globe className="mr-2 h-4 w-4 text-green-500"/>Websites/Tools:</h5>
            <ul className="list-disc list-inside space-y-0.5 pl-4">
              {resources.websites.map((site, i) => (
                <li key={`site-${i}`}><Link href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{site.name}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isLoading) { // Prevent closing while loading
        if (!isOpen) {
            handleDialogClose();
        } else {
            onOpenChange(true);
        }
      }
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <HelpCircle className="mr-2 h-6 w-6 text-primary" /> Feeling Stuck? Get AI Help
          </DialogTitle>
          <DialogDescription>
            Describe what you're stuck on, and our AI will provide a roadmap, solutions, and resources to help you move forward.
          </DialogDescription>
        </DialogHeader>

        {!aiAdvice && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="problemDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you feeling stuck on?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., I can't figure out how to start my new project, I'm struggling to learn a new coding concept, I'm procrastinating on an important task..." {...field} rows={5}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Advice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Advice
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {isLoading && !aiAdvice && (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">AI is thinking...</p>
            </div>
        )}

        {aiAdvice && !isLoading && (
          <div className="flex-grow overflow-y-auto pr-2 space-y-6 py-4">
            {aiAdvice.clarifiedProblem && (
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-yellow-500" /> AI's Understanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">"{aiAdvice.clarifiedProblem}"</p>
                    </CardContent>
                 </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Milestone className="mr-2 h-5 w-5 text-blue-500" /> Suggested Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-decimal list-inside space-y-2 text-sm">
                        {aiAdvice.suggestedRoadmap.map((step, index) => (
                            <li key={`roadmap-${index}`}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Brain className="mr-2 h-5 w-5 text-purple-500" /> Key Solution Insights</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside space-y-2 text-sm">
                        {aiAdvice.keySolutionInsights.map((insight, index) => (
                            <li key={`insight-${index}`}>{insight}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            {aiAdvice.suggestedResources && 
             (aiAdvice.suggestedResources.articles || aiAdvice.suggestedResources.websites || aiAdvice.suggestedResources.youtubeVideos) && (
                <Card>
                    <CardHeader>
                         <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-green-500" /> Suggested Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderResources(aiAdvice.suggestedResources)}
                    </CardContent>
                </Card>
            )}
            <DialogFooter className="pt-4">
                <Button type="button" onClick={() => { form.reset(); setAiAdvice(null); /* Allow re-submission */ }}>Ask About Something Else</Button>
                <Button type="button" variant="outline" onClick={handleDialogClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


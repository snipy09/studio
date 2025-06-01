
"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";
import { generateFlowFromDescription, type GenerateFlowFromDescriptionInput } from '@/ai/flows/generate-flow-from-description';
import type { Flow, Step } from "@/lib/types"; 
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  description: z.string().min(10, { message: "Please describe your goal in at least 10 characters." }),
  availableTime: z.string().optional(),
  priorityLevel: z.enum(["Low", "Medium", "High"]).optional(),
  resources: z.string().optional(),
});

type AiFlowGeneratorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlowCreated: (newFlow: Flow) => void; 
};

export function AiFlowGeneratorDialog({ open, onOpenChange, onFlowCreated }: AiFlowGeneratorDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      availableTime: "",
      priorityLevel: undefined,
      resources: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const aiInput: GenerateFlowFromDescriptionInput = {
        description: values.description,
        availableTime: values.availableTime,
        priorityLevel: values.priorityLevel,
        resources: values.resources,
      };
      const result = await generateFlowFromDescription(aiInput);

      if (result.flow && result.flow.length > 0) {
        const now = new Date().toISOString();
        const newSteps: Step[] = result.flow.map((stepName, index) => ({
          id: `step-ai-${Date.now()}-${index}`,
          name: stepName,
          status: "todo",
          createdAt: now,
          updatedAt: now,
        }));
        
        const newFlowName = `AI: ${values.description.substring(0, 30)}${values.description.length > 30 ? '...' : ''}`;
        const newFlow: Flow = {
          id: `flow-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: newFlowName,
          description: values.description,
          userId: user?.uid || "demo-user-uid-123",
          steps: newSteps,
          stepsOrder: newSteps.map(step => step.id),
          createdAt: now,
          updatedAt: now,
        };

        onFlowCreated(newFlow);

        toast({ title: "AI Flow Generated!", description: `Flow "${newFlowName}" added with ${result.flow.length} steps.` });
        onOpenChange(false);
        form.reset();
      } else {
        toast({ title: "AI Flow Generation Failed", description: "The AI couldn't generate a flow. Please try a different description.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("AI Flow Generation error:", error);
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isLoading) {
        onOpenChange(isOpen);
        if(!isOpen) form.reset();
      }
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" /> AI Flow Generator</DialogTitle>
          <DialogDescription>
            Describe what you want to achieve, and let our AI create a custom flow for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your goal or project?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Launch a new SaaS product, Learn to play guitar, Plan a birthday party" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availableTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Time (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 weeks, 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priorityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Resources (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Team of 3 developers, $500 budget, Design software" {...field} rows={2}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Flow"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


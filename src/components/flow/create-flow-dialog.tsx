
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
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";

// Type for the flow data expected by the dashboard
type DashboardFlow = {
  id: string;
  name: string;
  description: string;
  stepCount: number;
  lastUpdated: string;
};

const formSchema = z.object({
  name: z.string().min(3, { message: "Flow name must be at least 3 characters." }),
  description: z.string().optional(),
});

type CreateFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlowCreated: (newFlow: DashboardFlow) => void; 
};

export function CreateFlowDialog({ open, onOpenChange, onFlowCreated }: CreateFlowDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newFlow: DashboardFlow = {
        id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // More unique ID
        name: values.name,
        description: values.description || "No description provided.",
        stepCount: 0, // New flows start with 0 steps
        lastUpdated: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      };
      
      onFlowCreated(newFlow); // Pass the new flow data to the parent component
      
      toast({ title: "Flow Created!", description: `Flow "${values.name}" has been added to your dashboard.` });
      
      onOpenChange(false); 
      form.reset(); 
    } catch (error: any) {
      console.error("Error creating flow:", error);
      toast({
        title: "Error Creating Flow",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isSubmitting) { 
        onOpenChange(isOpen);
        if (!isOpen) form.reset(); 
      }
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary" /> Create New Flow</DialogTitle>
          <DialogDescription>
            Give your new workflow a name and an optional description to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Routine, Project Alpha Onboarding" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe what this flow is about." {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Flow"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

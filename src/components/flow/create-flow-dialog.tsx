
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
import type { Flow } from "@/lib/types"; // Import the main Flow type
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  name: z.string().min(3, { message: "Flow name must be at least 3 characters." }),
  description: z.string().optional(),
});

type CreateFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlowCreated: (newFlow: Flow) => void; // Expect a full Flow object
};

export function CreateFlowDialog({ open, onOpenChange, onFlowCreated }: CreateFlowDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
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
      const now = new Date().toISOString();
      const newFlow: Flow = {
        id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: values.name,
        description: values.description || "",
        userId: user?.uid || "dummy-user-uid-123", // Get actual user ID
        steps: [],
        stepsOrder: [],
        createdAt: now,
        updatedAt: now,
      };

      onFlowCreated(newFlow); // Pass the new full flow data to the parent component

      toast({ title: "Flow Created!", description: `Flow "${values.name}" has been added.` });

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

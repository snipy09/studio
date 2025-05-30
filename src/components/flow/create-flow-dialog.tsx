
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
// import { useAuth } from '@/contexts/auth-context'; // For when saving is implemented
// import { useRouter } from 'next/navigation'; // For redirecting after save
// import { createNewFlow } from '@/lib/firebase/firestore'; // Placeholder for Firestore function

const formSchema = z.object({
  name: z.string().min(3, { message: "Flow name must be at least 3 characters." }),
  description: z.string().optional(),
});

type CreateFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFlowDialog({ open, onOpenChange }: CreateFlowDialogProps) {
  const { toast } = useToast();
  // const { user } = useAuth();
  // const router = useRouter();
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
    // if (!user) {
    //   toast({ title: "Error", description: "You must be logged in to create a flow.", variant: "destructive" });
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      // const newFlowId = await createNewFlow(user.uid, values.name, values.description);
      // toast({ title: "Flow Created!", description: `Flow "${values.name}" has been successfully created.` });
      // router.push(`/flow/${newFlowId}`);
      
      // Placeholder behavior:
      console.log("New flow data:", values);
      toast({ title: "Flow Created (Simulated)", description: `Flow "${values.name}" would be created. Firestore integration pending.` });
      
      onOpenChange(false); // Close dialog
      form.reset(); // Reset form
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
      if (!isSubmitting) { // Prevent closing while submitting
        onOpenChange(isOpen);
        if (!isOpen) form.reset(); // Reset form if dialog is closed
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

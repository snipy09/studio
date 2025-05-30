"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";
import { generateFlowFromDescription, type GenerateFlowFromDescriptionInput } from '@/ai/flows/generate-flow-from-description';
// import { createFlowWithSteps } from '@/lib/firebase/firestore'; // Placeholder for Firestore
// import { useAuth } from '@/contexts/auth-context';
// import { useRouter } from 'next/navigation';

const formSchema = z.object({
  description: z.string().min(10, { message: "Please describe your goal in at least 10 characters." }),
  availableTime: z.string().optional(),
  priorityLevel: z.enum(["Low", "Medium", "High"]).optional(),
  resources: z.string().optional(),
});

type AiFlowGeneratorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiFlowGeneratorDialog({ open, onOpenChange }: AiFlowGeneratorDialogProps) {
  const { toast } = useToast();
  // const { user } = useAuth();
  // const router = useRouter();
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
        // if (user) {
        //   const newFlowId = await createFlowWithSteps(user.uid, `AI: ${values.description.substring(0,30)}...`, result.flow, values.description);
        //   toast({ title: "AI Flow Generated!", description: "Your new flow has been created and populated with steps." });
        //   router.push(`/flow/${newFlowId}`);
        // } else {
        //   toast({ title: "Error", description: "You must be logged in to save the flow.", variant: "destructive" });
        // }
        toast({ title: "AI Flow Generated!", description: `Generated ${result.flow.length} steps. Integration to save flow pending.` });
        console.log("Generated flow steps:", result.flow);
        onOpenChange(false); // Close dialog on success
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Optional: If you want a trigger button outside this component
      <DialogTrigger asChild>
        <Button variant="outline"><Lightbulb className="mr-2 h-4 w-4" /> Plan with AI</Button>
      </DialogTrigger>
      */}
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


"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { prebuiltTemplates } from "@/data/templates";
import { PlusCircle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { saveStoredFlow } from "@/lib/flow-storage";
import type { Flow, Step, StepStatus } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUseTemplate = async (templateId: string) => {
    const selectedTemplate = prebuiltTemplates.find(t => t.id === templateId);
    if (!selectedTemplate) {
      toast({ title: "Error", description: "Template not found.", variant: "destructive" });
      return;
    }

    try {
      const now = new Date().toISOString();
      const newFlowId = `flow-tpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Create new step instances with unique IDs
      const newSteps: Step[] = selectedTemplate.steps.map(templateStep => ({
        ...templateStep,
        id: `step-${newFlowId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        status: "todo" as StepStatus, // Reset status
        createdAt: now,
        updatedAt: now,
      }));

      const newFlow: Flow = {
        id: newFlowId,
        name: `Copy of: ${selectedTemplate.name}`,
        description: selectedTemplate.description,
        userId: user?.uid || "demo-user-uid-123", 
        steps: newSteps,
        stepsOrder: newSteps.map(step => step.id),
        isTemplate: false, 
        createdAt: now,
        updatedAt: now,
      };

      saveStoredFlow(newFlow);
      toast({ title: "Flow Created", description: `New flow "${newFlow.name}" created from template.`});
      router.push(`/flow/${newFlowId}`);

    } catch (error) {
      console.error("Error creating flow from template:", error);
      toast({ title: "Error", description: "Failed to create flow from template.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Flow Templates</h1>
        <p className="text-muted-foreground">
          Kickstart your projects with our ready-made flow templates.
        </p>
      </div>

      {prebuiltTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prebuiltTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Category: {template.category}</p>
                <p className="text-sm text-muted-foreground">Steps: {template.steps.length}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleUseTemplate(template.id)}>
                  <Copy className="mr-2 h-4 w-4" /> Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2 font-headline">No Templates Available</h3>
          <p className="text-muted-foreground">
            Check back later for pre-built templates.
          </p>
        </div>
      )}
    </div>
  );
}


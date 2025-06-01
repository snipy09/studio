
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Lightbulb, LayoutGrid, FolderKanban, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";
import { CreateFlowDialog } from "@/components/flow/create-flow-dialog";
import { AiFlowGeneratorDialog } from "@/components/flow/ai-flow-generator-dialog";
import type { Flow, FlowSuggestedResources } from "@/lib/types";
import { getAllStoredFlows, saveStoredFlow, deleteStoredFlowById } from "@/lib/flow-storage";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { suggestFlowResources, type SuggestFlowResourcesInput } from "@/ai/flows/suggest-flow-resources";


const DashboardPage: NextPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [isFetchingResources, setIsFetchingResources] = useState(false);

  useEffect(() => {
    setFlows(getAllStoredFlows());
  }, []);

  const handleAddFlow = useCallback(async (newFlowData: Omit<Flow, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    setIsFetchingResources(true);
    const now = new Date().toISOString();
    const flowId = newFlowData.id || `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const flowToSave: Flow = {
      ...newFlowData,
      id: flowId,
      userId: user?.uid || "dummy-user-uid-123",
      createdAt: now,
      updatedAt: now,
      steps: newFlowData.steps || [],
      stepsOrder: newFlowData.stepsOrder || (newFlowData.steps || []).map(s => s.id),
    };

    // Initial save so flow appears quickly
    let currentFlows = saveStoredFlow(flowToSave);
    setFlows(currentFlows);
    toast({ title: "Flow Created!", description: `"${flowToSave.name}" added. Fetching resources...` });

    try {
      const resourceInput: SuggestFlowResourcesInput = {
        flowName: flowToSave.name,
        flowDescription: flowToSave.description,
      };
      const resources = await suggestFlowResources(resourceInput);
      
      const flowWithResources: Flow = {
        ...flowToSave,
        suggestedResources: resources,
        updatedAt: new Date().toISOString(), // Update timestamp
      };
      
      currentFlows = saveStoredFlow(flowWithResources);
      setFlows(currentFlows);
      toast({ title: "Resources Added", description: `AI found some helpful resources for "${flowToSave.name}".` });

    } catch (error: any) {
      console.error("Error fetching resources for flow:", error);
      toast({
        title: "Resource Fetching Failed",
        description: `Could not fetch AI resources for "${flowToSave.name}". You can try again later.`,
        variant: "destructive",
      });
      // Flow is already saved without resources, which is fine.
    } finally {
      setIsFetchingResources(false);
    }
  }, [user?.uid, toast]);


  const openDeleteConfirmation = (flow: Flow) => {
    setFlowToDelete(flow);
  };

  const handleConfirmDelete = () => {
    if (flowToDelete) {
      const updatedFlows = deleteStoredFlowById(flowToDelete.id);
      setFlows(updatedFlows);
      toast({ title: "Flow Deleted", description: `"${flowToDelete.name}" has been deleted.` });
      setFlowToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {user?.displayName?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here are your current flows. Ready to get productive?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <CreateFlowDialog
          open={isCreateFlowOpen}
          onOpenChange={setIsCreateFlowOpen}
          onFlowCreated={handleAddFlow}
        />
        <Button
          size="lg"
          className="md:col-span-1"
          onClick={() => setIsCreateFlowOpen(true)}
          disabled={isFetchingResources}
        >
          {isFetchingResources && isCreateFlowOpen ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
           Create New Flow
        </Button>

        <AiFlowGeneratorDialog
          open={isAiGeneratorOpen}
          onOpenChange={setIsAiGeneratorOpen}
          onFlowCreated={handleAddFlow}
        />
        <Button
          size="lg"
          variant="outline"
          className="md:col-span-1"
          onClick={() => setIsAiGeneratorOpen(true)}
          disabled={isFetchingResources}
        >
          {isFetchingResources && isAiGeneratorOpen ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lightbulb className="mr-2 h-5 w-5" />}
           AI Flow Generator
        </Button>
      </div>
       {isFetchingResources && (
        <div className="mb-6 flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Processing new flow and fetching resources...</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-6 font-headline">Your Flows</h2>
        {flows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <Card key={flow.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline">{flow.name}</CardTitle>
                  <CardDescription>{flow.description || "No description."}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Steps: {flow.steps.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4">
                  <Link href={`/flow/${flow.id}`} passHref legacyBehavior>
                    <Button variant="default">View Flow</Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/90" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      openDeleteConfirmation(flow); 
                    }}
                    aria-label="Delete flow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <FolderKanban className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 font-headline">No Flows Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating a new flow or using our AI generator.
            </p>
            <Button
              onClick={() => setIsCreateFlowOpen(true)}
              disabled={isFetchingResources}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Flow
            </Button>
          </div>
        )}
      </div>

      {flowToDelete && (
        <AlertDialog open={!!flowToDelete} onOpenChange={(open) => !open && setFlowToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the flow "{flowToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFlowToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default DashboardPage;

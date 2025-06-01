
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Lightbulb, FolderKanban, Trash2, Loader2, ListTodo, CalendarDays, XCircle, HelpCircle, Sparkles } from "lucide-react";
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
import { FeelingStuckDialog } from "@/components/dashboard/feeling-stuck-dialog";
import type { Flow, Task, Step } from "@/lib/types";
import { getAllStoredFlows, saveStoredFlow, deleteStoredFlowById } from "@/lib/flow-storage";
import { getAllStoredTasks, saveStoredTask, deleteStoredTaskById, toggleTaskCompletion } from "@/lib/task-storage";
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { suggestFlowResources, type SuggestFlowResourcesInput } from "@/ai/flows/suggest-flow-resources";
import { PomodoroTimer } from "@/components/tools/pomodoro-timer";


const DashboardPage: NextPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isFeelingStuckOpen, setIsFeelingStuckOpen] = useState(false);

  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isProcessingFlow, setIsProcessingFlow] = useState(false);

  useEffect(() => {
    setFlows(getAllStoredFlows());
    setTasks(getAllStoredTasks());
  }, []);

  const handleAddFlow = useCallback(async (newFlowData: Omit<Flow, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    setIsProcessingFlow(true);
    const now = new Date().toISOString();
    const flowId = newFlowData.id || `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    let flowToSave: Flow = {
      ...newFlowData,
      id: flowId,
      userId: user?.uid || "demo-user-uid-123",
      createdAt: now,
      updatedAt: now,
      steps: newFlowData.steps || [],
      stepsOrder: newFlowData.stepsOrder || (newFlowData.steps || []).map(s => s.id),
    };

    let currentFlows = saveStoredFlow(flowToSave);
    setFlows(currentFlows);
    toast({ title: "Flow Created!", description: `"${flowToSave.name}" added.` });

    if (!newFlowData.suggestedResources) { 
      toast({ title: "Fetching Resources...", description: `AI is finding resources for "${flowToSave.name}".`});
      try {
        const resourceInput: SuggestFlowResourcesInput = {
          flowName: flowToSave.name,
          flowDescription: flowToSave.description,
        };
        const resources = await suggestFlowResources(resourceInput);
        
        const flowWithResources: Flow = {
          ...flowToSave,
          suggestedResources: resources,
          updatedAt: new Date().toISOString(),
        };
        
        currentFlows = saveStoredFlow(flowWithResources);
        setFlows(currentFlows);
        toast({ title: "Resources Added", description: `AI found helpful resources for "${flowToSave.name}".` });

      } catch (error: any) {
        console.error("Error fetching resources for flow:", error);
        toast({
          title: "Resource Fetching Failed",
          description: `Could not fetch AI resources for "${flowToSave.name}".`,
          variant: "destructive",
        });
      }
    }
    setIsProcessingFlow(false);
  }, [user?.uid, toast]);


  const openDeleteFlowConfirmation = (flow: Flow) => {
    setFlowToDelete(flow);
  };

  const handleConfirmDeleteFlow = () => {
    if (flowToDelete) {
      const updatedFlows = deleteStoredFlowById(flowToDelete.id);
      setFlows(updatedFlows);
      toast({ title: "Flow Deleted", description: `"${flowToDelete.name}" has been deleted.` });
      setFlowToDelete(null);
    }
  };

  const handleAddStepAsTask = (stepId: string) => {
    const allStepsFromAllFlows = flows.flatMap(f => f.steps.map(s => ({ ...s, flowName: f.name, flowId: f.id })));
    const selectedStep = allStepsFromAllFlows.find(s => s.id === stepId);

    if (!selectedStep) {
      toast({ title: "Error", description: "Selected step not found.", variant: "destructive" });
      return;
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'> = {
      name: selectedStep.name,
      flowId: selectedStep.flowId,
      flowName: selectedStep.flowName,
      stepId: selectedStep.id,
      stepName: selectedStep.name,
      notes: selectedStep.description || '',
    };
    const updatedTasks = saveStoredTask(newTask);
    setTasks(updatedTasks);
    toast({ title: "Task Added", description: `Task "${selectedStep.name}" added from flow "${selectedStep.flowName}".` });
  };


  const handleToggleTask = (taskId: string) => {
    const updatedTasks = toggleTaskCompletion(taskId);
    setTasks(updatedTasks);
  };

  const openDeleteTaskConfirmation = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      const updatedTasks = deleteStoredTaskById(taskToDelete.id);
      setTasks(updatedTasks);
      toast({ title: "Task Deleted", description: `"${taskToDelete.name}" has been deleted.` });
      setTaskToDelete(null);
    }
  };
  
  const pendingTasks = tasks.filter(task => !task.isCompleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const completedTasks = tasks.filter(task => task.isCompleted).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.createdAt).getTime());

  const allStepsForTaskDropdown = flows.reduce((acc, flow) => {
    const flowSteps = flow.steps.map(step => ({
      id: step.id,
      name: step.name,
      flowName: flow.name,
      flowId: flow.id,
    }));
    return [...acc, ...flowSteps];
  }, [] as Array<{id: string, name: string, flowName: string, flowId: string}>);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {user?.displayName?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's your dashboard. Ready to get productive?
        </p>
      </div>

      {/* Task List Card */}
      <Card className="mb-12 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center font-headline"><ListTodo className="mr-3 h-6 w-6 text-primary" /> My Tasks</CardTitle>
            <PomodoroTimer />
          </div>
          <CardDescription>Quickly add tasks from your flow steps or manage existing ones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
             <Select onValueChange={(stepId) => { if(stepId) handleAddStepAsTask(stepId); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add a task from your flow steps..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select a step to add as a task</SelectLabel>
                  {allStepsForTaskDropdown.length > 0 ? (
                    allStepsForTaskDropdown.map(step => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.name} (From: {step.flowName})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-steps" disabled>No steps available in your flows</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-muted-foreground mb-1">Pending</h3>
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.isCompleted}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark task ${task.name} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                    />
                    <label htmlFor={`task-${task.id}`} className={`flex-grow cursor-pointer ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      <span className="font-medium">{task.name}</span>
                      {(task.flowName || task.dueDate) && (
                        <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                          {task.flowName && <span>From: {task.flowName}{task.stepName ? ` / ${task.stepName}`: ''}</span>}
                          {task.dueDate && <span className="inline-flex items-center"><CalendarDays className="mr-1 h-3 w-3"/> {format(new Date(task.dueDate), "MMM dd")}</span>}
                        </div>
                      )}
                    </label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteTaskConfirmation(task)} className="text-destructive hover:text-destructive/90 h-7 w-7">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
             <div className="mt-6 space-y-3">
                <h3 className="text-md font-semibold text-muted-foreground mb-1">Completed</h3>
                {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md opacity-70">
                   <div className="flex items-center gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.isCompleted}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    <label htmlFor={`task-${task.id}`} className={`flex-grow cursor-pointer ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      <span className="font-medium">{task.name}</span>
                       {(task.flowName || task.dueDate) && (
                        <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                          {task.flowName && <span>From: {task.flowName}{task.stepName ? ` / ${task.stepName}`: ''}</span>}
                          {task.dueDate && <span className="inline-flex items-center"><CalendarDays className="mr-1 h-3 w-3"/> {format(new Date(task.dueDate), "MMM dd")}</span>}
                        </div>
                      )}
                    </label>
                  </div>
                   <Button variant="ghost" size="icon" onClick={() => openDeleteTaskConfirmation(task)} className="text-destructive hover:text-destructive/90 h-7 w-7">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
             </div>
          )}

          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No tasks yet. Add one using the dropdown above!</p>
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <CreateFlowDialog
          open={isCreateFlowOpen}
          onOpenChange={setIsCreateFlowOpen}
          onFlowCreated={handleAddFlow}
        />
        <Button
          size="lg"
          className="md:col-span-1"
          onClick={() => setIsCreateFlowOpen(true)}
          disabled={isProcessingFlow}
        >
          {isProcessingFlow && isCreateFlowOpen ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
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
          disabled={isProcessingFlow}
        >
          {isProcessingFlow && isAiGeneratorOpen ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
           AI Flow Generator
        </Button>
        
        <FeelingStuckDialog
          open={isFeelingStuckOpen}
          onOpenChange={setIsFeelingStuckOpen}
        />
        <Button
            size="lg"
            variant="secondary"
            className="md:col-span-1"
            onClick={() => setIsFeelingStuckOpen(true)}
        >
            <HelpCircle className="mr-2 h-5 w-5" />
            Feeling Stuck?
        </Button>
      </div>
       {isProcessingFlow && (
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
                      openDeleteFlowConfirmation(flow); 
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
              disabled={isProcessingFlow}
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
              <AlertDialogTitle>Confirm Flow Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the flow "{flowToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFlowToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteFlow}>Delete Flow</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {taskToDelete && (
        <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Task Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the task "{taskToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteTask}>Delete Task</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default DashboardPage;


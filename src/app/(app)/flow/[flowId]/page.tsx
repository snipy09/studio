
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Flow, Step, StepStatus, Priority, Difficulty, Task } from "@/lib/types";
import { getStoredFlowById, saveStoredFlow } from "@/lib/flow-storage";
import { saveStoredTask } from "@/lib/task-storage";
import { PlusCircle, Edit3, Trash2, CalendarIcon, Loader2, CheckCircle, Palette, Pencil, Sparkles, Wand2, Youtube, FileText, Globe, ListChecks, ListPlus, Briefcase } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { summarizeFlowDetails, type SummarizeFlowDetailsInput, type SummarizeFlowDetailsOutput } from '@/ai/flows/summarize-flow-details';
import Link from "next/link";

export default function FlowDetailPage() {
  const currentParams = useParams();
  // Ensure flowId is explicitly a string or undefined.
  const flowId: string | undefined = typeof currentParams?.flowId === 'string' ? currentParams.flowId : undefined;

  const router = useRouter();
  const { toast } = useToast();

  const [flow, setFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [isEditStepDialogOpen, setIsEditStepDialogOpen] = useState(false);
  const [newStepName, setNewStepName] = useState("");

  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);

  const [isEditFlowDetailsOpen, setIsEditFlowDetailsOpen] = useState(false);
  const [editedFlowName, setEditedFlowName] = useState("");
  const [editedFlowDescription, setEditedFlowDescription] = useState("");

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiGeneratedDetails, setAiGeneratedDetails] = useState<SummarizeFlowDetailsOutput | null>(null);

  const [stepToAddTask, setStepToAddTask] = useState<Step | null>(null);
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);

  const updateFlowInStorage = useCallback((updatedFlow: Flow) => {
    setFlow(updatedFlow);
    saveStoredFlow(updatedFlow);
  }, []);

  const triggerAiSummary = useCallback(async (currentFlow: Flow) => {
    if (!currentFlow || (!currentFlow.description || currentFlow.description.trim().length < 10) && currentFlow.steps && currentFlow.steps.length > 0) {
      setAiSummaryLoading(true);
      setAiGeneratedDetails(null);
      try {
        const input: SummarizeFlowDetailsInput = {
          flowName: currentFlow.name,
          stepNames: currentFlow.steps.map(s => s.name),
        };
        const result = await summarizeFlowDetails(input);

        setAiGeneratedDetails(result);

        if (result.generatedDescription && (!currentFlow.description || currentFlow.description.trim().length < 10)) {
          const updatedFlowWithAiDesc: Flow = {
            ...currentFlow,
            description: result.generatedDescription,
            updatedAt: new Date().toISOString(),
          };
          updateFlowInStorage(updatedFlowWithAiDesc);
          setEditedFlowDescription(result.generatedDescription);
        }

        toast({
          title: "AI Insights Generated",
          description: "Flow summary and details have been enhanced by AI.",
        });

      } catch (error: any) {
        console.error("AI Summary Generation error:", error);
        toast({
          title: "AI Summary Error",
          description: error.message || "Could not generate AI summary.",
          variant: "destructive",
        });
      } finally {
        setAiSummaryLoading(false);
      }
    }
  }, [updateFlowInStorage, toast]);


  useEffect(() => {
    setIsLoading(true);
    if (flowId) {
      const fetchedFlow = getStoredFlowById(flowId);
      if (fetchedFlow) {
        setFlow(fetchedFlow);
        setEditedFlowName(fetchedFlow.name);
        setEditedFlowDescription(fetchedFlow.description || "");

        if ((!fetchedFlow.description || fetchedFlow.description.trim().length < 10) && fetchedFlow.steps && fetchedFlow.steps.length > 0) {
            triggerAiSummary(fetchedFlow);
        }
        setIsLoading(false);
      } else {
        toast({ title: "Error", description: "Flow not found.", variant: "destructive" });
        router.push("/dashboard");
        // Keep loading true until redirect potentially happens or further state changes
      }
    } else {
      // If flowId is not available (e.g. bad URL or param not ready yet)
      // Check if running in browser context before router.push to avoid server-side errors with router
      if (typeof window !== 'undefined') {
        toast({ title: "Error", description: "Invalid flow URL.", variant: "destructive" });
        router.push("/dashboard");
      } else {
        // On server, or if router cannot be used, just set loading to false.
        // The render part will show "Flow not found".
        setIsLoading(false);
      }
    }
  // Removed currentParams from deps as flowId is the derived value we care about.
  // Adding router and toast to deps as they are used.
  }, [flowId, router, toast, triggerAiSummary]);


  const handleOpenEditFlowDialog = () => {
    if (flow) {
      setEditedFlowName(flow.name);
      setEditedFlowDescription(flow.description || "");
      setIsEditFlowDetailsOpen(true);
    }
  };

  const handleSaveFlowDetails = () => {
    if (!flow) return;
    if (!editedFlowName.trim()) {
      toast({ title: "Error", description: "Flow name cannot be empty.", variant: "destructive" });
      return;
    }
    const updatedFlow = {
      ...flow,
      name: editedFlowName.trim(),
      description: editedFlowDescription.trim(),
      updatedAt: new Date().toISOString(),
    };
    updateFlowInStorage(updatedFlow);
    setIsEditFlowDetailsOpen(false);
    toast({ title: "Flow Updated", description: "Flow details saved successfully." });
  };

  const handleAddStep = () => {
    if (!newStepName.trim() || !flow) return;
    const now = new Date().toISOString();
    const newStep: Step = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newStepName.trim(),
      status: "todo",
      createdAt: now,
      updatedAt: now,
    };
    const updatedFlow = {
      ...flow,
      steps: [...flow.steps, newStep],
      stepsOrder: [...flow.stepsOrder, newStep.id],
      updatedAt: now,
    };
    updateFlowInStorage(updatedFlow);
    setNewStepName("");
    toast({ title: "Step Added", description: `Step "${newStep.name}" added successfully.` });
  };

  const handleEditStep = (step: Step) => {
    setEditingStep({ ...step });
    setIsEditStepDialogOpen(true);
  };

  const handleSaveEditedStep = () => {
    if (!flow || !editingStep) return;
    const now = new Date().toISOString();
    const updatedSteps = flow.steps.map(s => s.id === editingStep.id ? { ...editingStep, updatedAt: now } : s);
    const updatedFlow = { ...flow, steps: updatedSteps, updatedAt: now };
    updateFlowInStorage(updatedFlow);
    setIsEditStepDialogOpen(false);
    setEditingStep(null);
    toast({ title: "Step Updated", description: `Step "${editingStep.name}" updated.` });
  };

  const handleDeleteStep = (stepIdToDelete: string) => {
    if (!flow) return;
    const stepToDelete = flow.steps.find(s => s.id === stepIdToDelete);
    if (!stepToDelete) return;

    const updatedSteps = flow.steps.filter(s => s.id !== stepIdToDelete);
    const updatedStepsOrder = flow.stepsOrder.filter(id => id !== stepIdToDelete);
    const updatedFlow = { ...flow, steps: updatedSteps, stepsOrder: updatedStepsOrder, updatedAt: new Date().toISOString() };
    updateFlowInStorage(updatedFlow);
    toast({ title: "Step Deleted", description: `Step "${stepToDelete.name}" deleted.`, variant: "destructive" });
  };

  const handleStatusChange = (stepIdToChange: string, status: StepStatus) => {
    if (!flow) return;
    const now = new Date().toISOString();
    const updatedSteps = flow.steps.map(s => s.id === stepIdToChange ? { ...s, status, updatedAt: now } : s);
    const updatedFlow = { ...flow, steps: updatedSteps, updatedAt: now };
    updateFlowInStorage(updatedFlow);
  };

  const handleAddStepAsTask = () => {
    if (!stepToAddTask || !flow) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'> = {
      name: stepToAddTask.name,
      flowId: flow.id,
      flowName: flow.name,
      stepId: stepToAddTask.id,
      stepName: stepToAddTask.name,
      dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
      notes: stepToAddTask.description || '',
    };
    saveStoredTask(newTask);
    toast({ title: "Task Created", description: `Task "${stepToAddTask.name}" added from flow.`});
    setStepToAddTask(null);
    setTaskDueDate(undefined);
  };

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case "todo": return "bg-muted/50 border-muted";
      case "inprogress": return "bg-blue-100 dark:bg-blue-900/50 border-blue-500";
      case "done": return "bg-green-100 dark:bg-green-900/50 border-green-500";
      default: return "bg-card";
    }
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "todo": return <Palette className="h-5 w-5 text-muted-foreground" />;
      case "inprogress": return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "done": return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Palette className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, stepIdToDrag: string) => {
    setDraggedStepId(stepIdToDrag);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetStepId: string) => {
    e.preventDefault();
    if (draggedStepId && draggedStepId !== targetStepId) {
      setDragOverStepId(targetStepId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent<HTMLDivElement>) => {
    setDragOverStepId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStepId: string) => {
    e.preventDefault();
    if (!draggedStepId || !flow || draggedStepId === targetStepId) {
      setDraggedStepId(null);
      setDragOverStepId(null);
      return;
    }

    const currentOrder = Array.from(flow.stepsOrder);
    const draggedItemIndex = currentOrder.indexOf(draggedStepId);
    const targetItemIndex = currentOrder.indexOf(targetStepId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    const [removed] = currentOrder.splice(draggedItemIndex, 1);
    currentOrder.splice(targetItemIndex, 0, removed);

    const updatedFlow = { ...flow, stepsOrder: currentOrder, updatedAt: new Date().toISOString() };
    updateFlowInStorage(updatedFlow);

    setDraggedStepId(null);
    setDragOverStepId(null);
    toast({ title: "Steps Reordered", description: "The order of steps has been updated." });
  };


  if (isLoading || !flow) { // Combined check for loading state or if flow is null
    // If flowId was initially undefined and useEffect is trying to redirect,
    // this will show loading until redirection or if flow remains null.
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p>{!flowId && !isLoading ? "Invalid flow URL. Redirecting..." : "Loading flow..."}</p>
      </div>
    );
  }

  const orderedSteps = flow.stepsOrder.map(id => flow.steps.find(s => s.id === id)).filter(Boolean) as Step[];

  const shouldShowAiInsights = aiGeneratedDetails && !aiSummaryLoading && (flow.steps && flow.steps.length > 0);
  const hasSuggestedResources = flow.suggestedResources &&
    ((flow.suggestedResources.youtubeVideos && flow.suggestedResources.youtubeVideos.length > 0) ||
     (flow.suggestedResources.articles && flow.suggestedResources.articles.length > 0) ||
     (flow.suggestedResources.websites && flow.suggestedResources.websites.length > 0));

  const shouldShowAiSection = shouldShowAiInsights || hasSuggestedResources;


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight font-headline">{flow.name}</CardTitle>
              {flow.description && <CardDescription className="mt-1">{flow.description}</CardDescription>}
              {(!flow.description || flow.description.trim().length < 10) && aiSummaryLoading && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Wand2 className="mr-2 h-4 w-4 animate-pulse text-primary" />
                    AI is crafting a summary for this flow...
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={handleOpenEditFlowDialog} aria-label="Edit flow details">
              <Pencil className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
             <Briefcase className="mr-2 h-5 w-5 text-primary" />
             Key Flow Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-muted-foreground">Total Steps</h4>
            <p className="text-lg font-semibold text-foreground">{flow.steps.length}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Est. Total Time</h4>
            <p className="text-lg font-semibold text-foreground">
              {aiSummaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (aiGeneratedDetails?.estimatedTotalTime || "N/A")}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Last Updated</h4>
            <p className="text-lg font-semibold text-foreground">{formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}</p>
          </div>
        </CardContent>
      </Card>

      {shouldShowAiSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {shouldShowAiInsights && aiGeneratedDetails?.insights && aiGeneratedDetails.insights.length > 0 && (
            <Card className="shadow-md bg-muted/20 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Key Observations (AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                  {aiGeneratedDetails.insights.map((insight, index) => (
                    <li key={`insight-${index}`}>{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {hasSuggestedResources && (
            <Card className="shadow-md bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Suggested Resources
                </CardTitle>
                <CardDescription>AI-powered suggestions to help you with this flow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {flow.suggestedResources?.youtubeVideos && flow.suggestedResources.youtubeVideos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 flex items-center"><Youtube className="mr-2 h-5 w-5 text-red-600"/>YouTube Videos</h4>
                    <ul className="space-y-1 list-disc list-inside pl-2">
                      {flow.suggestedResources.youtubeVideos.map((video, index) => (
                        <li key={`yt-${index}`} className="text-sm">
                          <Link href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {video.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {flow.suggestedResources?.articles && flow.suggestedResources.articles.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-600"/>Articles & Blogs</h4>
                    <ul className="space-y-1 list-disc list-inside pl-2">
                      {flow.suggestedResources.articles.map((article, index) => (
                        <li key={`article-${index}`} className="text-sm">
                          <Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {flow.suggestedResources?.websites && flow.suggestedResources.websites.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 flex items-center"><Globe className="mr-2 h-5 w-5 text-green-600"/>Websites & Tools</h4>
                    <ul className="space-y-1 list-disc list-inside pl-2">
                      {flow.suggestedResources.websites.map((site, index) => (
                        <li key={`site-${index}`} className="text-sm">
                          <Link href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {site.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}


      {isEditFlowDetailsOpen && (
        <Dialog open={isEditFlowDetailsOpen} onOpenChange={setIsEditFlowDetailsOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Flow Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flowName" className="text-right text-sm font-medium">Name</Label>
                <Input
                  id="flowName"
                  value={editedFlowName}
                  onChange={(e) => setEditedFlowName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flowDescription" className="text-right text-sm font-medium">Description</Label>
                <Textarea
                  id="flowDescription"
                  value={editedFlowDescription}
                  onChange={(e) => setEditedFlowDescription(e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditFlowDetailsOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveFlowDetails}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="New step name..."
          value={newStepName}
          onChange={(e) => setNewStepName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddStep(); }}
          className="flex-grow"
        />
        <Button onClick={handleAddStep} disabled={!newStepName.trim()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Step
        </Button>
      </div>

      <div className="space-y-1">
        {orderedSteps.map((step) => (
          <div
            key={step.id}
            draggable
            onDragStart={(e) => handleDragStart(e, step.id)}
            onDragOver={(e) => handleDragOver(e, step.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, step.id)}
            className={`cursor-grab rounded-lg transition-all duration-150 ease-in-out
                        ${draggedStepId === step.id ? "opacity-50 ring-2 ring-primary shadow-2xl" : ""}
                        ${dragOverStepId === step.id && draggedStepId !== step.id ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
          >
            <Card className={`shadow-md transition-all duration-300 ${getStepColor(step.status)}
                           ${draggedStepId === step.id ? "transform scale-105" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{step.name}</h3>
                  {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {step.priority && <span>Priority: <span className="font-medium">{step.priority}</span></span>}
                    {step.difficulty && <span>Difficulty: <span className="font-medium">{step.difficulty}</span></span>}
                    {step.estimatedTime && <span>Est. Time: <span className="font-medium">{step.estimatedTime}</span></span>}
                    {step.deadline && <span>Deadline: <span className="font-medium">{format(new Date(step.deadline), "PP")}</span></span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Popover open={stepToAddTask?.id === step.id} onOpenChange={(open) => {
                      if (!open) {
                          setStepToAddTask(null);
                          setTaskDueDate(undefined);
                      } else {
                          setStepToAddTask(step);
                      }
                  }}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Add to tasks">
                        <ListPlus className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 space-y-3">
                        <p className="text-sm font-medium">Add "{step.name}" to tasks</p>
                        <div>
                            <Label htmlFor="task-due-date" className="text-xs">Due Date (Optional)</Label>
                            <Calendar
                                mode="single"
                                selected={taskDueDate}
                                onSelect={setTaskDueDate}
                                initialFocus
                            />
                        </div>
                        <Button onClick={handleAddStepAsTask} size="sm" className="w-full">Add Task</Button>
                    </PopoverContent>
                  </Popover>

                  <Select value={step.status} onValueChange={(value) => handleStatusChange(step.id, value as StepStatus)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleEditStep(step)} className="h-8 w-8">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the step "{step.name}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDeleteStep(step.id)}>Delete</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {editingStep && (
        <Dialog open={isEditStepDialogOpen} onOpenChange={(open) => {
            setIsEditStepDialogOpen(open);
            if (!open) setEditingStep(null);
        }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Step: {editingStep.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-sm font-medium">Name</Label>
                <Input id="name" value={editingStep.name} className="col-span-3"
                  onChange={(e) => setEditingStep(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-sm font-medium">Description</Label>
                <Textarea id="description" value={editingStep.description || ''} className="col-span-3"
                  onChange={(e) => setEditingStep(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right text-sm font-medium">Priority</Label>
                <Select
                  value={editingStep.priority}
                  onValueChange={(value) => setEditingStep(prev => prev ? {...prev, priority: value as Priority} : null)}
                >
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="difficulty" className="text-right text-sm font-medium">Difficulty</Label>
                 <Select
                  value={editingStep.difficulty}
                  onValueChange={(value) => setEditingStep(prev => prev ? {...prev, difficulty: value as Difficulty} : null)}
                >
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimatedTime" className="text-right text-sm font-medium">Est. Time</Label>
                <Input id="estimatedTime" value={editingStep.estimatedTime || ''} className="col-span-3"
                  placeholder="e.g., 2 hours, 1 day"
                  onChange={(e) => setEditingStep(prev => prev ? {...prev, estimatedTime: e.target.value} : null)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="deadline" className="text-right text-sm font-medium">Deadline</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`col-span-3 justify-start text-left font-normal ${!editingStep.deadline && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingStep.deadline ? format(new Date(editingStep.deadline), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingStep.deadline ? new Date(editingStep.deadline) : undefined}
                        onSelect={(date) => setEditingStep(prev => prev ? {...prev, deadline: date?.toISOString()} : null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditStepDialogOpen(false); setEditingStep(null); }}>Cancel</Button>
              <Button type="button" onClick={handleSaveEditedStep}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    
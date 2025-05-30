"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { Flow, Step, StepStatus, Priority, Difficulty } from "@/lib/types";
import { PlusCircle, Edit3, Trash2, CalendarIcon, Clock, AlertTriangle, CheckCircle, Loader2, Palette, GripVertical } from "lucide-react";
import { format } from "date-fns";
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// Mock data, replace with actual Firestore fetching and updates
const mockFlowsData: Flow[] = [
  {
    id: "1", name: "New App UI Design", userId: "mockUser",
    steps: [
      { id: "s1", name: "Ideate & Research", status: "done", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: "High", difficulty: "Medium", estimatedTime: "2 days", deadline: new Date(Date.now() + 2*24*60*60*1000).toISOString() },
      { id: "s2", name: "Wireframing", status: "inprogress", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: "High", difficulty: "Hard", estimatedTime: "3 days" },
      { id: "s3", name: "Prototyping", status: "todo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "s4", name: "User Testing", status: "todo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "s5", name: "Finalize", status: "todo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    stepsOrder: ["s1", "s2", "s3", "s4", "s5"],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// Placeholder for StepItem component if drag-and-drop is implemented
// function SortableStepItem({ id, step, onEdit, onDelete, onStatusChange }: { id: string, step: Step, onEdit: (step: Step) => void, onDelete: (stepId: string) => void, onStatusChange: (stepId: string, status: StepStatus) => void }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
//   const style = { transform: CSS.Transform.toString(transform), transition };
//   // ... StepItem JSX ...
// }


export default function FlowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const flowId = params.flowId as string;

  const [flow, setFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStepName, setNewStepName] = useState("");

  // Drag and Drop sensors
  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  // );

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching flow data
    const fetchedFlow = mockFlowsData.find(f => f.id === flowId);
    if (fetchedFlow) {
      setFlow(fetchedFlow);
    } else {
      toast({ title: "Error", description: "Flow not found.", variant: "destructive" });
      router.push("/dashboard");
    }
    setIsLoading(false);
  }, [flowId, router, toast]);

  const handleAddStep = () => {
    if (!newStepName.trim() || !flow) return;
    const newStep: Step = {
      id: `step-${Date.now()}`,
      name: newStepName.trim(),
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedFlow = {
      ...flow,
      steps: [...flow.steps, newStep],
      stepsOrder: [...flow.stepsOrder, newStep.id],
    };
    setFlow(updatedFlow);
    // TODO: Update Firestore
    setNewStepName("");
    toast({ title: "Step Added", description: `Step "${newStep.name}" added successfully.` });
  };

  const handleEditStep = (step: Step) => {
    setEditingStep(step);
    setIsEditDialogOpen(true);
  };

  const handleSaveStep = (updatedStep: Step) => {
    if (!flow || !editingStep) return;
    const updatedSteps = flow.steps.map(s => s.id === updatedStep.id ? { ...s, ...updatedStep, updatedAt: new Date().toISOString() } : s);
    setFlow({ ...flow, steps: updatedSteps });
    // TODO: Update Firestore
    setIsEditDialogOpen(false);
    setEditingStep(null);
    toast({ title: "Step Updated", description: `Step "${updatedStep.name}" updated.` });
  };

  const handleDeleteStep = (stepId: string) => {
    if (!flow) return;
    const stepToDelete = flow.steps.find(s => s.id === stepId);
    if (!stepToDelete) return;

    const updatedSteps = flow.steps.filter(s => s.id !== stepId);
    const updatedStepsOrder = flow.stepsOrder.filter(id => id !== stepId);
    setFlow({ ...flow, steps: updatedSteps, stepsOrder: updatedStepsOrder });
    // TODO: Update Firestore
    toast({ title: "Step Deleted", description: `Step "${stepToDelete.name}" deleted.`, variant: "destructive" });
  };

  const handleStatusChange = (stepId: string, status: StepStatus) => {
    if (!flow) return;
    const updatedSteps = flow.steps.map(s => s.id === stepId ? { ...s, status, updatedAt: new Date().toISOString() } : s);
    setFlow({ ...flow, steps: updatedSteps });
    // TODO: Update Firestore
  };

  // function handleDragEnd(event: any) {
  //   const { active, over } = event;
  //   if (active.id !== over.id && flow) {
  //     const oldIndex = flow.stepsOrder.indexOf(active.id as string);
  //     const newIndex = flow.stepsOrder.indexOf(over.id as string);
  //     const newStepsOrder = arrayMove(flow.stepsOrder, oldIndex, newIndex);
  //     setFlow({ ...flow, stepsOrder: newStepsOrder });
  //     // TODO: Update Firestore with new stepsOrder
  //   }
  // }

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case "todo": return "bg-muted/50 border-muted"; // Grey
      case "inprogress": return "bg-blue-100 dark:bg-blue-900/50 border-blue-500"; // Blue
      case "done": return "bg-green-100 dark:bg-green-900/50 border-green-500"; // Green
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


  if (isLoading) {
    return <div className="container mx-auto py-8 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /> <p>Loading flow...</p></div>;
  }

  if (!flow) {
    return <div className="container mx-auto py-8 text-center">Flow not found.</div>;
  }
  
  const orderedSteps = flow.stepsOrder.map(stepId => flow.steps.find(s => s.id === stepId)).filter(Boolean) as Step[];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight font-headline">{flow.name}</CardTitle>
          {flow.description && <CardDescription>{flow.description}</CardDescription>}
        </CardHeader>
      </Card>

      <div className="mb-6 flex gap-2">
        <Input 
          type="text" 
          placeholder="New step name..." 
          value={newStepName}
          onChange={(e) => setNewStepName(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleAddStep} disabled={!newStepName.trim()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Step
        </Button>
      </div>
      
      {/* <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flow.stepsOrder} strategy={verticalListSortingStrategy}> */}
          <div className="space-y-4">
            {orderedSteps.map((step) => (
              // <SortableStepItem key={step.id} id={step.id} step={step} onEdit={handleEditStep} onDelete={handleDeleteStep} onStatusChange={handleStatusChange} />
              // This is the simplified version without DndContext for now
              <Card key={step.id} className={`shadow-md transition-all duration-300 ${getStepColor(step.status)}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /> Placeholder for drag handle */}
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
                  <div className="flex items-center gap-2">
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
                          <Button variant="outline" onClick={() => {/* Close dialog, handled by DialogClose or manual state */}}>Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDeleteStep(step.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        {/* </SortableContext>
      </DndContext> */}


      {editingStep && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Step: {editingStep.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                <Input id="name" defaultValue={editingStep.name} className="col-span-3" 
                  onChange={(e) => setEditingStep({...editingStep, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">Description</label>
                <Textarea id="description" defaultValue={editingStep.description} className="col-span-3" 
                  onChange={(e) => setEditingStep({...editingStep, description: e.target.value})}
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="priority" className="text-right text-sm font-medium">Priority</label>
                <Select 
                  defaultValue={editingStep.priority}
                  onValueChange={(value) => setEditingStep({...editingStep, priority: value as Priority})}
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
                <label htmlFor="difficulty" className="text-right text-sm font-medium">Difficulty</label>
                 <Select 
                  defaultValue={editingStep.difficulty}
                  onValueChange={(value) => setEditingStep({...editingStep, difficulty: value as Difficulty})}
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
                <label htmlFor="estimatedTime" className="text-right text-sm font-medium">Est. Time</label>
                <Input id="estimatedTime" defaultValue={editingStep.estimatedTime} className="col-span-3" 
                  placeholder="e.g., 2 hours, 1 day"
                  onChange={(e) => setEditingStep({...editingStep, estimatedTime: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <label htmlFor="deadline" className="text-right text-sm font-medium">Deadline</label>
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
                        onSelect={(date) => setEditingStep({...editingStep, deadline: date?.toISOString()})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={() => handleSaveStep(editingStep)}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

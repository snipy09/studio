
"use client";

import React from "react"; 
import type { NextPage } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Lightbulb, LayoutGrid, FolderKanban } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { CreateFlowDialog } from "@/components/flow/create-flow-dialog"; 
import { AiFlowGeneratorDialog } from "@/components/flow/ai-flow-generator-dialog"; 
import Image from "next/image";

// Define a type for the flows displayed on the dashboard
type DashboardFlow = {
  id: string;
  name: string;
  description: string;
  stepCount: number;
  lastUpdated: string;
};

// Initial mock data for flows
const initialMockFlows: DashboardFlow[] = [
  { id: "1", name: "New App UI Design", description: "Complete UI/UX for the mobile app.", stepCount: 5, lastUpdated: "2 days ago" },
  { id: "2", name: "Marketing Campaign Q3", description: "Plan and execute Q3 marketing initiatives.", stepCount: 8, lastUpdated: "5 hours ago" },
  { id: "3", name: "Personal Fitness Plan", description: "Weekly workout and meal plan.", stepCount: 7, lastUpdated: "1 week ago" },
];

const DashboardPage: NextPage = () => {
  const { user } = useAuth();
  const [flows, setFlows] = React.useState<DashboardFlow[]>(initialMockFlows);

  // State for dialogs
  const [isCreateFlowOpen, setIsCreateFlowOpen] = React.useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = React.useState(false);

  const handleAddFlow = (newFlow: DashboardFlow) => {
    setFlows((prevFlows) => [newFlow, ...prevFlows]);
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
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Flow
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
        >
          <Lightbulb className="mr-2 h-5 w-5" /> AI Flow Generator
        </Button>

        <Link href="/templates" passHref legacyBehavior>
          <Button size="lg" variant="outline" className="md:col-span-1 w-full">
            <LayoutGrid className="mr-2 h-5 w-5" /> Browse Templates
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-6 font-headline">Your Flows</h2>
        {flows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <Card key={flow.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline">{flow.name}</CardTitle>
                  <CardDescription>{flow.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Steps: {flow.stepCount}</p>
                  <p className="text-sm text-muted-foreground">Last updated: {flow.lastUpdated}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/flow/${flow.id}`} passHref legacyBehavior>
                    <Button className="w-full" variant="default">View Flow</Button>
                  </Link>
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
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Flow
            </Button>
          </div>
        )}
      </div>
       <div className="mt-16 p-8 bg-card rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-center font-headline">Unlock Your Potential with FlowForge</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Image src="https://placehold.co/600x400.png" alt="Organize tasks" width={600} height={400} className="rounded-md mb-2 mx-auto" data-ai-hint="organization productivity" />
            <h4 className="font-semibold text-lg mb-1 font-headline">Organize Visually</h4>
            <p className="text-sm text-muted-foreground">Break down complex projects into manageable steps on a visual flowboard.</p>
          </div>
          <div>
            <Image src="https://placehold.co/600x400.png" alt="AI powered planning" width={600} height={400} className="rounded-md mb-2 mx-auto" data-ai-hint="artificial intelligence planning" />
            <h4 className="font-semibold text-lg mb-1 font-headline">AI-Powered Planning</h4>
            <p className="text-sm text-muted-foreground">Let our AI generate custom workflows tailored to your goals and resources.</p>
          </div>
          <div>
            <Image src="https://placehold.co/600x400.png" alt="Achieve goals" width={600} height={400} className="rounded-md mb-2 mx-auto" data-ai-hint="goals achievement" />
            <h4 className="font-semibold text-lg mb-1 font-headline">Achieve More</h4>
            <p className="text-sm text-muted-foreground">Stay on track with deadlines, progress tracking, and smart suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

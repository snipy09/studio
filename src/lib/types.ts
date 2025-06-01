
import type { User as FirebaseUser } from "firebase/auth";

export interface UserProfile extends FirebaseUser {
  // Add any custom profile properties here if needed
  // e.g. displayName, photoURL are already part of FirebaseUser
}

export type StepStatus = "todo" | "inprogress" | "done";
export type Priority = "Low" | "Medium" | "High";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Step {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  deadline?: string; // ISO date string
  estimatedTime?: string; // e.g., "2 hours", "3 days"
  priority?: Priority;
  difficulty?: Difficulty;
  notes?: string;
  // attachments?: Attachment[]; // Future feature
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SuggestedResourceItem {
  title: string;
  url: string;
}

export interface SuggestedWebsiteItem {
  name: string;
  url: string;
}

export interface FlowSuggestedResources {
  youtubeVideos?: SuggestedResourceItem[];
  articles?: SuggestedResourceItem[];
  websites?: SuggestedWebsiteItem[];
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  userId: string;
  steps: Step[];
  stepsOrder: string[]; // Array of step IDs in order
  isTemplate?: boolean;
  templateCategory?: string; // e.g., "Marketing", "Personal"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  suggestedResources?: FlowSuggestedResources;
}

// export interface Attachment { // Future feature
//   id: string;
//   name: string;
//   url: string;
//   type: 'link' | 'file'; // Could be Google Drive, Dropbox, local upload
//   provider?: string; // e.g., 'google_drive', 'dropbox'
// }

export interface Template extends Omit<Flow, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'suggestedResources'> {
  id: string; // Template ID might be different from runtime Flow ID
  category: string;
}

// Types for GenerateDetailedDiscoveryPlanFlow
export interface GenerateDetailedDiscoveryPlanInput {
  energizingActivities: string;
  solveProblem: string;
  skillsToLearn: string;
  currentChallenge: string;
}

export interface ProjectBreakdown {
  name: string;
  detailedRationale: string;
  keySteps: string[];
  potentialChallenges?: string[];
  expectedOutcome: string;
  suggestedResources?: FlowSuggestedResources;
}

export interface GenerateDetailedDiscoveryPlanOutput {
  suggestedGoals: string[];
  projectBreakdowns: ProjectBreakdown[];
}

export interface Task {
  id: string;
  name: string;
  isCompleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  flowId?: string;
  flowName?: string; // For display purposes
  stepId?: string;
  stepName?: string; // For display purposes
  dueDate?: string; // ISO date string
  notes?: string;
}

// Types for GetUnstuckFlow
export interface GetUnstuckInput {
  problemDescription: string;
}

export interface GetUnstuckOutput {
  clarifiedProblem?: string;
  suggestedRoadmap: string[];
  keySolutionInsights: string[];
  suggestedResources?: FlowSuggestedResources;
}


// (The old GenerateGoalsInput and GenerateGoalsOutput can be removed or kept if used elsewhere,
// but the new flow will use GenerateDetailedDiscoveryPlanInput/Output)
export type { GenerateGoalsInput, GenerateGoalsOutput } from "@/ai/flows/generate-goals-flow";


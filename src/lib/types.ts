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
}

// export interface Attachment { // Future feature
//   id: string;
//   name: string;
//   url: string;
//   type: 'link' | 'file'; // Could be Google Drive, Dropbox, local upload
//   provider?: string; // e.g., 'google_drive', 'dropbox'
// }

export interface Template extends Omit<Flow, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  id: string; // Template ID might be different from runtime Flow ID
  category: string;
}


import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-steps.ts';
import '@/ai/flows/generate-flow-from-description.ts';
import '@/ai/flows/generate-goals-flow.ts';
import '@/ai/flows/summarize-flow-details.ts';
import '@/ai/flows/suggest-flow-resources.ts';
import '@/ai/flows/generate-detailed-discovery-plan-flow.ts';
import '@/ai/flows/get-unstuck-flow.ts';

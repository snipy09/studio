'use server';

/**
 * @fileOverview Provides AI-driven suggestions for the next best step in a workflow.
 *
 * - suggestNextStep - A function that suggests the next step in a workflow.
 * - SuggestNextStepInput - The input type for the suggestNextStep function.
 * - SuggestNextStepOutput - The return type for the suggestNextStep function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextStepInputSchema = z.object({
  currentWorkflowState: z
    .string()
    .describe('The current state of the workflow. Describe the current step, progress, and any obstacles.'),
  userGoals: z
    .string()
    .describe('The user goals for the workflow, including desired outcomes and priorities.'),
});
export type SuggestNextStepInput = z.infer<typeof SuggestNextStepInputSchema>;

const SuggestNextStepOutputSchema = z.object({
  suggestedNextStep: z
    .string()
    .describe('The AI-suggested next step in the workflow, with a clear explanation of why this step is recommended.'),
  estimatedTime: z
    .string()
    .describe('An estimate of the time required to complete the suggested next step.'),
  priority: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The priority of the suggested next step relative to the overall goals.'),
  difficulty: z
    .enum(['Easy', 'Medium', 'Hard'])
    .describe('The difficulty of the suggested next step.'),
});
export type SuggestNextStepOutput = z.infer<typeof SuggestNextStepOutputSchema>;

export async function suggestNextStep(input: SuggestNextStepInput): Promise<SuggestNextStepOutput> {
  return suggestNextStepFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextStepPrompt',
  input: {schema: SuggestNextStepInputSchema},
  output: {schema: SuggestNextStepOutputSchema},
  prompt: `You are an AI assistant designed to help users determine the next best step in their workflow.

  Based on the user's current workflow state and their stated goals, suggest the next step that will help them overcome obstacles and maintain productivity.
  Provide a clear explanation of why you are recommending this step, and estimate the time required, priority, and difficulty of the step.

  Current Workflow State: {{{currentWorkflowState}}}
  User Goals: {{{userGoals}}}
  `,
});

const suggestNextStepFlow = ai.defineFlow(
  {
    name: 'suggestNextStepFlow',
    inputSchema: SuggestNextStepInputSchema,
    outputSchema: SuggestNextStepOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

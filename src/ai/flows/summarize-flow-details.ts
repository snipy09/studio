
'use server';
/**
 * @fileOverview AI flow to summarize a workflow and provide estimated details.
 *
 * - summarizeFlowDetails - A function that takes a flow's name and steps,
 *   and returns a generated description, estimated time, and insights.
 * - SummarizeFlowDetailsInput - Input type for the function.
 * - SummarizeFlowDetailsOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFlowDetailsInputSchema = z.object({
  flowName: z.string().describe("The name of the workflow."),
  stepNames: z.array(z.string()).describe("An array of names for the steps in the workflow."),
});
export type SummarizeFlowDetailsInput = z.infer<typeof SummarizeFlowDetailsInputSchema>;

const SummarizeFlowDetailsOutputSchema = z.object({
  generatedDescription: z.string().describe("A concise, engaging summary of what the workflow is about, suitable for a flow description field. Should be 1-2 sentences."),
  estimatedTotalTime: z.string().describe("A human-readable estimation of the total time this workflow might take to complete (e.g., 'Around 3-5 hours', 'Approximately 2 days', 'About 1 week')."),
  insights: z.array(z.string()).optional().describe("A few bullet-point insights or key observations about the nature of the workflow based on its steps (e.g., 'Focuses heavily on research', 'Involves multiple review stages', 'Seems suitable for a small team'). Max 3 insights."),
});
export type SummarizeFlowDetailsOutput = z.infer<typeof SummarizeFlowDetailsOutputSchema>;

export async function summarizeFlowDetails(input: SummarizeFlowDetailsInput): Promise<SummarizeFlowDetailsOutput> {
  return summarizeFlowDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFlowDetailsPrompt',
  input: {schema: SummarizeFlowDetailsInputSchema},
  output: {schema: SummarizeFlowDetailsOutputSchema},
  prompt: `You are an expert project management assistant.
A user has created a workflow with the following name and steps.
Workflow Name: {{{flowName}}}
Steps:
{{#each stepNames}}
- {{{this}}}
{{/each}}

Your task is to:
1.  Generate a concise and engaging 'generatedDescription' for this workflow (1-2 sentences max). This description will be used as the main description for the flow.
2.  Provide an 'estimatedTotalTime' it might take to complete the entire workflow. Base this on the number and nature of the steps. Be general (e.g., "a few hours", "1-2 days", "about a week").
3.  Optionally, list 1-3 'insights' or key observations about the workflow. What is its main focus? What kind of work does it involve?

Example Output:
{
  "generatedDescription": "This workflow outlines the key stages for developing a new mobile app, from initial concept to launch.",
  "estimatedTotalTime": "Approximately 2-3 months",
  "insights": [
    "Involves both design and development phases.",
    "Includes critical testing and feedback loops.",
    "Suitable for a structured project team."
  ]
}

Analyze the provided workflow name and steps, and generate the output in the specified JSON format.
If there are very few steps (e.g., 1-2 generic steps like "Start" and "Finish"), the estimated time should be short and insights might be minimal or omitted.
Focus on being helpful and providing a realistic overview.
`,
});

const summarizeFlowDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeFlowDetailsFlow',
    inputSchema: SummarizeFlowDetailsInputSchema,
    outputSchema: SummarizeFlowDetailsOutputSchema,
  },
  async (input) => {
    if (input.stepNames.length === 0) {
      return {
        generatedDescription: "A new workflow. Add steps to see more details.",
        estimatedTotalTime: "Not enough information to estimate.",
        insights: ["Add some steps to this flow for more detailed insights."]
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);

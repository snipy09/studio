// The AI flow will take in a description of a desired workflow and generate a flow for the user.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowFromDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the desired workflow.'),
  availableTime: z.string().optional().describe('The available time for the workflow.'),
  priorityLevel: z.string().optional().describe('The priority level of the workflow.'),
  resources: z.string().optional().describe('The available resources for the workflow.'),
});

export type GenerateFlowFromDescriptionInput = z.infer<typeof GenerateFlowFromDescriptionInputSchema>;

const GenerateFlowFromDescriptionOutputSchema = z.object({
  flow: z.array(z.string()).describe('The generated flow steps.'),
});

export type GenerateFlowFromDescriptionOutput = z.infer<typeof GenerateFlowFromDescriptionOutputSchema>;

export async function generateFlowFromDescription(input: GenerateFlowFromDescriptionInput): Promise<GenerateFlowFromDescriptionOutput> {
  return generateFlowFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlowFromDescriptionPrompt',
  input: {schema: GenerateFlowFromDescriptionInputSchema},
  output: {schema: GenerateFlowFromDescriptionOutputSchema},
  prompt: `You are an AI assistant that helps users generate workflows based on their descriptions.

  Generate a flow with steps based on the following description:
  Description: {{{description}}}
  Available Time: {{{availableTime}}}
  Priority Level: {{{priorityLevel}}}
  Resources: {{{resources}}}

  The flow should be an array of strings.
  Example: [\'Ideate\', \'Wireframe\', \'Prototype\', \'Test\', \'Finalize\']`,
});

const generateFlowFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFlowFromDescriptionFlow',
    inputSchema: GenerateFlowFromDescriptionInputSchema,
    outputSchema: GenerateFlowFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

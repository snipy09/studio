
'use server';
/**
 * @fileOverview AI flow to suggest relevant resources (YouTube videos, articles, websites) for a given workflow.
 *
 * - suggestFlowResources - A function that takes a flow's name and description and returns suggested resources.
 * - SuggestFlowResourcesInput - The input type for the suggestFlowResources function.
 * - SuggestFlowResourcesOutput - The return type for the suggestFlowResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceItemSchema = z.object({
  title: z.string().describe("The title of the YouTube video or article."),
  url: z.string().describe("The fully qualified URL to the resource. This should be a valid web address starting with http:// or https://."),
});

const WebsiteItemSchema = z.object({
  name: z.string().describe("The name of the website."),
  url: z.string().describe("The fully qualified URL to the website. This should be a valid web address starting with http:// or https://."),
});

const SuggestFlowResourcesInputSchema = z.object({
  flowName: z.string().describe("The name of the workflow."),
  flowDescription: z.string().optional().describe("The description of the workflow."),
});
export type SuggestFlowResourcesInput = z.infer<typeof SuggestFlowResourcesInputSchema>;

const SuggestFlowResourcesOutputSchema = z.object({
  youtubeVideos: z.array(ResourceItemSchema).optional().describe("An array of 1-2 highly relevant YouTube videos related to the workflow."),
  articles: z.array(ResourceItemSchema).optional().describe("An array of 1-2 highly relevant articles or blog posts related to the workflow."),
  websites: z.array(WebsiteItemSchema).optional().describe("An array of 1-2 highly relevant websites (tools, communities, official documentation) related to the workflow."),
});
export type SuggestFlowResourcesOutput = z.infer<typeof SuggestFlowResourcesOutputSchema>;

export async function suggestFlowResources(input: SuggestFlowResourcesInput): Promise<SuggestFlowResourcesOutput> {
  return suggestFlowResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFlowResourcesPrompt',
  input: {schema: SuggestFlowResourcesInputSchema},
  output: {schema: SuggestFlowResourcesOutputSchema},
  prompt: `You are a helpful research assistant. A user has created a workflow and needs some resources to learn more or find tools related to it.

Workflow Name: {{{flowName}}}
Workflow Description: {{{flowDescription}}}

Based on the workflow name and description, please suggest:
- 1-2 highly relevant YouTube videos. For each, provide a 'title' and a 'url'.
- 1-2 highly relevant articles or blog posts. For each, provide a 'title' and a 'url'.
- 1-2 highly relevant websites (these could be tools, official documentation, communities, etc.). For each, provide a 'name' and a 'url'.

CRITICAL INSTRUCTION: All URLs provided MUST be real, working, and publicly accessible web addresses (starting with http:// or https://). Do NOT invent, guess, or fabricate URLs. If you cannot find a genuinely relevant and working URL for a specific resource type, it is MUCH better to return an empty array for that category or omit it (if the schema allows) than to provide a fake or non-functional URL. Prioritize quality and accuracy of links above all.
`,
});

const suggestFlowResourcesFlow = ai.defineFlow(
  {
    name: 'suggestFlowResourcesFlow',
    inputSchema: SuggestFlowResourcesInputSchema,
    outputSchema: SuggestFlowResourcesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return { youtubeVideos: [], articles: [], websites: [] };
    }
    return output;
  }
);


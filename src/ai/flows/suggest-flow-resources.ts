
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
  url: z.string().url().describe("The fully qualified URL to the resource."),
});

const WebsiteItemSchema = z.object({
  name: z.string().describe("The name of the website."),
  url: z.string().url().describe("The fully qualified URL to the website."),
});

const SuggestFlowResourcesInputSchema = z.object({
  flowName: z.string().describe("The name of the workflow."),
  flowDescription: z.string().optional().describe("The description of the workflow."),
});
export type SuggestFlowResourcesInput = z.infer<typeof SuggestFlowResourcesInputSchema>;

const SuggestFlowResourcesOutputSchema = z.object({
  youtubeVideos: z.array(ResourceItemSchema).optional().describe("An array of 2-3 suggested YouTube videos relevant to the workflow."),
  articles: z.array(ResourceItemSchema).optional().describe("An array of 2-3 suggested articles or blog posts relevant to the workflow."),
  websites: z.array(WebsiteItemSchema).optional().describe("An array of 2-3 suggested websites (tools, communities, official documentation) relevant to the workflow."),
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
- Up to 3 relevant YouTube videos. For each, provide a 'title' and a 'url'.
- Up to 3 relevant articles or blog posts. For each, provide a 'title' and a 'url'.
- Up to 3 relevant websites (these could be tools, official documentation, communities, etc.). For each, provide a 'name' and a 'url'.

Try to find actual, valid, and publicly accessible URLs.
If you cannot find relevant resources for a category, you can return an empty array for that category or omit it if the schema allows.
Focus on quality and relevance.
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

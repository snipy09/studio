
'use server';
/**
 * @fileOverview AI flow to help users get unstuck by providing a roadmap, solution ideas, and resources.
 *
 * - getUnstuckAdvice - A function that takes a user's problem description and returns actionable advice.
 * - GetUnstuckInput - The input type for the function.
 * - GetUnstuckOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { FlowSuggestedResources } from '@/lib/types'; // Re-use for resource structure

const GetUnstuckInputSchema = z.object({
  problemDescription: z.string().min(10, {message: "Please describe your problem in at least 10 characters."}).describe("A description of the problem the user is feeling stuck on."),
});
export type GetUnstuckInput = z.infer<typeof GetUnstuckInputSchema>;

// Re-using resource schemas from suggest-flow-resources
const ResourceItemSchema = z.object({
  title: z.string().describe("The title of the YouTube video or article."),
  url: z.string().describe("The fully qualified URL to the resource. This should be a valid web address starting with http:// or https://."),
});

const WebsiteItemSchema = z.object({
  name: z.string().describe("The name of the website or tool."),
  url: z.string().describe("The fully qualified URL to the website. This should be a valid web address starting with http:// or https://."),
});

const SuggestedResourcesSchema = z.object({
  youtubeVideos: z.array(ResourceItemSchema).optional().describe("An array of 1-2 suggested YouTube videos relevant to the problem."),
  articles: z.array(ResourceItemSchema).optional().describe("An array of 1-2 suggested articles or blog posts relevant to the problem."),
  websites: z.array(WebsiteItemSchema).optional().describe("An array of 1-2 suggested websites (tools, communities, official documentation) relevant to the problem."),
});

const GetUnstuckOutputSchema = z.object({
  clarifiedProblem: z.string().optional().describe("A brief AI-rephrased understanding of the user's core problem, if clarification helps."),
  suggestedRoadmap: z.array(z.string()).min(3).max(5).describe("An array of 3-5 concrete, actionable steps to help the user move forward."),
  keySolutionInsights: z.array(z.string()).min(2).max(3).describe("An array of 2-3 key insights or different angles/approaches to consider for solving the problem."),
  suggestedResources: SuggestedResourcesSchema.optional().describe("A small collection of relevant learning resources or tools. Prioritize quality and direct relevance."),
});
export type GetUnstuckOutput = z.infer<typeof GetUnstuckOutputSchema>;

export async function getUnstuckAdvice(input: GetUnstuckInput): Promise<GetUnstuckOutput> {
  return getUnstuckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getUnstuckPrompt',
  input: {schema: GetUnstuckInputSchema},
  output: {schema: GetUnstuckOutputSchema},
  prompt: `You are a highly experienced mentor and problem-solver AI. A user is feeling stuck and needs your help to find a path forward.
User's problem: "{{{problemDescription}}}"

Your goal is to provide clear, concise, and actionable advice. Please adhere strictly to the 'GetUnstuckOutputSchema'.

1.  'clarifiedProblem' (Optional): If the user's description is a bit vague, briefly rephrase or clarify the core problem you're addressing. If it's clear, you can omit this.
2.  'suggestedRoadmap': Provide an array of 3-5 concrete, actionable steps the user can take to start addressing their problem. These should be "first steps" or a mini-plan.
    Example: If stuck on "learning a new skill", steps might be: "1. Define a small, achievable project using the skill.", "2. Find a beginner-friendly tutorial.", "3. Dedicate 30 minutes daily to practice."
3.  'keySolutionInsights': Offer an array of 2-3 key insights, alternative perspectives, or core principles that could help the user think about their problem differently or find a solution.
    Example: "Consider breaking the problem into smaller, more manageable parts.", "Reframe failure as a learning opportunity."
4.  'suggestedResources' (Optional but highly recommended):
    *   Provide 1-2 relevant YouTube video titles and URLs.
    *   Provide 1-2 relevant article/blog post titles and URLs.
    *   Provide 1-2 relevant website/tool names and URLs.
    *   CRITICAL URL VALIDITY: All URLs MUST be real, publicly accessible, working web addresses starting with http:// or https://. Do NOT invent URLs. If you cannot find a genuinely relevant and working URL, omit that specific resource or return an empty list for that resource type.

Be empathetic but direct and practical. Help the user feel empowered to take the next step.
If the problem is extremely vague or outside reasonable scope (e.g., "I'm stuck on the meaning of life"), gently guide them to rephrase or focus on a more concrete aspect they can work on, perhaps by making the roadmap steps about "clarifying the specific challenge."
`,
});

const getUnstuckFlow = ai.defineFlow(
  {
    name: 'getUnstuckFlow',
    inputSchema: GetUnstuckInputSchema,
    outputSchema: GetUnstuckOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case AI returns nothing or malformed output
      return {
        suggestedRoadmap: ["Try to break down your problem into smaller pieces.", "Write down what you've tried so far.", "Consider discussing the problem with a friend or colleague."],
        keySolutionInsights: ["Sometimes a short break can help you see the problem from a new perspective.", "Focus on making just one small step of progress."],
        suggestedResources: {
            articles: [{title: "Problem-Solving Skills: Definitions and Examples", url: "https://www.indeed.com/career-advice/resumes-cover-letters/problem-solving-skills"}]
        }
      };
    }
    return output;
  }
);


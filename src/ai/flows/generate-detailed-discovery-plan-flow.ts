
'use server';
/**
 * @fileOverview AI flow to generate a detailed discovery plan including goals,
 * comprehensive project breakdowns, and relevant resources based on user's reflections.
 *
 * - generateDetailedDiscoveryPlan - A function that takes user's answers to reflective questions
 *   and returns suggested goals and detailed project ideas with resources.
 * - GenerateDetailedDiscoveryPlanInput - The input type for the function.
 * - GenerateDetailedDiscoveryPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z}  from 'genkit';

// Input Schema (same as original GenerateGoalsInput)
const GenerateDetailedDiscoveryPlanInputSchema = z.object({
  energizingActivities: z.string().describe("User's answer to: What activities make you feel most energized and engaged?"),
  solveProblem: z.string().describe("User's answer to: If you had unlimited time and resources, what problem would you try to solve?"),
  skillsToLearn: z.string().describe("User's answer to: What skills do you want to learn or improve in the next year?"),
  currentChallenge: z.string().describe("User's answer to: What are you currently dissatisfied with, or what challenge are you facing that you'd like to overcome?"),
});
export type GenerateDetailedDiscoveryPlanInput = z.infer<typeof GenerateDetailedDiscoveryPlanInputSchema>;

// Schemas for suggested resources (can be reused or adapted from flow-resources)
const ResourceItemSchema = z.object({
  title: z.string().describe("The title of the YouTube video or article."),
  url: z.string().describe("The fully qualified URL to the resource. This should be a valid web address starting with http:// or https://."),
});

const WebsiteItemSchema = z.object({
  name: z.string().describe("The name of the website or tool."),
  url: z.string().describe("The fully qualified URL to the website. This should be a valid web address starting with http:// or https://."),
});

const SuggestedResourcesSchema = z.object({
  youtubeVideos: z.array(ResourceItemSchema).optional().describe("An array of 1-2 suggested YouTube videos relevant to the project."),
  articles: z.array(ResourceItemSchema).optional().describe("An array of 1-2 suggested articles or blog posts relevant to the project."),
  websites: z.array(WebsiteItemSchema).optional().describe("An array of 1-2 suggested websites (tools, communities, official documentation) relevant to the project."),
});

// Schema for a single detailed project breakdown
const ProjectBreakdownSchema = z.object({
  name: z.string().describe("The name or title of the suggested project idea (e.g., 'Learn Basic Python for Data Analysis', 'Start a Community Garden Initiative')."),
  detailedRationale: z.string().describe("A paragraph (2-3 sentences) explaining why this project is a good fit based on the user's input and what they might gain from undertaking it."),
  keySteps: z.array(z.string()).min(3).max(5).describe("An array of 3-5 concrete, actionable key steps to help the user get started and make progress on this project."),
  potentialChallenges: z.array(z.string()).optional().describe("An array of 1-2 potential challenges the user might encounter while pursuing this project, with brief, constructive tips for overcoming them."),
  expectedOutcome: z.string().describe("A concise sentence describing the expected positive outcome or benefit of completing this project (e.g., 'Gain a new valuable skill', 'Make a tangible impact on your community')."),
  suggestedResources: SuggestedResourcesSchema.optional().describe("A small collection of relevant learning resources or tools for this specific project idea. Aim for quality over quantity."),
});

// Output Schema for the entire detailed discovery plan
const GenerateDetailedDiscoveryPlanOutputSchema = z.object({
  suggestedGoals: z.array(z.string()).min(2).max(3).describe("An array of 2-3 broader, overarching personal or professional goals inspired by the user's reflections. These should be aspirational statements."),
  projectBreakdowns: z.array(ProjectBreakdownSchema).min(1).max(2).describe("An array of 1-2 detailed project breakdowns. Each project should be concrete and actionable, aligning with the user's input and potential goals."),
});
export type GenerateDetailedDiscoveryPlanOutput = z.infer<typeof GenerateDetailedDiscoveryPlanOutputSchema>;


export async function generateDetailedDiscoveryPlan(input: GenerateDetailedDiscoveryPlanInput): Promise<GenerateDetailedDiscoveryPlanOutput> {
  return generateDetailedDiscoveryPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedDiscoveryPlanPrompt',
  input: {schema: GenerateDetailedDiscoveryPlanInputSchema},
  output: {schema: GenerateDetailedDiscoveryPlanOutputSchema},
  prompt: `You are an insightful and highly motivating AI life coach and project strategist. Your primary goal is to help users translate their reflections into actionable goals and detailed project plans, complete with helpful resources.

Analyze the user's responses very carefully:
- Energizing Activities: {{{energizingActivities}}}
- Problem they'd solve (unlimited resources): {{{solveProblem}}}
- Skills they want to learn/improve: {{{skillsToLearn}}}
- Current dissatisfaction or challenge: {{{currentChallenge}}}

Based on this input, please provide a comprehensive discovery plan adhering strictly to the 'GenerateDetailedDiscoveryPlanOutputSchema'. Specifically:

1.  'suggestedGoals':
    *   Generate an array of 2-3 inspiring, overarching goals. These goals should be broad aspirations derived from the user's reflections.
    *   Example goal: "Cultivate a fulfilling creative hobby that allows for self-expression."

2.  'projectBreakdowns':
    *   Generate an array of 1-2 concrete, actionable project ideas. These projects should be tangible starting points that align with the user's input or the suggested goals.
    *   For each project, provide:
        *   'name': A clear and engaging project name.
        *   'detailedRationale': A 2-3 sentence paragraph explaining why this project is a good fit, connecting it to the user's specific answers (e.g., "Given your interest in 'solving complex puzzles' and desire to 'learn Python', this project will allow you to...").
        *   'keySteps': An array of 3-5 actionable key steps. These should be clear, manageable first steps.
            *   Example key step: "Dedicate 1 hour on weekends to an introductory Python tutorial focused on data manipulation."
        *   'potentialChallenges' (optional but highly recommended): An array of 1-2 potential challenges (e.g., "Maintaining motivation," "Finding time") with brief, constructive tips (e.g., "Break tasks into smaller chunks," "Schedule dedicated learning blocks").
        *   'expectedOutcome': A concise sentence describing the positive outcome (e.g., "You'll have a foundational understanding of Python and a completed small data project.").
        *   'suggestedResources' (optional but highly recommended):
            *   Provide 1-2 relevant YouTube video titles and valid URLs.
            *   Provide 1-2 relevant article/blog post titles and valid URLs.
            *   Provide 1-2 relevant website/tool names and valid URLs (e.g., a link to an online course platform, a specific library documentation).
            *   Ensure all URLs are real, publicly accessible, and start with http:// or https://. Prioritize quality and direct relevance to the project.

General Guidelines:
*   Be positive, encouraging, and constructive.
*   Ensure all generated content is practical and actionable.
*   If the user's input is very vague, try to provide broader suggestions or gently guide them towards clarifying their thoughts within the project rationale.
*   Strictly adhere to the output schema. Ensure all required fields are present and arrays have the specified min/max number of items where applicable.
*   Double-check that all URLs provided for resources are complete and valid.
`,
});

const generateDetailedDiscoveryPlanFlow = ai.defineFlow(
  {
    name: 'generateDetailedDiscoveryPlanFlow',
    inputSchema: GenerateDetailedDiscoveryPlanInputSchema,
    outputSchema: GenerateDetailedDiscoveryPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case AI returns nothing or malformed output
      return {
        suggestedGoals: ["Consider exploring your interests further to define clear goals."],
        projectBreakdowns: [{
            name: "Reflect and Research",
            detailedRationale: "Sometimes the first step is to dive deeper into what truly excites you. This project helps you do that.",
            keySteps: ["Spend 30 minutes brainstorming topics you're curious about.", "Read one article or watch one video on each of your top 3 topics.", "Journal your thoughts on which topic felt most engaging and why."],
            expectedOutcome: "A clearer idea of a specific area you'd like to explore further."
        }]
      };
    }
    return output;
  }
);

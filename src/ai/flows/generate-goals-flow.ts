
'use server';
/**
 * @fileOverview AI flow to generate goals and project suggestions based on user's reflections.
 *
 * - generateGoalsFromReflection - A function that takes user's answers to reflective questions and returns suggested goals and project ideas.
 * - GenerateGoalsInput - The input type for the generateGoalsFromReflection function.
 * - GenerateGoalsOutput - The return type for the generateGoalsFromReflection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalsInputSchema = z.object({
  energizingActivities: z.string().describe("User's answer to: What activities make you feel most energized and engaged?"),
  solveProblem: z.string().describe("User's answer to: If you had unlimited time and resources, what problem would you try to solve?"),
  skillsToLearn: z.string().describe("User's answer to: What skills do you want to learn or improve in the next year?"),
  currentChallenge: z.string().describe("User's answer to: What are you currently dissatisfied with, or what challenge are you facing that you'd like to overcome?"),
});
export type GenerateGoalsInput = z.infer<typeof GenerateGoalsInputSchema>;

const ProjectSuggestionSchema = z.object({
  name: z.string().describe("The name or title of the suggested project."),
  firstSteps: z.array(z.string()).describe("An array of 2-3 actionable first steps for this project."),
});

const GenerateGoalsOutputSchema = z.object({
  suggestedGoals: z.array(z.string()).describe("An array of 2-3 potential long-term or overarching goals the user might pursue, phrased as aspirations."),
  projectSuggestions: z.array(ProjectSuggestionSchema).describe("An array of 1-2 concrete project ideas to help the user get started, including a few initial steps for each project."),
});
export type GenerateGoalsOutput = z.infer<typeof GenerateGoalsOutputSchema>;

export async function generateGoalsFromReflection(input: GenerateGoalsInput): Promise<GenerateGoalsOutput> {
  return generateGoalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalsPrompt',
  input: {schema: GenerateGoalsInputSchema},
  output: {schema: GenerateGoalsOutputSchema},
  prompt: `You are a helpful and insightful AI life coach. Your goal is to help users discover potential goals and actionable project ideas based on their answers to reflective questions.

Analyze the user's responses carefully:
- Energizing Activities: {{{energizingActivities}}}
- Problem they'd solve (unlimited resources): {{{solveProblem}}}
- Skills they want to learn/improve: {{{skillsToLearn}}}
- Current dissatisfaction or challenge: {{{currentChallenge}}}

Based on this input, please provide:
1.  'suggestedGoals': An array of 2-3 potential overarching goals or aspirations. These should be inspiring and broad.
    Example: "Explore your creative potential through writing", "Develop a new professional skill to advance your career", "Contribute to a cause you care about".
2.  'projectSuggestions': An array of 1-2 concrete and actionable project ideas. Each project should have a 'name' and an array of 2-3 'firstSteps'. These projects should be smaller, tangible starting points related to the user's input or potential goals.
    Example for a project:
    {
      name: "Start a Personal Blog about [Topic from User's Interests]",
      firstSteps: ["Define your blog's niche and target audience.", "Choose a blogging platform (e.g., Medium, WordPress, Substack).", "Outline and write your first three blog posts."]
    }
    Or for a skill:
    {
        name: "Begin Learning [Skill User Mentioned]",
        firstSteps: ["Research beginner-friendly online courses or tutorials for [Skill].", "Dedicate 30 minutes daily to a learning session.", "Complete a small introductory project or exercise."]
    }

Focus on providing positive, constructive, and actionable suggestions. If the input is too vague to generate specific ideas, provide more general encouragement or suggest clarifying their thoughts.
Ensure the output strictly adheres to the 'GenerateGoalsOutputSchema'.
`,
});

const generateGoalsFlow = ai.defineFlow(
  {
    name: 'generateGoalsFlow',
    inputSchema: GenerateGoalsInputSchema,
    outputSchema: GenerateGoalsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        // Fallback in case AI returns nothing or malformed output, though schema validation should catch some.
        return { suggestedGoals: ["Consider exploring your interests further."], projectSuggestions: [] };
    }
    return output;
  }
);

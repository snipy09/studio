
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
      // You can also specify safetySettings here if needed, for example:
      // safetySettings: [
      //   {
      //     category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      //     threshold: 'BLOCK_ONLY_HIGH',
      //   },
      // ],
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Ensure this model is compatible with your API key and enabled services
});

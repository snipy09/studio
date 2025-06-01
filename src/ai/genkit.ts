
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// IMPORTANT PERMISSIONS NOTE FOR GENKIT AND GCS (Google Cloud Storage):
// If your Genkit flows or models (especially those involving `{{media url=...}}` in prompts)
// need to access objects in Google Cloud Storage (e.g., using `gs://bucket/object` URIs):
// The service account under which Genkit/Firebase services operate (e.g., your App Hosting
// service account, or the default compute service account if running Genkit elsewhere)
// MUST have the necessary IAM permissions on the GCS bucket/objects.
// - For reading: `storage.objects.get` (typically part of roles like "Storage Object Viewer").
// - For writing: `storage.objects.create` (typically part of roles like "Storage Object Creator").
// An "AccessDenied" error often indicates these permissions are missing for the
// service account identity (e.g., `your-project-id@appspot.gserviceaccount.com` or
// `your-genkit-service-account@your-project-id.iam.gserviceaccount.com`).
// You can manage these permissions in the IAM section of the Google Cloud Console.

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

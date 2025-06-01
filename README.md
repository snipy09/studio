# FlowForge - Your AI-Powered Workflow Planner

FlowForge is a Next.js application designed to help you visually plan workflows, manage tasks, and leverage AI to achieve your goals. It features a drag-and-drop interface, pre-built templates, an AI flow generator, and more, all built with Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for AI functionalities.

## Core Features

-   **Work Flow Planner**: Create step-by-step flows for any task or project using a drag-and-drop interface.
-   **Pre-built Templates**: Ready-made flow templates for common tasks.
-   **AI Flow Generator**: AI-powered generator that uses text input to create custom flows.
-   **Time & Deadline Manager**: Set deadlines and manage time within your flows.
-   **Visual Flowboard**: An intuitive visual interface to manage your flow steps.
-   **AI-Powered "Discover" Feature**: Get personalized project ideas and goals based on your reflections.
-   **AI "Feeling Stuck?" Assistant**: Receive actionable roadmaps and resources when facing challenges.
-   **Task Management**: Create tasks from flow steps and manage them on your dashboard.
-   **Pomodoro Timer**: Integrated Pomodoro timer for focused work sessions.

## Tech Stack

-   **Frontend**: Next.js (App Router), React, TypeScript
-   **UI**: ShadCN UI Components, Tailwind CSS
-   **AI**: Genkit (with Google AI - Gemini)
-   **Styling**: Tailwind CSS, CSS Variables
-   **State Management**: React Context, LocalStorage for persistence
-   **Linting/Formatting**: ESLint (Next.js default), Prettier (implicitly via editor settings usually)

## Getting Started

Follow these instructions to set up and run FlowForge locally.

### Prerequisites

-   Node.js (version 18.x or later recommended)
-   npm or yarn

### Setup and Configuration

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/flowforge.git 
    cd flowforge
    ```
    (Replace `https://github.com/your-username/flowforge.git` with the actual repository URL if it's hosted)

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**:
    FlowForge requires API keys for Firebase and Google AI services.
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open the newly created `.env` file in your text editor.
    -   **Obtain API Keys**:
        -   **Google AI API Key (for Genkit/Gemini)**:
            -   Go to [Google AI Studio](https://aistudio.google.com/app/apikey) or your Google Cloud Console.
            -   Create an API key.
            -   Paste this key into the `GOOGLE_API_KEY` field in your `.env` file.
        -   **Firebase Project Configuration**:
            -   Go to the [Firebase Console](https://console.firebase.google.com/).
            -   Create a new Firebase project (or use an existing one).
            -   In your project settings, find your web app's Firebase configuration details.
            -   Fill in the following variables in your `.env` file with your Firebase project's credentials:
                -   `NEXT_PUBLIC_FIREBASE_API_KEY`
                -   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
                -   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
                -   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
                -   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
                -   `NEXT_PUBLIC_FIREBASE_APP_ID`
                -   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (This one is optional, for Google Analytics)
    -   Save the `.env` file.

    **Important**: The `.env` file contains sensitive credentials and should *not* be committed to version control. It is typically included in the `.gitignore` file.

### Running the Application

1.  **Run the development server**:
    The main application uses Next.js.
    ```bash
    npm run dev
    ```
    This will start the Next.js development server, usually on `http://localhost:9002`.

2.  **Run the Genkit development server (Optional, for AI flow inspection)**:
    If you want to inspect or test Genkit flows directly using the Genkit Developer UI, you can run its development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    This will typically start the Genkit server on `http://localhost:4000`. The main app interacts with Genkit flows as server-side functions, so this step is not strictly required for the app to *use* the AI features but is helpful for Genkit development and debugging.

### Building for Production

To create a production build:
```bash
npm run build
```

To start the production server after building:
```bash
npm run start
```

## Project Structure Highlights

-   `src/app/`: Main application routes (using Next.js App Router).
    -   `src/app/(app)/`: Authenticated routes (dashboard, flow details, etc.).
    -   `src/app/(auth)/`: Authentication routes (login).
-   `src/components/`: Reusable UI components.
    -   `src/components/ui/`: ShadCN UI components.
    -   `src/components/layout/`: Navbar, Theme toggle, etc.
    -   `src/components/flow/`: Components related to flow creation and management.
-   `src/ai/`: Genkit AI integration.
    -   `src/ai/flows/`: Definitions of different AI flows (e.g., generating flow steps, summarizing details).
    -   `src/ai/genkit.ts`: Genkit initialization and configuration.
-   `src/lib/`: Utility functions, type definitions, and data storage logic.
    -   `src/lib/firebase/`: Firebase configuration.
    -   `src/lib/flow-storage.ts`: LocalStorage persistence for flows.
    -   `src/lib/task-storage.ts`: LocalStorage persistence for tasks.
    -   `src/lib/types.ts`: Core TypeScript type definitions.
-   `src/contexts/`: React context providers (e.g., AuthContext).
-   `src/data/`: Static data like pre-built templates.
-   `public/`: Static assets.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

Please ensure your code adheres to the existing style and linting rules.

## License

This project is open source. (Consider adding a specific license like MIT if desired).
```
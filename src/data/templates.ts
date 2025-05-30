import type { Template, Step } from "@/lib/types";

const generateSteps = (names: string[]): Step[] => {
  const now = new Date().toISOString();
  return names.map((name, index) => ({
    id: `step-${index + 1}-${Date.now()}`, // ensure unique id for template steps
    name,
    status: "todo",
    createdAt: now,
    updatedAt: now,
  }));
};

export const prebuiltTemplates: Template[] = [
  {
    id: "template-app-ui-design",
    name: "App UI Design",
    description: "A standard workflow for designing application user interfaces.",
    category: "Design",
    steps: generateSteps(["Ideate & Research", "Sketching", "Wireframing", "Prototyping", "User Testing", "UI Polishing", "Handoff to Devs"]),
    stepsOrder: [], // Will be populated from steps
    isTemplate: true,
  },
  {
    id: "template-marketing-campaign",
    name: "Marketing Campaign",
    description: "Plan and execute a successful marketing campaign.",
    category: "Marketing",
    steps: generateSteps(["Define Goals & KPIs", "Target Audience Research", "Budget Allocation", "Content Creation", "Channel Selection", "Campaign Launch", "Performance Monitoring", "Reporting & Analysis"]),
    stepsOrder: [],
    isTemplate: true,
  },
  {
    id: "template-content-creation",
    name: "Content Creation",
    description: "A workflow for creating engaging content from idea to publication.",
    category: "Content",
    steps: generateSteps(["Brainstorm Ideas", "Keyword Research", "Outline Creation", "Drafting Content", "Editing & Proofreading", "Design & Formatting", "Publishing", "Promotion"]),
    stepsOrder: [],
    isTemplate: true,
  },
  {
    id: "template-event-planning",
    name: "Event Planning",
    description: "Comprehensive checklist for planning any event.",
    category: "Events",
    steps: generateSteps(["Define Event Goals", "Set Budget", "Choose Date & Venue", "Vendor Management", "Marketing & Promotion", "Attendee Registration", "On-site Coordination", "Post-event Follow-up"]),
    stepsOrder: [],
    isTemplate: true,
  },
  {
    id: "template-software-sprint",
    name: "Software Development Sprint",
    description: "Typical agile sprint workflow for software teams.",
    category: "Development",
    steps: generateSteps(["Sprint Planning", "Daily Standups", "Development Work", "Code Review", "Testing (QA)", "Sprint Review", "Sprint Retrospective"]),
    stepsOrder: [],
    isTemplate: true,
  },
  {
    id: "template-personal-goal",
    name: "Personal Goal Setting",
    description: "A framework to achieve your personal goals.",
    category: "Personal",
    steps: generateSteps(["Define Specific Goal", "Break Down into Milestones", "Identify Resources", "Set Timeline", "Track Progress Weekly", "Review & Adjust", "Celebrate Achievement"]),
    stepsOrder: [],
    isTemplate: true,
  },
];

// Populate stepsOrder for each template
prebuiltTemplates.forEach(template => {
  template.stepsOrder = template.steps.map(step => step.id);
});

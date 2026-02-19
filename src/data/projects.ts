import type { Project } from "@/types/project";
import type { Task, ContextEntry } from "@/types/task";

export const PROJECTS: readonly Project[] = [
  {
    id: "epistemic-auditor",
    name: "Epistemic Auditor",
    icon: "brain",
    color: "#a78bfa",
    description: "AI-powered epistemic engine & idea markets",
    subprojects: [
      { name: "janehive", description: "AI-coordinated idea markets, forecasting, Socratic chat", port: 5173 },
    ],
  },
  {
    id: "website-design-business",
    name: "Website Design Business",
    icon: "briefcase",
    color: "#34d399",
    description: "Automated web design services & lead generation",
    subprojects: [
      { name: "ecsac", description: "ECSAC vibecode project", port: 5174 },
      { name: "gemini", description: "Gemini-powered tools", port: 5175 },
      { name: "ironwatch", description: "Automated lead finder & website auditor", port: 5176 },
    ],
  },
];

export const GSD_QUESTIONS: readonly string[] = [
  "What's the acceptance criteria for this task?",
  "Which files will this touch?",
  "How will you verify it's done?",
  "Are there dependencies on other tasks?",
  "What's the smallest shippable version?",
];

export function getDefaultTasks(): Task[] {
  return [
    { id: "1", title: "Set up Supabase backend for Janehive", status: "done", project: "epistemic-auditor", subproject: "janehive", phase: "Phase 1: Foundation", spec: "Configure Supabase project with auth, database, and edge functions", verify: "Supabase dashboard shows active project with tables", createdAt: Date.now() - 86400000 },
    { id: "2", title: "Build automated website auditor (Lighthouse + Gemini)", status: "todo", project: "website-design-business", subproject: "ironwatch", phase: "Phase 1: Core Engine", spec: "Take a URL, run Lighthouse audit, use Gemini Vision to analyze screenshot, output a score + report", verify: "Pass a URL and receive a JSON report with scores", createdAt: Date.now() },
    { id: "3", title: "Set up Google Places API for lead sourcing", status: "todo", project: "website-design-business", subproject: "ironwatch", phase: "Phase 1: Core Engine", spec: "Query Google Places by location + category, extract business name + website URL", verify: "Query 'dentists in Austin' returns 20+ results with URLs", createdAt: Date.now() },
    { id: "4", title: "Build email template system with personalization", status: "todo", project: "website-design-business", subproject: "ironwatch", phase: "Phase 2: Outreach", spec: "Gemini generates personalized email from audit report, include specific issues found", verify: "Given an audit report, generates a professional email with personalized details", createdAt: Date.now() },
    { id: "5", title: "Connect ECSAC to Gemini API", status: "in_progress", project: "website-design-business", subproject: "ecsac", phase: "Phase 1: Foundation", createdAt: Date.now() },
    { id: "6", title: "Design landing page for web design services", status: "todo", project: "website-design-business", subproject: "gemini", phase: "Phase 2: Marketing", createdAt: Date.now() },
  ];
}

export function getDefaultContext(): ContextEntry[] {
  return [
    { id: "c1", type: "decision", text: "Using Supabase for backend across Janehive \u2014 auth + edge functions + postgres", project: "epistemic-auditor", subproject: "janehive", createdAt: Date.now() - 86400000 },
    { id: "c2", type: "note", text: "Ironwatch pipeline: Find (Google Places) \u2192 Audit (Lighthouse + Gemini) \u2192 Score \u2192 Personalize (Gemini) \u2192 Send (Resend/SendGrid)", project: "website-design-business", subproject: "ironwatch", createdAt: Date.now() },
    { id: "c3", type: "blocker", text: "Need to decide on email sending service \u2014 Resend vs SendGrid vs SES", project: "website-design-business", subproject: "ironwatch", createdAt: Date.now(), resolved: false },
  ];
}

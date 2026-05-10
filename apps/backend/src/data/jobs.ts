import type { JobPosting } from "@skillbridge/shared";

export const jobs: JobPosting[] = [
  {
    id: "frontend-react-1",
    title: "Frontend Developer",
    company: "NovaWorks",
    location: "Remote",
    summary: "Build responsive UI features and collaborate with product and backend teams.",
    requiredSkills: ["react", "typescript", "javascript", "html", "css", "rest api"],
    preferredSkills: ["firebase", "testing", "figma", "state management"],
    tags: ["frontend", "react", "entry-level"]
  },
  {
    id: "frontend-next-1",
    title: "React Developer",
    company: "PixelMint",
    location: "Remote",
    summary: "Create polished React interfaces and production-ready frontend workflows.",
    requiredSkills: ["react", "typescript", "javascript", "html", "css", "state management"],
    preferredSkills: ["testing", "figma", "firebase", "rest api"],
    tags: ["frontend", "react", "ui"]
  },
  {
    id: "backend-node-1",
    title: "Backend Developer",
    company: "CloudAxis",
    location: "Bengaluru",
    summary: "Create scalable APIs and data flows for AI-powered products.",
    requiredSkills: ["node.js", "express", "mongodb", "api design", "javascript"],
    preferredSkills: ["firebase", "google cloud", "testing", "authentication"],
    tags: ["backend", "node", "api"]
  },
  {
    id: "fullstack-js-1",
    title: "Full Stack Developer",
    company: "BridgeStack",
    location: "Hybrid",
    summary: "Build end-to-end product features across React frontends and Node.js APIs.",
    requiredSkills: ["react", "node.js", "express", "mongodb", "javascript", "rest api"],
    preferredSkills: ["typescript", "firebase", "google cloud", "testing"],
    tags: ["fullstack", "javascript", "product"]
  },
  {
    id: "ai-engineer-1",
    title: "AI Product Engineer",
    company: "SkillForge",
    location: "Hybrid",
    summary: "Ship AI-backed matching, recommendation, and scoring features.",
    requiredSkills: ["node.js", "nlp", "prompting", "mongodb", "python", "data modeling"],
    preferredSkills: ["google cloud", "vector search", "cosine similarity", "firebase"],
    tags: ["ai", "backend", "product"]
  },
  {
    id: "data-analyst-1",
    title: "Data Analyst",
    company: "InsightLoop",
    location: "Remote",
    summary: "Analyze business and product data to create reports, dashboards, and insights.",
    requiredSkills: ["python", "data modeling", "mongodb", "javascript"],
    preferredSkills: ["google cloud", "rest api", "testing", "prompting"],
    tags: ["data", "analytics", "entry-level"]
  },
  {
    id: "mobile-flutter-1",
    title: "Flutter Developer",
    company: "AppOrbit",
    location: "Bengaluru",
    summary: "Develop cross-platform mobile apps with modern UI and API integrations.",
    requiredSkills: ["flutter", "javascript", "rest api", "firebase"],
    preferredSkills: ["testing", "figma", "state management", "google cloud"],
    tags: ["mobile", "flutter", "apps"]
  },
  {
    id: "cloud-devops-1",
    title: "Cloud and DevOps Engineer",
    company: "DeployGrid",
    location: "Remote",
    summary: "Support deployments, environments, observability, and cloud infrastructure workflows.",
    requiredSkills: ["google cloud", "api design", "testing", "authentication"],
    preferredSkills: ["node.js", "mongodb", "python", "firebase"],
    tags: ["cloud", "devops", "infrastructure"]
  },
  {
    id: "qa-automation-1",
    title: "QA Automation Engineer",
    company: "AssurePath",
    location: "Hybrid",
    summary: "Improve product quality with automated test coverage and release confidence.",
    requiredSkills: ["testing", "javascript", "rest api", "html"],
    preferredSkills: ["typescript", "react", "node.js", "firebase"],
    tags: ["qa", "automation", "quality"]
  }
];

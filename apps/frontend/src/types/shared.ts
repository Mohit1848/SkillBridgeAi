export interface UserProfile {
  name: string;
  headline: string;
  education: string;
  targetRoles: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  preferredTimelineWeeks: number;
}

export interface ResumeAnalysisRequest {
  resumeText: string;
  profile: Partial<UserProfile>;
  targetJobId: string;
  source?: "manual" | "pdf";
  resumeFileName?: string;
}

export interface ManualProfileInput {
  name: string;
  headline: string;
  education: string;
  targetRoles: string;
  skills: string;
  projects: string;
  certifications: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tags: string[];
}

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  skill: string;
  durationHours: number;
  level: "beginner" | "intermediate" | "advanced";
  url: string;
}

export interface RoadmapStep {
  week: number;
  focus: string;
  goals: string[];
  courseIds: string[];
}

export interface SkillGap {
  skill: string;
  priority: "critical" | "recommended" | "optional";
  covered: boolean;
}

export interface MatchResult {
  jobId: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ReadinessBreakdown {
  resumeCompleteness: number;
  skillMatch: number;
  projectStrength: number;
  learningMomentum: number;
}

export interface AnalysisResponse {
  profile: UserProfile;
  extractedSkills: string[];
  targetJob: JobPosting;
  match: MatchResult;
  gaps: SkillGap[];
  roadmap: RoadmapStep[];
  recommendations: CourseRecommendation[];
  readinessScore: number;
  readinessBreakdown: ReadinessBreakdown;
  insights: string[];
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export interface AuthStatusResponse {
  enabled: boolean;
  user: AuthenticatedUser | null;
}

export interface ResumeUploadResponse {
  fileName: string;
  text: string;
  pageCount: number;
}

export interface AnalysisEnvelope {
  analysis: AnalysisResponse;
  saved: boolean;
  recordId: string | null;
}

export interface SavedAnalysisRecord {
  id: string;
  userId: string;
  createdAt: string;
  targetJobId: string;
  source: "manual" | "pdf";
  resumeFileName: string | null;
  analysis: AnalysisResponse;
}

export interface SimulationRequest {
  baseProfile: UserProfile;
  targetJobId: string;
  addedSkills: string[];
}

export interface SimulationResponse {
  beforeScore: number;
  afterScore: number;
  addedSkills: string[];
  newlyCoveredSkills: string[];
  remainingCriticalGaps: string[];
}

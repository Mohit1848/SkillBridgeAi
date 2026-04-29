import type { ResumeAnalysisRequest, UserProfile } from "@skillbridge/shared";
import type { SkillCatalog } from "../contracts/catalogs.js";
import { extractSkillsFromResume } from "../engines/parserEngine.js";
import { uniqueSkills } from "../lib/skillNormalization.js";

export const defaultProfile: UserProfile = {
  name: "Demo Student",
  headline: "Curious builder exploring frontend, backend, and AI.",
  education: "B.Tech Computer Science",
  targetRoles: ["Frontend Developer", "Backend Developer"],
  skills: ["react", "javascript", "html", "css"],
  projects: ["Portfolio website", "Job tracker app"],
  certifications: [],
  preferredTimelineWeeks: 6
};

export const buildProfile = (
  request: ResumeAnalysisRequest,
  skillCatalog: SkillCatalog
): { profile: UserProfile; extractedSkills: string[] } => {
  const extractedSkills = extractSkillsFromResume(request.resumeText, skillCatalog);
  const mergedSkills = uniqueSkills(
    [...(request.profile.skills ?? []), ...extractedSkills],
    skillCatalog.knownSkills,
    skillCatalog.aliases
  );

  return {
    extractedSkills,
    profile: {
      ...defaultProfile,
      ...request.profile,
      targetRoles: request.profile.targetRoles ?? defaultProfile.targetRoles,
      projects: request.profile.projects ?? defaultProfile.projects,
      certifications: request.profile.certifications ?? defaultProfile.certifications,
      preferredTimelineWeeks: request.profile.preferredTimelineWeeks ?? defaultProfile.preferredTimelineWeeks,
      skills: mergedSkills
    }
  };
};

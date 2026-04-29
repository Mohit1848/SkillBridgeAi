import type { ManualProfileInput, UserProfile } from "@skillbridge/shared";
import type { SkillCatalog } from "../contracts/catalogs.js";
import { uniqueSkills } from "../lib/skillNormalization.js";

const splitList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const parseManualProfile = (input: ManualProfileInput, skillCatalog: SkillCatalog): Partial<UserProfile> => ({
  name: input.name,
  headline: input.headline,
  education: input.education,
  targetRoles: splitList(input.targetRoles),
  skills: uniqueSkills(splitList(input.skills), skillCatalog.knownSkills, skillCatalog.aliases),
  projects: splitList(input.projects),
  certifications: splitList(input.certifications)
});

export const extractSkillsFromResume = (resumeText: string, skillCatalog: SkillCatalog): string[] => {
  const lowered = resumeText.toLowerCase();
  const extracted = skillCatalog.knownSkills.filter((skill) => lowered.includes(skill));

  const bulletStyleSkills = resumeText
    .split(/[\n|,]/)
    .map((chunk) => chunk.trim().toLowerCase())
    .filter((chunk) => chunk.length > 1);

  return uniqueSkills([...extracted, ...bulletStyleSkills], skillCatalog.knownSkills, skillCatalog.aliases);
};

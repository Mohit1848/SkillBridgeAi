import type { JobPosting, SkillGap } from "@skillbridge/shared";
import { normalizeSkill } from "../lib/skillNormalization.js";

export const computeGaps = (
  skills: string[],
  job: JobPosting,
  aliases: Record<string, string>
): SkillGap[] => {
  const profileSkills = skills.map((skill) => normalizeSkill(skill, aliases));
  const required = job.requiredSkills.map((skill) => normalizeSkill(skill, aliases));
  const preferred = job.preferredSkills.map((skill) => normalizeSkill(skill, aliases));

  const criticalGaps = required.map((skill) => ({
    skill,
    priority: "critical" as const,
    covered: profileSkills.includes(skill)
  }));

  const recommendedGaps = preferred
    .filter((skill) => !required.includes(skill))
    .map((skill) => ({
      skill,
      priority: "recommended" as const,
      covered: profileSkills.includes(skill)
    }));

  return [...criticalGaps, ...recommendedGaps];
};

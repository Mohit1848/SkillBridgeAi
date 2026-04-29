import type { JobPosting, MatchResult } from "@skillbridge/shared";
import { normalizeSkill } from "../lib/skillNormalization.js";

const cosineSimilarity = (left: string[], right: string[]): number => {
  const dimensions = [...new Set([...left, ...right])];
  const leftVector: number[] = dimensions.map((dimension) => (left.includes(dimension) ? 1 : 0));
  const rightVector: number[] = dimensions.map((dimension) => (right.includes(dimension) ? 1 : 0));

  const dot = leftVector.reduce((sum, value, index) => sum + value * rightVector[index], 0);
  const leftMagnitude = Math.sqrt(leftVector.reduce((sum, value) => sum + value * value, 0));
  const rightMagnitude = Math.sqrt(rightVector.reduce((sum, value) => sum + value * value, 0));

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (leftMagnitude * rightMagnitude);
};

export const matchProfileToJob = (
  skills: string[],
  job: JobPosting,
  aliases: Record<string, string>
): MatchResult => {
  const profileSkills = skills.map((skill) => normalizeSkill(skill, aliases));
  const jobSkills = [...job.requiredSkills, ...job.preferredSkills].map((skill) => normalizeSkill(skill, aliases));

  const matchedSkills = jobSkills.filter((skill) => profileSkills.includes(skill));
  const missingSkills = job.requiredSkills
    .map((skill) => normalizeSkill(skill, aliases))
    .filter((skill) => !profileSkills.includes(skill));

  return {
    jobId: job.id,
    score: Math.round(cosineSimilarity(profileSkills, jobSkills) * 100),
    matchedSkills,
    missingSkills
  };
};

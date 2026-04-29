import type { ReadinessBreakdown, UserProfile } from "@skillbridge/shared";

export const computeReadiness = (
  profile: UserProfile,
  matchScore: number,
  coveredGapRatio: number
): { score: number; breakdown: ReadinessBreakdown } => {
  const resumeCompleteness = Math.min(
    100,
    Math.round(
      [
        profile.name,
        profile.headline,
        profile.education,
        profile.projects.length > 0 ? "projects" : "",
        profile.certifications.length > 0 ? "certs" : ""
      ].filter(Boolean).length * 20
    )
  );

  const projectStrength = Math.min(100, profile.projects.length * 25);
  const learningMomentum = Math.min(100, Math.round((coveredGapRatio + profile.certifications.length * 0.15) * 100));

  const breakdown: ReadinessBreakdown = {
    resumeCompleteness,
    skillMatch: matchScore,
    projectStrength,
    learningMomentum
  };

  const score = Math.round(
    breakdown.resumeCompleteness * 0.2 +
      breakdown.skillMatch * 0.45 +
      breakdown.projectStrength * 0.2 +
      breakdown.learningMomentum * 0.15
  );

  return { score, breakdown };
};


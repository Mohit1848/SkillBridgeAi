import type {
  AnalysisResponse,
  ResumeAnalysisRequest,
  SimulationRequest,
  SimulationResponse,
  UserProfile
} from "@skillbridge/shared";
import type { CourseCatalog, JobCatalog, SkillCatalog } from "../contracts/catalogs.js";
import { computeGaps } from "../engines/gapEngine.js";
import { matchProfileToJob } from "../engines/matchingEngine.js";
import { recommendCourses } from "../engines/recommendationEngine.js";
import { buildRoadmap } from "../engines/roadmapEngine.js";
import { computeReadiness } from "../engines/scoreEngine.js";
import { uniqueSkills } from "../lib/skillNormalization.js";
import { buildProfile } from "./profileAssembler.js";

type AnalysisDependencies = {
  jobs: JobCatalog;
  courses: CourseCatalog;
  skills: SkillCatalog;
};

export const createAnalysisOrchestrator = (dependencies: AnalysisDependencies) => {
  const analyze = (request: ResumeAnalysisRequest): AnalysisResponse => {
    const targetJob = dependencies.jobs.getById(request.targetJobId) ?? dependencies.jobs.list()[0];
    const { profile, extractedSkills } = buildProfile(request, dependencies.skills);
    const match = matchProfileToJob(profile.skills, targetJob, dependencies.skills.aliases);
    const gaps = computeGaps(profile.skills, targetJob, dependencies.skills.aliases);
    const recommendations = recommendCourses(gaps, dependencies.courses.list());
    const roadmap = buildRoadmap(gaps, recommendations, profile.preferredTimelineWeeks);
    const coveredGapRatio = gaps.filter((gap) => gap.covered).length / Math.max(gaps.length, 1);
    const { score, breakdown } = computeReadiness(profile, match.score, coveredGapRatio);

    const insights = [
      match.score >= 70
        ? "You already cover the core requirements for this role."
        : "Your fundamentals are promising, but the target role still has visible skill gaps.",
      gaps.some((gap) => gap.priority === "critical" && !gap.covered)
        ? "Focus on critical gaps first before polishing optional skills."
        : "You have covered the critical requirements. Use projects to stand out.",
      recommendations.length > 0
        ? `A focused ${profile.preferredTimelineWeeks}-week plan can improve your readiness quickly.`
        : "Your profile is close to job-ready. Concentrate on applications and interview prep."
    ];

    return {
      profile,
      extractedSkills,
      targetJob,
      match,
      gaps,
      roadmap,
      recommendations,
      readinessScore: score,
      readinessBreakdown: breakdown,
      insights
    };
  };

  const simulate = (request: SimulationRequest): SimulationResponse => {
    const job = dependencies.jobs.getById(request.targetJobId) ?? dependencies.jobs.list()[0];
    const beforeMatch = matchProfileToJob(request.baseProfile.skills, job, dependencies.skills.aliases);
    const beforeGaps = computeGaps(request.baseProfile.skills, job, dependencies.skills.aliases);
    const beforeCovered = beforeGaps.filter((gap) => gap.covered).length / Math.max(beforeGaps.length, 1);
    const beforeScore = computeReadiness(request.baseProfile, beforeMatch.score, beforeCovered).score;

    const upgradedProfile: UserProfile = {
      ...request.baseProfile,
      skills: uniqueSkills(
        [...request.baseProfile.skills, ...request.addedSkills],
        dependencies.skills.knownSkills,
        dependencies.skills.aliases
      )
    };

    const afterMatch = matchProfileToJob(upgradedProfile.skills, job, dependencies.skills.aliases);
    const afterGaps = computeGaps(upgradedProfile.skills, job, dependencies.skills.aliases);
    const afterCovered = afterGaps.filter((gap) => gap.covered).length / Math.max(afterGaps.length, 1);
    const afterScore = computeReadiness(upgradedProfile, afterMatch.score, afterCovered).score;

    return {
      beforeScore,
      afterScore,
      addedSkills: request.addedSkills,
      newlyCoveredSkills: afterGaps.filter((gap) => gap.covered).map((gap) => gap.skill),
      remainingCriticalGaps: afterGaps
        .filter((gap) => gap.priority === "critical" && !gap.covered)
        .map((gap) => gap.skill)
    };
  };

  return { analyze, simulate };
};

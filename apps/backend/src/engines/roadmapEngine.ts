import type { CourseRecommendation, RoadmapStep, SkillGap } from "@skillbridge/shared";

export const buildRoadmap = (
  gaps: SkillGap[],
  recommendations: CourseRecommendation[],
  preferredTimelineWeeks: number
): RoadmapStep[] => {
  const missing = gaps.filter((gap) => !gap.covered);
  const timeline = Math.max(preferredTimelineWeeks, Math.max(missing.length, 4));
  const steps: RoadmapStep[] = [];

  for (let week = 1; week <= timeline; week += 1) {
    const gap = missing[(week - 1) % Math.max(missing.length, 1)];
    const focus = gap?.skill ?? "portfolio polish";
    const courseIds = recommendations.filter((course) => course.skill === focus).map((course) => course.id);

    steps.push({
      week,
      focus,
      goals: gap
        ? [
            `Learn the foundations of ${gap.skill}.`,
            `Build one mini project showing ${gap.skill}.`,
            "Update your resume and dashboard progress."
          ]
        : [
            "Refine your portfolio.",
            "Practice interview questions.",
            "Apply to matched jobs."
          ],
      courseIds
    });
  }

  return steps;
};


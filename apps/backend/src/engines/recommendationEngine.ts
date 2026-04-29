import type { CourseRecommendation, SkillGap } from "@skillbridge/shared";

export const recommendCourses = (
  gaps: SkillGap[],
  availableCourses: CourseRecommendation[]
): CourseRecommendation[] => {
  const missing = gaps.filter((gap) => !gap.covered).map((gap) => gap.skill);
  const picked = availableCourses.filter((course) => missing.includes(course.skill));

  return picked.slice(0, 6);
};

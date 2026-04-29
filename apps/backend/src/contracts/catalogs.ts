import type { CourseRecommendation, JobPosting } from "@skillbridge/shared";

export interface SkillCatalog {
  knownSkills: string[];
  aliases: Record<string, string>;
}

export interface JobCatalog {
  list(): JobPosting[];
  getById(id: string): JobPosting | undefined;
}

export interface CourseCatalog {
  list(): CourseRecommendation[];
}

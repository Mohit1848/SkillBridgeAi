import { courses } from "../data/courses.js";
import { jobs } from "../data/jobs.js";
import { knownSkills, skillAliases } from "../data/skills.js";
import type { CourseCatalog, JobCatalog, SkillCatalog } from "../contracts/catalogs.js";

export const jobCatalog: JobCatalog = {
  list: () => jobs,
  getById: (id) => jobs.find((job) => job.id === id)
};

export const courseCatalog: CourseCatalog = {
  list: () => courses
};

export const skillCatalog: SkillCatalog = {
  knownSkills,
  aliases: skillAliases
};

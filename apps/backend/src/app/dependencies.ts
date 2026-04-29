import { courseCatalog, jobCatalog, skillCatalog } from "../repositories/catalogRepository.js";
import { createAnalysisOrchestrator } from "../orchestrators/analysisOrchestrator.js";

export const appDependencies = {
  catalogs: {
    jobs: jobCatalog,
    courses: courseCatalog,
    skills: skillCatalog
  },
  analysis: createAnalysisOrchestrator({
    jobs: jobCatalog,
    courses: courseCatalog,
    skills: skillCatalog
  })
};

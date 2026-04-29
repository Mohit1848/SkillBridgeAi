import type { RequestHandler } from "express";
import type { JobCatalog } from "../contracts/catalogs.js";

export const createJobsController = (jobs: JobCatalog): { listJobs: RequestHandler } => ({
  listJobs: (_request, response) => {
    response.json(jobs.list());
  }
});

import type { Express } from "express";
import multer from "multer";
import { appDependencies } from "../app/dependencies.js";
import { getHealth } from "../controllers/healthController.js";
import { getAuthStatus } from "../controllers/authController.js";
import { createJobsController } from "../controllers/jobsController.js";
import { uploadResumeFile } from "../controllers/resumeController.js";
import { createAnalysisController } from "../controllers/analysisController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const registerRoutes = (app: Express): void => {
  const jobsController = createJobsController(appDependencies.catalogs.jobs);
  const analysisController = createAnalysisController(appDependencies.analysis);

  app.get("/health", getHealth);
  app.get("/api/auth/status", getAuthStatus);
  app.get("/api/jobs", jobsController.listJobs);
  app.post("/api/upload-resume", upload.single("resume"), uploadResumeFile);
  app.post("/api/analyze", analysisController.analyze);
  app.post("/api/simulate", analysisController.simulate);
  app.get("/api/me/analyses", analysisController.listMine);
};

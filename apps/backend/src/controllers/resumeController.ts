import type { RequestHandler } from "express";
import { badRequest } from "../lib/http.js";
import { parseUploadedResume } from "../services/resumeUploadService.js";

export const uploadResumeFile: RequestHandler = async (request, response) => {
  if (!request.file) {
    badRequest(response, "Resume file is required.");
    return;
  }

  if (!["application/pdf", "text/plain"].includes(request.file.mimetype)) {
    badRequest(response, "Only PDF or plain text resumes are supported.");
    return;
  }

  response.json(await parseUploadedResume(request.file));
};

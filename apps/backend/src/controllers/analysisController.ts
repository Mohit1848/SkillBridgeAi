import type { RequestHandler } from "express";
import type { ReturnTypeOfCreateAnalysisOrchestrator } from "../types/orchestrator.js";
import { persistAnalysisIfPossible } from "../orchestrators/analysisPersistence.js";
import { listSavedAnalyses } from "../services/mongo.js";
import { unauthorized } from "../lib/http.js";

export const createAnalysisController = (
  analysisOrchestrator: ReturnTypeOfCreateAnalysisOrchestrator
): {
  analyze: RequestHandler;
  simulate: RequestHandler;
  listMine: RequestHandler;
} => ({
  analyze: async (request, response) => {
    const analysis = analysisOrchestrator.analyze(request.body);
    const persistence = await persistAnalysisIfPossible({
      userId: request.authUser?.uid,
      targetJobId: request.body.targetJobId,
      source: request.body.source ?? "manual",
      resumeFileName: request.body.resumeFileName ?? null,
      analysis
    });

    response.json({
      analysis,
      saved: persistence.saved,
      recordId: persistence.recordId
    });
  },

  simulate: (request, response) => {
    response.json(analysisOrchestrator.simulate(request.body));
  },

  listMine: async (request, response) => {
    if (!request.authUser?.uid) {
      unauthorized(response);
      return;
    }

    response.json(await listSavedAnalyses(request.authUser.uid));
  }
});

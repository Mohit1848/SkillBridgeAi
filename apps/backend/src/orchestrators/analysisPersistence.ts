import type { AnalysisResponse } from "@skillbridge/shared";
import { flags } from "../config/env.js";
import { saveAnalysisRecord, saveUserProfile } from "../services/mongo.js";

export const persistAnalysisIfPossible = async (input: {
  userId: string | null | undefined;
  targetJobId: string;
  source: "manual" | "pdf";
  resumeFileName: string | null;
  analysis: AnalysisResponse;
}): Promise<{ saved: boolean; recordId: string | null }> => {
  if (!input.userId || !flags.mongoEnabled) {
    return { saved: false, recordId: null };
  }

  await saveUserProfile(input.userId, input.analysis.profile);
  const recordId = await saveAnalysisRecord({
    userId: input.userId,
    targetJobId: input.targetJobId,
    source: input.source,
    resumeFileName: input.resumeFileName,
    analysis: input.analysis
  });

  return {
    saved: Boolean(recordId),
    recordId
  };
};

import pdf from "pdf-parse";
import type { ResumeUploadResponse } from "@skillbridge/shared";

export const parseUploadedResume = async (file: Express.Multer.File): Promise<ResumeUploadResponse> => {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdf(file.buffer);

    return {
      fileName: file.originalname,
      text: parsed.text.trim(),
      pageCount: parsed.numpages
    };
  }

  return {
    fileName: file.originalname,
    text: file.buffer.toString("utf8").trim(),
    pageCount: 1
  };
};

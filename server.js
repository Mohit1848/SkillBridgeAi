require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const { encryptPayload } = require("./utils/encryption");
const { saveAnalysisResult } = require("./services/firestore");

const PORT = Number(process.env.RESUME_ANALYZER_PORT || 4000);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_CHARS = 120000;

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});

app.use(express.json({ limit: "1mb" }));

function parseKeywordInput(jobKeywords) {
  if (!jobKeywords) {
    return undefined;
  }

  if (Array.isArray(jobKeywords)) {
    return jobKeywords.map((keyword) => String(keyword).trim()).filter(Boolean);
  }

  if (typeof jobKeywords === "string") {
    const trimmed = jobKeywords.trim();

    if (!trimmed) {
      return undefined;
    }

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed)
          ? parsed.map((keyword) => String(keyword).trim()).filter(Boolean)
          : undefined;
      } catch {
        return undefined;
      }
    }

    return trimmed
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  return undefined;
}

function buildSecurePayload(req) {
  const jobKeywords = parseKeywordInput(req.body?.job_keywords);

  if (req.file) {
    const extension = path.extname(req.file.originalname || "").toLowerCase();
    const mimeType = (req.file.mimetype || "").toLowerCase();
    const supportedFile =
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/") ||
      extension === ".pdf" ||
      extension === ".txt";

    if (!supportedFile) {
      const error = new Error("Unsupported file format. Only PDF and text resumes are allowed.");
      error.statusCode = 415;
      throw error;
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      const error = new Error("Uploaded resume file is empty.");
      error.statusCode = 400;
      throw error;
    }

    return {
      input_type: "file",
      filename: req.file.originalname,
      mime_type: mimeType,
      content_base64: req.file.buffer.toString("base64"),
      job_keywords: jobKeywords
    };
  }

  const resumeText = typeof req.body?.resume_text === "string" ? req.body.resume_text.trim() : "";

  if (!resumeText) {
    const error = new Error("Provide either resume_text or a resume file.");
    error.statusCode = 400;
    throw error;
  }

  if (resumeText.length > MAX_TEXT_CHARS) {
    const error = new Error("Resume text is too large for secure processing.");
    error.statusCode = 413;
    throw error;
  }

  return {
    input_type: "text",
    content: resumeText,
    job_keywords: jobKeywords
  };
}

function runSecureProcessor(encryptedPayload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "tee", "secureProcessor.py");
    const pythonProcess = spawn("python", [scriptPath], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    pythonProcess.on("error", () => {
      reject(new Error("Failed to start secure resume processor."));
    });

    pythonProcess.on("close", (code) => {
      const output = stdout.trim();

      if (!output) {
        reject(new Error("Secure processor returned an empty response."));
        return;
      }

      try {
        const parsed = JSON.parse(output);

        if (code !== 0 || parsed.error) {
          reject(new Error(parsed.error || "Secure processor failed to analyze the resume."));
          return;
        }

        resolve(parsed);
      } catch {
        reject(new Error(stderr.trim() || "Secure processor returned invalid JSON."));
      }
    });

    pythonProcess.stdin.write(JSON.stringify({ encrypted_payload: encryptedPayload }));
    pythonProcess.stdin.end();
  });
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "resume-analyzer-api"
  });
});

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    const securePayload = buildSecurePayload(req);

    // Raw resume content is encrypted here and only decrypted inside the isolated Python TEE module.
    const encryptedPayload = encryptPayload(JSON.stringify(securePayload));

    // The Python module behaves like a secure black box and returns sanitized analysis output only.
    const analysis = await runSecureProcessor(encryptedPayload);
    const storage = await saveAnalysisResult(analysis);

    res.status(200).json({
      success: true,
      analysis,
      storage
    });
  } catch (error) {
    const statusCode =
      error?.code === "LIMIT_FILE_SIZE"
        ? 413
        : Number(error?.statusCode) || 500;

    const message =
      error?.code === "LIMIT_FILE_SIZE"
        ? "Resume file is too large. Maximum supported size is 5 MB."
        : error?.message || "Resume analysis failed.";

    res.status(statusCode).json({
      success: false,
      error: message
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Resume Analyzer API running on http://localhost:${PORT}`);
  });
}

module.exports = {
  app
};

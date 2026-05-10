import type {
  AnalysisResponse,
  AnalysisEnvelope,
  AuthStatusResponse,
  JobPosting,
  ResumeAnalysisRequest,
  ResumeUploadResponse,
  SavedAnalysisRecord,
  SimulationRequest,
  SimulationResponse
} from "@skillbridge/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
let authToken = "";

export const setApiToken = (token: string): void => {
  authToken = token;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const fetchJobs = (): Promise<JobPosting[]> => request<JobPosting[]>("/api/jobs");

export const fetchAuthStatus = (): Promise<AuthStatusResponse> => request<AuthStatusResponse>("/api/auth/status");

export const uploadResume = (file: File): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("resume", file);

  return request<ResumeUploadResponse>("/api/upload-resume", {
    method: "POST",
    body: formData
  });
};

export const analyzeResume = (body: ResumeAnalysisRequest): Promise<AnalysisEnvelope> =>
  request<AnalysisEnvelope>("/api/analyze", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const simulateProfile = (body: SimulationRequest): Promise<SimulationResponse> =>
  request<SimulationResponse>("/api/simulate", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const fetchSavedAnalyses = (): Promise<SavedAnalysisRecord[]> =>
  request<SavedAnalysisRecord[]>("/api/me/analyses");

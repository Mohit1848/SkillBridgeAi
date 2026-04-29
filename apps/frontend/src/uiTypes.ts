import type {
  AnalysisResponse,
  AuthStatusResponse,
  JobPosting,
  ManualProfileInput,
  SavedAnalysisRecord,
  SimulationResponse
} from "@skillbridge/shared";
import type { User } from "firebase/auth";

export type AppView = "user" | "developer";

export interface WorkspaceProps {
  analysis: AnalysisResponse | null;
  authStatus: AuthStatusResponse | null;
  currentUser: User | null;
  error: string;
  firebaseEnabled: boolean;
  firebaseConfigError: string;
  isDeveloperUser: boolean;
  handleAnalyze: (event: React.FormEvent) => Promise<void>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleManualInputChange: (
    field: keyof ManualProfileInput
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleSimulate: () => Promise<void>;
  jobs: JobPosting[];
  loading: boolean;
  manualInput: ManualProfileInput;
  savedAnalyses: SavedAnalysisRecord[];
  selectedJob: JobPosting | undefined;
  selectedJobId: string;
  setSelectedJobId: (value: string) => void;
  setSimulationSkills: (value: string) => void;
  setView: (view: AppView) => void;
  setResumeText: (value: string) => void;
  simulation: SimulationResponse | null;
  simulationSkills: string;
  success: string;
  uploadedFileName: string;
  uploading: boolean;
  resumeText: string;
}

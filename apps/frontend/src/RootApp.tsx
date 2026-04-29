import { ChangeEvent, FormEvent, startTransition, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import type {
  AnalysisEnvelope,
  AnalysisResponse,
  AuthStatusResponse,
  JobPosting,
  ManualProfileInput,
  SavedAnalysisRecord,
  SimulationResponse,
  UserProfile
} from "@skillbridge/shared";
import {
  analyzeResume,
  fetchAuthStatus,
  fetchJobs,
  fetchSavedAnalyses,
  setApiToken,
  simulateProfile,
  uploadResume
} from "./api";
import DeveloperWorkspace from "./DeveloperWorkspace";
import { developerEmail, firebaseAuth, firebaseConfigError, firebaseEnabled, googleProvider } from "./firebase";
import type { AppView } from "./uiTypes";
import UserWorkspace from "./UserWorkspace";

const defaultResume = `Asha Sharma
Frontend-focused fresher with project experience in React, JavaScript, HTML, CSS, Firebase and REST API integration.
Built a portfolio website and a student dashboard app.
Interested in frontend, backend and AI product roles.`;

const defaultManualInput: ManualProfileInput = {
  name: "Asha Sharma",
  headline: "Frontend-focused fresher exploring full-stack and AI-powered products.",
  education: "B.Tech Computer Science",
  targetRoles: "Frontend Developer, Backend Developer",
  skills: "React, JavaScript, HTML, CSS, Firebase, REST API",
  projects: "Portfolio website, Student dashboard app",
  certifications: "Responsive Web Design"
};

const parseCommaList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const buildProfile = (input: ManualProfileInput): Partial<UserProfile> => ({
  name: input.name,
  headline: input.headline,
  education: input.education,
  targetRoles: parseCommaList(input.targetRoles),
  skills: parseCommaList(input.skills).map((skill) => skill.toLowerCase()),
  projects: parseCommaList(input.projects),
  certifications: parseCommaList(input.certifications),
  preferredTimelineWeeks: 6
});

function RootApp() {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialView: AppView =
    typeof window !== "undefined" && searchParams?.get("view") === "developer"
      ? "developer"
      : "user";
  const [view, setView] = useState<AppView>(initialView);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumeText, setResumeText] = useState(defaultResume);
  const [manualInput, setManualInput] = useState(defaultManualInput);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simulationSkills, setSimulationSkills] = useState("TypeScript, Testing");
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisRecord[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDeveloperUser = Boolean(currentUser?.email && developerEmail && currentUser.email.toLowerCase() === developerEmail);

  useEffect(() => {
    fetchJobs()
      .then((items) => {
        setJobs(items);
        setSelectedJobId(items[0]?.id ?? "");
      })
      .catch(() => {
        setError("Backend not reachable. Start the backend on port 4000.");
      });

    fetchAuthStatus().then(setAuthStatus).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseAuth) {
      setApiToken("");
      return;
    }

    return onAuthStateChanged(firebaseAuth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setApiToken("");
        setSavedAnalyses([]);
        return;
      }

      const token = await user.getIdToken();
      setApiToken(token);
      const status = await fetchAuthStatus().catch(() => null);
      if (status) {
        setAuthStatus(status);
      }
      const records = await fetchSavedAnalyses().catch(() => []);
      setSavedAnalyses(records);
    });
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0],
    [jobs, selectedJobId]
  );

  const handleManualInputChange =
    (field: keyof ManualProfileInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setManualInput((current) => ({
        ...current,
        [field]: event.target.value
      }));
    };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploaded = await uploadResume(file);
      setResumeText(uploaded.text);
      setUploadedFileName(uploaded.fileName);
      setSuccess(`Loaded ${uploaded.fileName} with ${uploaded.pageCount} page(s).`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Resume upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const refreshSavedAnalyses = async (): Promise<void> => {
    if (!currentUser) {
      return;
    }

    const records = await fetchSavedAnalyses().catch(() => []);
    setSavedAnalyses(records);
  };

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedJobId) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setSimulation(null);

    try {
      const result: AnalysisEnvelope = await analyzeResume({
        resumeText,
        profile: buildProfile(manualInput),
        targetJobId: selectedJobId,
        source: uploadedFileName ? "pdf" : "manual",
        resumeFileName: uploadedFileName || undefined
      });

      startTransition(() => {
        setAnalysis(result.analysis);
      });

      if (result.saved) {
        setSuccess("Analysis saved to MongoDB for your account.");
        await refreshSavedAnalyses();
      } else if (currentUser) {
        setSuccess("Analysis completed, but MongoDB is not configured yet.");
      } else {
        setSuccess("Analysis completed in guest mode.");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to analyze profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!analysis) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await simulateProfile({
        baseProfile: analysis.profile,
        targetJobId: analysis.targetJob.id,
        addedSkills: parseCommaList(simulationSkills).map((skill) => skill.toLowerCase())
      });

      setSimulation(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!firebaseAuth || !googleProvider) {
      setError(firebaseConfigError);
      return;
    }

    setError("");
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Google sign-in failed.";
      setError(
        `${message} If your Firebase config is correct, also make sure Google sign-in is enabled in the Firebase console and localhost is an authorized domain.`
      );
    }
  };

  const handleSignOut = async () => {
    if (!firebaseAuth) {
      return;
    }

    await signOut(firebaseAuth);
    setCurrentUser(null);
    setSavedAnalyses([]);
    setSuccess("Signed out.");
  };

  const workspaceProps = {
    analysis,
    authStatus,
    currentUser,
    error,
    firebaseEnabled,
    firebaseConfigError,
    isDeveloperUser,
    handleAnalyze,
    handleFileUpload,
    handleManualInputChange,
    handleSignIn,
    handleSignOut,
    handleSimulate,
    jobs,
    loading,
    manualInput,
    savedAnalyses,
    selectedJob,
    selectedJobId,
    setSelectedJobId,
    setSimulationSkills,
    setView,
    setResumeText,
    simulation,
    simulationSkills,
    success,
    uploadedFileName,
    uploading,
    resumeText
  };

  if (view === "developer" && !isDeveloperUser) {
    return <UserWorkspace {...workspaceProps} />;
  }

  return view === "user" ? <UserWorkspace {...workspaceProps} /> : <DeveloperWorkspace {...workspaceProps} />;
}

export default RootApp;

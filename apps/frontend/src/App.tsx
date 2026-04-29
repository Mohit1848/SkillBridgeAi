import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type {
  AnalysisResponse,
  JobPosting,
  ManualProfileInput,
  SimulationResponse,
  UserProfile
} from "@skillbridge/shared";
import { analyzeResume, fetchJobs, simulateProfile } from "./api";

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

function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumeText, setResumeText] = useState(defaultResume);
  const [manualInput, setManualInput] = useState(defaultManualInput);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simulationSkills, setSimulationSkills] = useState("TypeScript, Testing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs()
      .then((items) => {
        setJobs(items);
        setSelectedJobId(items[0]?.id ?? "");
      })
      .catch(() => {
        setError("Backend not reachable. Start the backend on port 4000.");
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

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedJobId) {
      return;
    }

    setLoading(true);
    setError("");
    setSimulation(null);

    try {
      const result = await analyzeResume({
        resumeText,
        profile: buildProfile(manualInput),
        targetJobId: selectedJobId
      });

      setAnalysis(result.analysis);
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

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">SkillBridge AI</span>
          <h1>Career readiness for students and freshers, mapped into one living dashboard.</h1>
          <p>
            Upload resume text, compare it with a target role, detect missing skills, and generate a roadmap with
            what-if simulation.
          </p>
          <div className="hero-metrics">
            <div>
              <strong>{jobs.length}</strong>
              <span>Target roles seeded</span>
            </div>
            <div>
              <strong>{analysis?.readinessScore ?? 0}%</strong>
              <span>Readiness score</span>
            </div>
            <div>
              <strong>{analysis?.gaps.filter((gap) => !gap.covered).length ?? 0}</strong>
              <span>Open skill gaps</span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <p className="hero-card-title">Platform Stack</p>
          <ul>
            <li>Frontend: React dashboard</li>
            <li>Backend: Node.js analysis APIs</li>
            <li>Data: Mongo-ready repositories</li>
            <li>Auth + realtime: Firebase-ready integration points</li>
            <li>Deploy: Google Cloud friendly structure</li>
          </ul>
        </div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Student Input</span>
              <h2>Resume upload + manual profile</h2>
            </div>
            <label className="job-picker">
              <span>Target role</span>
              <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <form onSubmit={handleAnalyze} className="profile-form">
            <label>
              <span>Resume text</span>
              <textarea rows={8} value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
            </label>

            <div className="grid-two">
              <label>
                <span>Name</span>
                <input value={manualInput.name} onChange={handleManualInputChange("name")} />
              </label>
              <label>
                <span>Headline</span>
                <input value={manualInput.headline} onChange={handleManualInputChange("headline")} />
              </label>
            </div>

            <label>
              <span>Education</span>
              <input value={manualInput.education} onChange={handleManualInputChange("education")} />
            </label>

            <div className="grid-two">
              <label>
                <span>Target roles</span>
                <input value={manualInput.targetRoles} onChange={handleManualInputChange("targetRoles")} />
              </label>
              <label>
                <span>Certifications</span>
                <input value={manualInput.certifications} onChange={handleManualInputChange("certifications")} />
              </label>
            </div>

            <label>
              <span>Skills</span>
              <textarea rows={3} value={manualInput.skills} onChange={handleManualInputChange("skills")} />
            </label>

            <label>
              <span>Projects</span>
              <textarea rows={3} value={manualInput.projects} onChange={handleManualInputChange("projects")} />
            </label>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze profile"}
            </button>
          </form>

          {error ? <p className="error-banner">{error}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h2>Readiness, matching, and recommendations</h2>
            </div>
            {selectedJob ? (
              <div className="job-summary">
                <strong>{selectedJob.title}</strong>
                <span>
                  {selectedJob.company} · {selectedJob.location}
                </span>
              </div>
            ) : null}
          </div>

          {analysis ? (
            <div className="dashboard-grid">
              <article className="score-card highlight-card">
                <span>Readiness score</span>
                <strong>{analysis.readinessScore}%</strong>
                <p>{analysis.insights[0]}</p>
              </article>

              <article className="score-card">
                <span>Match score</span>
                <strong>{analysis.match.score}%</strong>
                <p>{analysis.match.matchedSkills.length} matched skills against the target role.</p>
              </article>

              <article className="score-card">
                <span>Critical gaps</span>
                <strong>{analysis.gaps.filter((gap) => gap.priority === "critical" && !gap.covered).length}</strong>
                <p>{analysis.insights[1]}</p>
              </article>

              <article className="score-card">
                <span>Learning plan</span>
                <strong>{analysis.roadmap.length} weeks</strong>
                <p>{analysis.insights[2]}</p>
              </article>

              <article className="detail-card">
                <h3>Extracted skills</h3>
                <div className="chip-row">
                  {analysis.profile.skills.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>

              <article className="detail-card">
                <h3>Skill gaps</h3>
                <div className="gap-list">
                  {analysis.gaps.map((gap) => (
                    <div key={gap.skill} className={`gap-item ${gap.covered ? "covered" : "open"}`}>
                      <span>{gap.skill}</span>
                      <small>
                        {gap.priority} · {gap.covered ? "covered" : "missing"}
                      </small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="detail-card">
                <h3>Roadmap</h3>
                <div className="timeline">
                  {analysis.roadmap.map((step) => (
                    <div key={step.week} className="timeline-item">
                      <div className="timeline-week">Week {step.week}</div>
                      <div>
                        <strong>{step.focus}</strong>
                        <p>{step.goals[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="detail-card">
                <h3>Recommended courses</h3>
                <div className="course-list">
                  {analysis.recommendations.map((course) => (
                    <a key={course.id} className="course-card" href={course.url} target="_blank" rel="noreferrer">
                      <strong>{course.title}</strong>
                      <span>
                        {course.provider} · {course.durationHours}h
                      </span>
                      <small>{course.skill}</small>
                    </a>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Run your first analysis</h3>
              <p>The dashboard will fill with a readiness score, skill gaps, roadmap, and course recommendations.</p>
            </div>
          )}
        </section>
      </main>

      <section className="panel simulator-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Simulator</span>
            <h2>What if I add new skills?</h2>
          </div>
        </div>

        <div className="simulator-layout">
          <label className="simulator-input">
            <span>Add skills</span>
            <input value={simulationSkills} onChange={(event) => setSimulationSkills(event.target.value)} />
          </label>
          <button className="secondary-button" onClick={handleSimulate} disabled={!analysis || loading}>
            Run what-if simulation
          </button>
        </div>

        {simulation ? (
          <div className="simulation-results">
            <div className="score-card">
              <span>Before</span>
              <strong>{simulation.beforeScore}%</strong>
            </div>
            <div className="score-card highlight-card">
              <span>After</span>
              <strong>{simulation.afterScore}%</strong>
            </div>
            <div className="score-card">
              <span>Remaining critical gaps</span>
              <strong>{simulation.remainingCriticalGaps.length}</strong>
            </div>
          </div>
        ) : (
          <p className="simulator-note">Use the simulator after running an analysis to preview score improvement.</p>
        )}
      </section>
    </div>
  );
}

export default App;

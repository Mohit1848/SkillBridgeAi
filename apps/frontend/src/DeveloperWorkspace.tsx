import type { WorkspaceProps } from "./uiTypes";

function DeveloperWorkspace({
  analysis,
  authStatus,
  currentUser,
  error,
  firebaseConfigError,
  firebaseEnabled,
  handleAnalyze,
  handleFileUpload,
  handleManualInputChange,
  handleSignIn,
  handleSignOut,
  handleSimulate,
  isDeveloperUser,
  jobs,
  loading,
  manualInput,
  savedAnalyses,
  selectedJob,
  selectedJobId,
  setSelectedJobId,
  setSimulationSkills,
  setView,
  simulation,
  simulationSkills,
  success,
  uploadedFileName,
  uploading,
  resumeText,
  setResumeText
}: WorkspaceProps) {
  const integrationItems = [
    { label: "Frontend auth", value: firebaseEnabled ? "Configured" : "Guest mode" },
    { label: "Backend auth", value: authStatus?.enabled ? "Verified" : "Missing admin credentials" },
    { label: "Persistence", value: currentUser ? "Mongo save enabled" : "Sign in to persist" },
    { label: "Resume parsing", value: "PDF and text supported" }
  ];

  return (
    <div className="app-shell app-shell-light">
      <div className="workspace-switch">
        <button className="workspace-tab" onClick={() => setView("user")}>
          Preview User UI
        </button>
        <button className="workspace-tab active" disabled={!isDeveloperUser}>
          Developer UI
        </button>
      </div>

      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">SkillBridge AI</span>
          <h1>Career readiness for students and freshers, mapped into one living dashboard.</h1>
          <p>
            Upload a PDF resume, sign in with Firebase, persist analyses to MongoDB, and compare your profile against
            target roles with roadmap generation.
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
              <strong>{savedAnalyses.length}</strong>
              <span>Saved analyses</span>
            </div>
          </div>
          <div className="hero-strip">
            <span className="hero-badge">
              {currentUser ? `Signed in as ${currentUser.displayName ?? currentUser.email}` : "Guest mode"}
            </span>
            <span className="hero-badge">
              {uploadedFileName ? `Resume loaded: ${uploadedFileName}` : "No resume file uploaded yet"}
            </span>
          </div>
        </div>
        <div className="hero-card">
          <p className="hero-card-title">Live integrations</p>
          <div className="integration-grid">
            {integrationItems.map((item) => (
              <div key={item.label} className="integration-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="auth-actions">
            {firebaseEnabled ? (
              currentUser ? (
                <>
                  <span className="auth-user">{currentUser.displayName ?? currentUser.email}</span>
                  <button className="secondary-button" onClick={() => void handleSignOut()}>
                    Sign out
                  </button>
                </>
              ) : (
                <button className="secondary-button" onClick={() => void handleSignIn()}>
                  Sign in with Google
                </button>
              )
            ) : (
              <span className="auth-user">{firebaseConfigError}</span>
            )}
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Student Input</span>
              <h2>PDF upload + manual profile</h2>
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

          <form onSubmit={(event) => void handleAnalyze(event)} className="profile-form">
            <label>
              <span>Resume PDF or text file</span>
              <input
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(event) => void handleFileUpload(event)}
              />
            </label>

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

            <button type="submit" className="primary-button" disabled={loading || uploading}>
              {uploading ? "Uploading..." : loading ? "Analyzing..." : "Analyze profile"}
            </button>
          </form>

          <div className="form-tips">
            <span>Tip: upload a PDF, then fine-tune the extracted text before analysis.</span>
            <span>Best results come from keeping target role and listed skills aligned.</span>
          </div>

          {uploadedFileName ? <p className="status-banner">Uploaded file: {uploadedFileName}</p> : null}
          {success ? <p className="status-banner success">{success}</p> : null}
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
                  {selectedJob.company} - {selectedJob.location}
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
                        {gap.priority} - {gap.covered ? "covered" : "missing"}
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
                        {course.provider} - {course.durationHours}h
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
          <button className="secondary-button" onClick={() => void handleSimulate()} disabled={!analysis || loading}>
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

      <section className="panel simulator-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Saved History</span>
            <h2>Recent analyses</h2>
          </div>
        </div>

        {savedAnalyses.length > 0 ? (
          <div className="history-grid">
            {savedAnalyses.map((record) => (
              <div key={record.id} className="history-card">
                <div className="history-topline">
                  <strong>{record.analysis.targetJob.title}</strong>
                  <span>{record.analysis.readinessScore}% ready</span>
                </div>
                <p>{new Date(record.createdAt).toLocaleString()}</p>
                <small>
                  {record.source} source - user {record.userId.slice(0, 8)}...
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="simulator-note">Sign in and analyze your profile to populate MongoDB-backed history.</p>
        )}
      </section>
    </div>
  );
}

export default DeveloperWorkspace;

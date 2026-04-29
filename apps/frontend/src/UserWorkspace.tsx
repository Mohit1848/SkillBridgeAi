import type { FormEvent } from "react";
import type { WorkspaceProps } from "./uiTypes";

function UserWorkspace({
  analysis,
  currentUser,
  error,
  firebaseEnabled,
  handleAnalyze,
  handleFileUpload,
  handleSignIn,
  handleSignOut,
  isDeveloperUser,
  jobs,
  loading,
  selectedJob,
  selectedJobId,
  setSelectedJobId,
  setView,
  success,
  uploadedFileName,
  uploading
}: WorkspaceProps) {
  return (
    <div className="user-shell">
      <header className="marketing-nav">
        <div className="brand-lockup">
          <div className="brand-mark">SB</div>
          <span>SkillBridge AI</span>
        </div>
        <nav className="marketing-links">
          <a href="#resume-check">Resume</a>
          <a href="#features">Cover Letter</a>
          <a href="#features">Blog</a>
          <a href="#features">For Organizations</a>
          <a href="#features">Pricing</a>
        </nav>
        <div className="marketing-actions">
          {firebaseEnabled ? (
            currentUser ? (
              <>
                <span className="nav-note">{currentUser.displayName ?? currentUser.email}</span>
                <button className="nav-button ghost" onClick={() => void handleSignOut()}>
                  Log out
                </button>
                {isDeveloperUser ? (
                  <button className="nav-button ghost" onClick={() => setView("developer")}>
                    Developer UI
                  </button>
                ) : null}
              </>
            ) : (
              <button className="nav-button ghost" onClick={() => void handleSignIn()}>
                Sign in
              </button>
            )
          ) : (
            <span className="nav-note">Guest mode available</span>
          )}
          <button className="nav-button solid" onClick={() => document.getElementById("resume-check")?.scrollIntoView({ behavior: "smooth" })}>
            Get Started
          </button>
        </div>
      </header>

      <section className="resume-hero" id="resume-check">
        <div className="resume-copy">
          <span className="resume-tag">Resume checker</span>
          <h1>Is your resume good enough?</h1>
          <p>
            A fast AI resume checker for students and freshers. Upload your file, compare against target roles, and
            see whether your profile is interview-ready.
          </p>

          <div className="resume-dropzone">
            <div className="resume-drop-copy">
              <p>Drop your resume here or choose a file.</p>
              <span>PDF and TXT only. Personalized score, gap analysis, and roadmap included.</span>
            </div>

            <label className="upload-button">
              <input
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(event) => void handleFileUpload(event)}
                disabled={uploading}
              />
              {uploading ? "Uploading..." : "Upload Your Resume"}
            </label>

            <div className="resume-meta">
              <span>Privacy guaranteed</span>
              <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="analyze-button"
              onClick={(event) => void handleAnalyze(event as unknown as FormEvent)}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Scan my resume"}
            </button>

            {uploadedFileName ? <p className="user-status">Loaded: {uploadedFileName}</p> : null}
            {success ? <p className="user-status success">{success}</p> : null}
            {error ? <p className="user-status error">{error}</p> : null}
          </div>
        </div>

        <div className="resume-preview-card">
          <div className="preview-header">
            <span>SkillBridge scan</span>
            <strong>{analysis?.readinessScore ?? 92}/100</strong>
          </div>
          <div className="preview-body">
            <div className="preview-score-ring">
              <div className="preview-score-core">{analysis?.readinessScore ?? 92}%</div>
            </div>
            <div className="preview-metrics">
              <div>
                <span>Target role</span>
                <strong>{selectedJob?.title ?? "Frontend Developer"}</strong>
              </div>
              <div>
                <span>Match score</span>
                <strong>{analysis?.match.score ?? 88}%</strong>
              </div>
              <div>
                <span>Critical gaps</span>
                <strong>{analysis?.gaps.filter((gap) => gap.priority === "critical" && !gap.covered).length ?? 2}</strong>
              </div>
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-label-row">
              <span>Resume completeness</span>
              <span>{analysis?.readinessBreakdown.resumeCompleteness ?? 90}%</span>
            </div>
            <div className="preview-bar">
              <div style={{ width: `${analysis?.readinessBreakdown.resumeCompleteness ?? 90}%` }} />
            </div>
            <div className="preview-label-row">
              <span>Skill match</span>
              <span>{analysis?.match.score ?? 88}%</span>
            </div>
            <div className="preview-bar">
              <div style={{ width: `${analysis?.match.score ?? 88}%` }} />
            </div>
            <div className="preview-note">
              {analysis?.insights[0] ?? "Upload and scan to see your readiness, missing skills, and roadmap."}
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band" id="features">
        <article>
          <span>Resume score</span>
          <strong>{analysis?.readinessScore ?? 92}%</strong>
          <p>See instant readiness and completeness feedback after one upload.</p>
        </article>
        <article>
          <span>Skill gaps</span>
          <strong>{analysis?.gaps.filter((gap) => !gap.covered).length ?? 6}</strong>
          <p>Spot missing skills before you apply for your next target role.</p>
        </article>
        <article>
          <span>Roadmap</span>
          <strong>{analysis?.roadmap.length ?? 6} weeks</strong>
          <p>Get a practical roadmap with focused steps, projects, and recommendations.</p>
        </article>
      </section>

      {analysis ? (
        <section className="report-band">
          <div className="report-header">
            <div>
              <span className="resume-tag">Your report</span>
              <h2>What you should do next to get better</h2>
            </div>
            <div className="report-pill">
              <strong>{analysis.readinessScore}%</strong>
              <span>overall readiness</span>
            </div>
          </div>

          <div className="report-grid">
            <article className="report-card">
              <h3>Top missing skills</h3>
              <div className="report-chip-row">
                {analysis.gaps
                  .filter((gap) => !gap.covered)
                  .slice(0, 6)
                  .map((gap) => (
                    <span key={gap.skill} className={`report-chip ${gap.priority}`}>
                      {gap.skill}
                    </span>
                  ))}
              </div>
            </article>

            <article className="report-card">
              <h3>Immediate improvements</h3>
              <div className="improvement-list">
                {analysis.insights.map((insight) => (
                  <div key={insight} className="improvement-item">
                    {insight}
                  </div>
                ))}
              </div>
            </article>

            <article className="report-card">
              <h3>Next roadmap steps</h3>
              <div className="improvement-list">
                {analysis.roadmap.slice(0, 3).map((step) => (
                  <div key={step.week} className="improvement-item">
                    <strong>Week {step.week}:</strong> {step.focus}
                  </div>
                ))}
              </div>
            </article>

            <article className="report-card">
              <h3>Recommended courses</h3>
              <div className="improvement-list">
                {analysis.recommendations.slice(0, 3).map((course) => (
                  <a key={course.id} className="course-link" href={course.url} target="_blank" rel="noreferrer">
                    {course.title}
                  </a>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default UserWorkspace;

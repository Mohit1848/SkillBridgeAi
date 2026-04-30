import type { WorkspaceProps } from "./uiTypes";

interface LandingPageProps {
  currentUser: WorkspaceProps["currentUser"];
  error: string;
  firebaseEnabled: boolean;
  handleSignIn: WorkspaceProps["handleSignIn"];
  setView: WorkspaceProps["setView"];
}

function LandingPage({ currentUser, error, firebaseEnabled, handleSignIn, setView }: LandingPageProps) {
  const openDashboard = async () => {
    if (currentUser || !firebaseEnabled) {
      setView("user");
      return;
    }

    const signedIn = await handleSignIn();
    if (signedIn) {
      setView("user");
    }
  };

  return (
    <div className="landing-shell">
      <nav className="landing-nav" aria-label="Main navigation">
        <div className="landing-brand">
          Skill<span>Bridge</span> AI
        </div>
        <ul className="landing-links">
          <li>
            <a href="#landing-features">Features</a>
          </li>
          <li>
            <a href="#landing-cta">Pricing</a>
          </li>
          <li>
            <button className="landing-nav-cta" onClick={() => void openDashboard()}>
              Login / Sign up
            </button>
          </li>
        </ul>
      </nav>

      <section className="landing-hero" aria-label="Hero">
        <div className="landing-badge">
          <div className="landing-badge-dot" />
          AI Resume Analyzer
        </div>
        <h1 className="landing-title">
          SkillBridge
          <br />
          <span>AI</span>
        </h1>
        <p className="landing-sub">
          Smarter Resume Analysis.
          <br />
          Instant Feedback. Real Results.
        </p>
        <p className="landing-tagline">Get ATS Scores | Improve Instantly | Get Hired Faster</p>
        <div className="landing-actions">
          <button className="landing-primary" onClick={() => void openDashboard()}>
            Login / Sign up to Dashboard
            <span aria-hidden="true">-&gt;</span>
          </button>
          <a className="landing-secondary" href="#landing-features">
            See features
          </a>
        </div>
        {error ? <p className="landing-error">{error}</p> : null}
      </section>

      <section className="landing-demo" aria-label="Product demo">
        <div className="landing-demo-screen">
          <div className="landing-progress" />
          <div className="landing-demo-grid">
            <article>
              <span>Step 01</span>
              <strong>Upload Your Resume</strong>
              <p>Start with your PDF or TXT resume and choose a target role.</p>
            </article>
            <article>
              <span>Step 02</span>
              <strong>AI Analyzes in Seconds</strong>
              <p>SkillBridge parses skills, gaps, role fit, and resume readiness.</p>
            </article>
            <article>
              <span>Step 03</span>
              <strong>Get ATS Score & Insights</strong>
              <p>See your score, missing skills, roadmap, and recommendations.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-features" id="landing-features" aria-labelledby="landing-features-title">
        <p className="landing-section-label">What You Get</p>
        <h2 id="landing-features-title">Everything you need to land the interview</h2>
        <p className="landing-section-sub">
          Built for students, freshers, and job seekers who need practical career feedback.
        </p>

        <div className="landing-feature-grid">
          {[
            ["ATS Score Analysis", "Understand how your resume matches the target job description.", "Instant results"],
            ["Skill Gap Detection", "Pinpoint missing skills and why they matter for your next role.", "AI-powered"],
            ["Smart Suggestions", "Get practical improvements for resume content and positioning.", "Actionable"],
            ["Resume Optimization", "Move from resume upload to a clear learning roadmap.", "Dashboard ready"]
          ].map(([name, desc, tag]) => (
            <article className="landing-feature-card" key={name}>
              <div className="landing-feature-icon" aria-hidden="true">
                *
              </div>
              <div className="landing-feature-name">{name}</div>
              <div className="landing-feature-desc">{desc}</div>
              <div className="landing-feature-tag">{tag}</div>
            </article>
          ))}
        </div>

        <div className="landing-stats" aria-label="Key statistics">
          <div>
            <strong>94%</strong>
            <span>of users can identify resume improvements after one scan</span>
          </div>
          <div>
            <strong>3x</strong>
            <span>clearer interview preparation with targeted role matching</span>
          </div>
          <div>
            <strong>8s</strong>
            <span>average path from upload to actionable report</span>
          </div>
        </div>
      </section>

      <section className="landing-cta-band" id="landing-cta">
        <h2>Start Optimizing Your Resume Today</h2>
        <p>Login or sign up to access your dashboard and run your first resume analysis.</p>
        <button className="landing-primary" onClick={() => void openDashboard()}>
          Try SkillBridge AI
          <span aria-hidden="true">-&gt;</span>
        </button>
        {!firebaseEnabled ? <span className="landing-note">Firebase is not configured, so dashboard opens in guest mode.</span> : null}
      </section>

      <footer className="landing-footer">
        <div className="landing-brand">
          Skill<span>Bridge</span> AI
        </div>
        <div>Copyright 2026 SkillBridge AI. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default LandingPage;

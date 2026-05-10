# SkillBridge AI

SkillBridge AI is an end-to-end resume analysis and career readiness platform for students, freshers, and early-career job seekers. It starts with a polished landing UI, supports login or guest access, analyzes uploaded resumes against target job roles, and shows a dashboard with readiness score, skill gaps, course recommendations, roadmap, and what-if simulation.

## Live Demo

- Website: [https://frontend-nu-weld-33.vercel.app](https://frontend-nu-weld-33.vercel.app)
- Backend API: [https://backend-nine-kappa-98.vercel.app](https://backend-nine-kappa-98.vercel.app)

Note: Google login requires the Vercel frontend domain to be added in Firebase Authentication authorized domains.

## What It Does

- Shows a SkillBridge AI starting page with login / sign up access
- Opens the dashboard after login or guest entry
- Uploads PDF or TXT resumes
- Extracts resume text and candidate skills
- Compares skills against a selected target job
- Calculates match score and readiness score
- Finds critical and recommended skill gaps
- Recommends courses for missing skills
- Builds a week-by-week learning roadmap
- Simulates score improvement after adding new skills
- Saves analysis history for authenticated users when MongoDB is configured
- Returns to the starting page after sign out

## Current App Flow

```text
Landing page
  -> Login / sign up or guest access
  -> Dashboard
  -> Upload resume or use manual profile
  -> Select target job role
  -> Backend extracts and normalizes skills
  -> Backend matches profile against job requirements
  -> Backend calculates scores, gaps, recommendations, and roadmap
  -> Frontend displays the full report
```

## Monorepo Layout

```text
SkillBridge_Ai/
|-- apps/
|   |-- backend/      Express API, analysis engines, auth, persistence
|   `-- frontend/     React + Vite user interface
|-- docs/
|   |-- architecture.md
|   `-- PROJECT_FRAMEWORK.md
|-- packages/
|   |-- data/         Seeded jobs, skills, aliases, courses
|   `-- shared/       Shared TypeScript contracts
|-- services/
|-- tee/
|-- utils/
|-- server.js
|-- package.json
`-- tsconfig.base.json
```

## Tech Stack

- Frontend: React, Vite, TypeScript, CSS
- Backend: Node.js, Express, TypeScript
- Resume parsing: `pdf-parse` for PDF uploads
- Auth: Firebase client and Firebase Admin verification
- Persistence: MongoDB for signed-in analysis history
- Shared contracts: TypeScript models in `packages/shared`
- Seed data: jobs, skills, aliases, and courses in `packages/data`

## Analysis Framework

The analysis pipeline is explainable and rule-based.

```text
Resume text
  -> Skill extraction
  -> Skill normalization
  -> Target job matching
  -> Gap detection
  -> Readiness scoring
  -> Course recommendation
  -> Roadmap generation
  -> Dashboard report
```

### Resume Parsing

PDF and TXT uploads are handled by the backend. PDF files are parsed into text, while TXT files are read directly as UTF-8 text.

### Skill Extraction

The backend checks resume text against known skills and also reads comma-separated or line-separated skill lists. Skill aliases are normalized, for example:

- `js` -> `javascript`
- `ts` -> `typescript`
- `node` -> `node.js`
- `mongo` -> `mongodb`
- `gcp` -> `google cloud`
- `rest` -> `rest api`

### Match Score

The app compares candidate skills with the selected job's required and preferred skills using cosine similarity over skill presence vectors.

```text
match score = cosine similarity(candidate skills, job skills) * 100
```

### Readiness Score

The readiness score combines resume quality, skill fit, project strength, and learning progress.

```text
readiness score =
  resume completeness * 0.20
  + skill match * 0.45
  + project strength * 0.20
  + learning momentum * 0.15
```

Breakdown:

- Resume completeness: name, headline, education, projects, certifications
- Skill match: cosine similarity against the selected job
- Project strength: based on number of projects
- Learning momentum: covered gaps plus certifications

### Gap Detection

- Required job skills become critical gaps if missing.
- Preferred job skills become recommended gaps if missing.
- Covered skills are marked as already satisfied.

### Recommendations and Roadmap

Missing skills are matched with the course catalog. The roadmap then turns missing skills into weekly learning goals. The timeline is at least 4 weeks and expands based on missing skills or the user's preferred timeline.

Read the complete framework in [docs/PROJECT_FRAMEWORK.md](docs/PROJECT_FRAMEWORK.md).

## Main API Routes

- `GET /health`
- `GET /api/auth/status`
- `GET /api/jobs`
- `GET /api/me/analyses`
- `POST /api/upload-resume`
- `POST /api/analyze`
- `POST /api/simulate`

## Local Setup

Install dependencies from the workspace root:

```bash
npm install
```

Copy environment files:

```bash
copy .env.example .env
copy apps\frontend\.env.example apps\frontend\.env
```

Configure backend values when needed:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Configure frontend Firebase values when needed:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_DEVELOPER_EMAIL`

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open:

[http://localhost:5173](http://localhost:5173)

The frontend talks to the backend at:

```text
http://localhost:4000
```

## Build and Typecheck

```bash
npm run build
npm run typecheck
```

## Vercel Deployment Plan

Recommended deployment: use two Vercel projects from the same GitHub repository.

```text
Project 1: SkillBridge frontend
Root Directory: apps/frontend

Project 2: SkillBridge backend
Root Directory: apps/backend
```

This keeps the React/Vite frontend and Express API backend independently configurable.

### 1. Frontend Project on Vercel

Create a Vercel project with:

```text
Root Directory: apps/frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Frontend environment variables:

```text
VITE_API_BASE_URL=https://your-backend-vercel-url.vercel.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_DEVELOPER_EMAIL=your_developer_email
```

The frontend API client uses `VITE_API_BASE_URL` in production and falls back to `http://localhost:4000` for local development.

Expected production frontend URL:

```text
https://your-frontend-project.vercel.app
```

### 2. Backend Project on Vercel

Create a second Vercel project with:

```text
Root Directory: apps/backend
Framework Preset: Other
Build Command: npm run build
Output Directory: leave empty
```

Backend environment variables:

```text
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=your_database_name
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY=your_firebase_admin_private_key
FRONTEND_ORIGIN=https://your-frontend-project.vercel.app
```

The backend includes a Vercel serverless entry at `apps/backend/api/index.ts` and deployment config at `apps/backend/vercel.json`.

Expected production backend URL:

```text
https://your-backend-project.vercel.app
```

### 3. Firebase Production Setup

In Firebase Console:

1. Open Authentication.
2. Enable Google sign-in.
3. Add authorized domains:
   - `localhost`
   - `your-frontend-project.vercel.app`

If the Vercel domain is not authorized, Google login can fail in production.

### 4. MongoDB Production Setup

If using MongoDB Atlas:

1. Create or select a production cluster.
2. Add the production connection string to Vercel as `MONGODB_URI`.
3. Set `MONGODB_DB_NAME`.
4. Configure Network Access for the deployment environment.
5. Test signed-in analysis saving after deployment.

### 5. Production Verification Checklist

After deployment, verify:

- Landing page loads
- Login / sign up works
- Sign out returns to the starting page
- Target jobs load from backend
- PDF/TXT resume upload works
- Resume analysis returns readiness score
- Skill gaps display correctly
- Course recommendations display
- Roadmap displays
- What-if simulator works
- Signed-in analysis history saves and loads

### 6. Suggested Production URLs

```text
Frontend: https://skillbridge-ai.vercel.app
Backend:  https://skillbridge-api.vercel.app
```

## Guest Mode and Auth Notes

- If Firebase is not configured, users can still open the dashboard in guest mode.
- If MongoDB is not configured, analysis still works but history is not saved.
- If Firebase and MongoDB are configured, signed-in users can save and view past analyses.

## Important Files

- Frontend entry: `apps/frontend/src/RootApp.tsx`
- Landing UI: `apps/frontend/src/LandingPage.tsx`
- Dashboard UI: `apps/frontend/src/UserWorkspace.tsx`
- Frontend API client: `apps/frontend/src/api.ts`
- Backend orchestrator: `apps/backend/src/orchestrators/analysisOrchestrator.ts`
- Resume parser: `apps/backend/src/services/resumeUploadService.ts`
- Skill parser: `apps/backend/src/engines/parserEngine.ts`
- Matching engine: `apps/backend/src/engines/matchingEngine.ts`
- Gap engine: `apps/backend/src/engines/gapEngine.ts`
- Score engine: `apps/backend/src/engines/scoreEngine.ts`
- Roadmap engine: `apps/backend/src/engines/roadmapEngine.ts`
- Project framework: `docs/PROJECT_FRAMEWORK.md`

## Future Improvements

- Upload custom job descriptions
- Add ATS formatting checks
- Add grammar and impact-word feedback
- Add deeper semantic resume parsing
- Score project quality from project descriptions
- Add LinkedIn/GitHub portfolio verification
- Add admin tools for jobs, skills, and courses

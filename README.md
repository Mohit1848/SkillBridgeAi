<<<<<<< HEAD
# SkillBridge AI

SkillBridge AI is an end-to-end app for students and freshers who want to understand how close they are to a target job role. The app now supports PDF resume upload, Firebase sign-in, and MongoDB-backed saved analyses in addition to skill extraction, matching, roadmap generation, and what-if simulation.

## What is included

- React frontend dashboard
- Node.js + Express backend APIs
- Shared TypeScript models
- Seeded job and course data
- PDF resume upload and parsing
- Firebase authentication wiring
- MongoDB persistence for signed-in analysis history
- Matching engine using cosine-style overlap scoring
- Skill-gap analyzer
- Roadmap generator
- Readiness scoring
- What-if simulator

## Monorepo layout

```text
SkillBridge_Ai/
|-- apps/
|   |-- backend/
|   `-- frontend/
|-- docs/
|   `-- architecture.md
|-- packages/
|   |-- data/
|   `-- shared/
|-- package.json
`-- tsconfig.base.json
```

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Data layer: MongoDB-backed persistence plus shared seeded repositories
- Auth/realtime target: Firebase client + Firebase Admin verification
- Cloud target: Google Cloud friendly deployment split

## Main features

### Student / fresher dashboard

- Resume PDF or text upload
- Manual profile editing
- Job target selection
- Readiness score
- Skill-match score
- Missing skills
- Personalized roadmap
- Course recommendations
- What-if simulator

### Backend / AI services

- Resume parsing
- Skill extraction
- Matching engine
- Gap analyzer
- Roadmap engine
- Recommendation engine
- Score engine
- Firebase token verification
- MongoDB analysis persistence

## Local run

1. Install dependencies at the workspace root:

```bash
npm install
```

2. Configure backend environment variables:

```bash
copy .env.example .env
```

3. Configure frontend Firebase variables:

```bash
copy apps\frontend\.env.example apps\frontend\.env
```

4. Fill in your values:

- `MONGODB_URI` and `MONGODB_DB_NAME` for MongoDB
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for Firebase Admin on the backend
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` for Firebase web auth on the frontend

5. Start the backend:

```bash
npm run dev:backend
```

6. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

7. Open the frontend at [http://localhost:5173](http://localhost:5173)

The frontend talks to the backend at `http://localhost:4000`.

## API overview

- `GET /health`
- `GET /api/auth/status`
- `GET /api/jobs`
- `GET /api/me/analyses`
- `POST /api/upload-resume`
- `POST /api/analyze`
- `POST /api/simulate`

## Notes

- If MongoDB is not configured, analysis still works in guest mode but nothing is persisted.
- If Firebase env vars are not configured, the frontend stays in guest mode and the backend skips token verification.
- PDF upload uses server-side parsing through the backend upload endpoint.

The architecture breakdown lives in [docs/architecture.md](/D:/SkillBridge_Ai/docs/architecture.md).
=======
# SkillBridgeAi
>>>>>>> c2f6f788dbe254f04ac13aacab96830e67395f57

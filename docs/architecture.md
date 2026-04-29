# SkillBridge AI Architecture

## 1. Users

Primary user:

- Student / fresher

Primary goals:

- Upload resume
- Understand current skills
- See job fit
- Identify missing skills
- Get a roadmap to improve readiness

## 2. Frontend

Platform:

- React dashboard UI

Key screens:

- Auth and onboarding
- Resume upload
- Manual profile input
- Dashboard
- Job matching results
- Skill-gap report
- Roadmap and course timeline
- Simulator / what-if tool

Main frontend responsibilities:

- Collect resume PDF or manual profile data
- Display parsed resume data
- Show readiness score and match score
- Let users simulate adding skills or courses
- Show recommended next actions

## 3. Backend / AI

Runtime:

- Node.js

Main services:

- API gateway
- NLP parser
- Skill extraction service
- Matching engine
- Gap analyzer
- Roadmap engine
- Recommender
- Score engine

Responsibilities by service:

### API gateway

- Accept requests from frontend
- Route to parsing, scoring, matching, and roadmap services
- Enforce auth and request validation

### NLP parser

- Parse PDF resumes
- Normalize raw text
- Convert manual input into a common profile schema

### Skill extraction

- Extract technical, soft, and tool-based skills
- Normalize aliases such as `JS` to `JavaScript`
- Attach confidence scores to extracted skills

### Matching engine

- Compare candidate profile with job descriptions
- Use cosine similarity across vectorized skill and JD representations
- Return ranked jobs or ranked fit results

### Gap analyzer

- Detect missing skills against target roles
- Group gaps by critical, recommended, and optional skills

### Roadmap engine

- Turn missing skills into a practical learning plan
- Create weekly or monthly timelines
- Sequence prerequisites before advanced skills

### Recommender

- Suggest courses, learning resources, and projects
- Filter content by relevance, quality, and level

### Score engine

- Calculate readiness percentage
- Blend resume completeness, skill match, project depth, and learning progress

## 4. Data Layer

Primary database:

- MongoDB

Collections:

- User profiles
- Resume metadata
- Extracted skills
- Job dataset
- Job-description index
- Skill taxonomy
- Recommendations
- Roadmaps
- Simulation snapshots

Suggested data entities:

### User profile

- Basic info
- Education
- Projects
- Experience
- Skills
- Certifications
- Target roles

### Job dataset

- Job title
- Company
- Description
- Required skills
- Preferred skills
- Seniority
- Location

### Skills + JD index

- Canonical skill names
- Skill embeddings or vectors
- Job description embeddings or vectors
- Alias mappings

## 5. Supporting Platforms

### Firebase

- Authentication
- Session management
- Realtime progress/status updates

### Google Cloud

- Deploy frontend and backend
- Host APIs
- Run background jobs
- Store files if resume uploads need object storage

## 6. End-to-End Flow

```text
User
  -> React frontend
  -> API gateway
  -> Resume parser
  -> Skill extraction
  -> Profile + skills stored in MongoDB
  -> Matching engine compares against job dataset
  -> Gap analyzer finds missing skills
  -> Roadmap engine builds timeline
  -> Score engine computes readiness %
  -> Frontend dashboard displays results
```

## 7. Recommended Folder Ownership

```text
apps/frontend
  UI, state, upload flow, dashboard, simulator

apps/backend
  APIs, AI orchestration, matching, scoring, roadmap logic

packages/data
  Schemas, database access, repositories, shared models
```

## 8. Suggested MVP

Phase 1:

- Firebase auth
- Resume upload
- Resume text extraction
- Skill extraction
- Basic job matching
- Readiness score
- Dashboard

Phase 2:

- Gap analyzer
- Course recommendations
- What-if simulator
- Learning roadmap with timeline

Phase 3:

- Realtime progress updates
- Personalized recommendations
- Better scoring and ranking
- Admin pipeline for job dataset refresh

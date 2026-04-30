# SkillBridge AI Project Framework

## 1. Project Purpose

SkillBridge AI is a resume analysis and career readiness platform for students, freshers, and early-career job seekers.

The system accepts a resume and profile details, compares the candidate against a selected target job role, calculates readiness, identifies skill gaps, recommends courses, and generates a week-by-week learning roadmap.

## 2. High-Level Workflow

```text
User opens frontend
  -> Login or guest access
  -> Upload resume or enter profile details
  -> Select target job role
  -> Backend extracts skills from resume
  -> Backend compares candidate skills with job skills
  -> Backend calculates match score and readiness score
  -> Backend identifies missing critical and recommended skills
  -> Backend recommends courses for missing skills
  -> Backend builds roadmap
  -> Frontend displays dashboard report
```

## 3. Main Modules

### Frontend

Location: `apps/frontend`

The frontend is a React + Vite app. It provides:

- Starting landing UI
- Login / sign up entry point
- Resume upload panel
- Target role selector
- Dashboard report
- Readiness score preview
- Skill gap report
- Course recommendations
- Roadmap display
- Sign-out flow back to starting page

Main files:

- `apps/frontend/src/LandingPage.tsx`
- `apps/frontend/src/UserWorkspace.tsx`
- `apps/frontend/src/RootApp.tsx`
- `apps/frontend/src/api.ts`

### Backend

Location: `apps/backend`

The backend is an Express API. It handles:

- Resume PDF/TXT parsing
- Profile building
- Skill extraction
- Job matching
- Gap detection
- Readiness scoring
- Course recommendation
- Roadmap generation
- Auth-aware saved analysis history

Main files:

- `apps/backend/src/orchestrators/analysisOrchestrator.ts`
- `apps/backend/src/orchestrators/profileAssembler.ts`
- `apps/backend/src/engines/parserEngine.ts`
- `apps/backend/src/engines/matchingEngine.ts`
- `apps/backend/src/engines/gapEngine.ts`
- `apps/backend/src/engines/scoreEngine.ts`
- `apps/backend/src/engines/recommendationEngine.ts`
- `apps/backend/src/engines/roadmapEngine.ts`

### Shared Types

Location: `packages/shared`

Shared TypeScript contracts define the shape of:

- User profile
- Resume analysis request
- Job posting
- Match result
- Skill gap
- Readiness breakdown
- Roadmap step
- Course recommendation
- Saved analysis record

### Data Package

Location: `packages/data`

This package contains seeded platform data:

- Target job roles
- Required skills per job
- Preferred skills per job
- Known skills
- Skill aliases
- Course catalog

## 4. Resume Upload Framework

The resume upload API accepts:

- PDF files
- Plain text files

File handling is done in:

`apps/backend/src/services/resumeUploadService.ts`

For PDF resumes:

- The backend uses `pdf-parse`.
- It extracts raw text from the uploaded PDF buffer.
- It returns file name, extracted text, and page count.

For TXT resumes:

- The backend converts the file buffer into UTF-8 text.
- It returns file name, extracted text, and page count as `1`.

Unsupported file types are rejected by:

`apps/backend/src/controllers/resumeController.ts`

## 5. Profile Building Framework

Profile building happens in:

`apps/backend/src/orchestrators/profileAssembler.ts`

The platform combines:

- Manual profile data from the frontend
- Skills extracted from resume text
- Default demo profile values if fields are missing

The final profile contains:

- Name
- Headline
- Education
- Target roles
- Skills
- Projects
- Certifications
- Preferred timeline in weeks

The system merges manual skills and extracted resume skills into one normalized skill list.

## 6. Skill Extraction Framework

Skill extraction happens in:

`apps/backend/src/engines/parserEngine.ts`

The current project uses a rule-based skill extraction method.

### Step 1: Convert resume text to lowercase

This makes matching case-insensitive.

Example:

```text
React, JavaScript, Firebase
```

becomes:

```text
react, javascript, firebase
```

### Step 2: Match known skills

The system checks whether any known skill appears in the resume text.

Known skills are defined in:

`packages/data/src/skills.ts`

Examples:

- React
- JavaScript
- TypeScript
- Node.js
- Express
- MongoDB
- Firebase
- Google Cloud
- REST API
- Testing
- Python
- NLP

### Step 3: Extract bullet/comma-separated skills

The resume text is split by:

- New lines
- Pipes
- Commas

This helps detect skills written as bullet points or comma lists.

### Step 4: Normalize aliases

Aliases are converted into standard skill names.

Examples:

```text
js -> javascript
ts -> typescript
node -> node.js
mongo -> mongodb
gcp -> google cloud
rest -> rest api
```

### Step 5: Remove duplicates

The system keeps a unique normalized skill list.

## 7. Target Job Framework

Target jobs are defined in:

`packages/data/src/jobs.ts`

Each job has:

- Job ID
- Job title
- Company
- Location
- Summary
- Required skills
- Preferred skills
- Tags

Example:

```text
Frontend Developer
Required: react, typescript, javascript, html, css, rest api
Preferred: firebase, testing, figma, state management
```

Required skills are treated as critical.

Preferred skills are treated as recommended.

## 8. Matching Framework

Matching happens in:

`apps/backend/src/engines/matchingEngine.ts`

The system compares:

```text
Candidate skills
vs
Target job required + preferred skills
```

### Matching Method

The project uses cosine similarity over skill presence vectors.

In simple words:

- Every unique skill becomes a dimension.
- If the candidate has the skill, value is `1`.
- If the candidate does not have the skill, value is `0`.
- The job role is represented the same way.
- Cosine similarity measures how close both vectors are.

### Match Score Formula

```text
match score = cosine similarity(candidate skills, job skills) * 100
```

The result is rounded to a percentage.

### Match Result Includes

- Job ID
- Match score
- Matched skills
- Missing required skills

## 9. Skill Gap Framework

Gap detection happens in:

`apps/backend/src/engines/gapEngine.ts`

The system creates two types of gaps:

### Critical Gaps

Critical gaps come from required job skills.

Example:

```text
required skill: typescript
candidate does not have typescript
result: critical gap
```

### Recommended Gaps

Recommended gaps come from preferred job skills.

Example:

```text
preferred skill: testing
candidate does not have testing
result: recommended gap
```

Each gap contains:

- Skill name
- Priority
- Covered status

## 10. Readiness Score Framework

Readiness scoring happens in:

`apps/backend/src/engines/scoreEngine.ts`

The readiness score is not only a skill score. It combines four factors:

| Factor | Weight | Meaning |
|---|---:|---|
| Resume completeness | 20% | Whether profile fields are filled |
| Skill match | 45% | How closely candidate skills match the selected job |
| Project strength | 20% | Whether candidate has projects |
| Learning momentum | 15% | How many gaps are covered plus certifications |

### Final Readiness Formula

```text
readiness score =
  resume completeness * 0.20
  + skill match * 0.45
  + project strength * 0.20
  + learning momentum * 0.15
```

The final score is rounded to a whole number.

### Resume Completeness

The system checks five profile fields:

- Name
- Headline
- Education
- Projects
- Certifications

Each completed item contributes 20 points.

```text
resume completeness = completed profile fields * 20
```

Maximum score: `100`

### Skill Match

This is the cosine similarity match score from the matching engine.

Maximum score: `100`

### Project Strength

The system rewards project count.

```text
project strength = number of projects * 25
```

Maximum score: `100`

Examples:

- 1 project = 25
- 2 projects = 50
- 3 projects = 75
- 4 or more projects = 100

### Learning Momentum

Learning momentum uses:

- Covered gap ratio
- Number of certifications

```text
learning momentum = (covered gap ratio + certifications * 0.15) * 100
```

Maximum score: `100`

## 11. Course Recommendation Framework

Course recommendations happen in:

`apps/backend/src/engines/recommendationEngine.ts`

Courses are defined in:

`packages/data/src/courses.ts`

The recommendation engine:

1. Finds all missing skills.
2. Searches the course catalog for matching skill courses.
3. Returns up to 6 course recommendations.

Example:

```text
Missing skill: typescript
Recommended course: TypeScript for Modern Teams
```

## 12. Roadmap Framework

Roadmap generation happens in:

`apps/backend/src/engines/roadmapEngine.ts`

The roadmap converts missing skills into weekly learning steps.

### Timeline Length

The timeline is calculated as:

```text
timeline = max(preferred timeline weeks, missing skills count, 4)
```

So the roadmap is always at least 4 weeks.

### Weekly Step Includes

Each roadmap week contains:

- Week number
- Focus skill
- Goals
- Related course IDs

Example:

```text
Week 1
Focus: typescript
Goals:
- Learn the foundations of typescript.
- Build one mini project showing typescript.
- Update your resume and dashboard progress.
```

If there are no missing skills, the roadmap focuses on:

- Portfolio polish
- Interview practice
- Job applications

## 13. Insight Generation Framework

Insights are generated in:

`apps/backend/src/orchestrators/analysisOrchestrator.ts`

The system creates three summary messages:

1. Overall match insight
2. Gap priority insight
3. Roadmap or job-readiness insight

Examples:

- If match score is 70 or higher:
  - Candidate already covers core requirements.

- If critical gaps exist:
  - Candidate should focus on critical gaps first.

- If recommendations exist:
  - Candidate should follow the focused roadmap.

## 14. Simulation Framework

Simulation happens in:

`apps/backend/src/orchestrators/analysisOrchestrator.ts`

The simulator answers:

```text
What happens if I learn these extra skills?
```

Process:

1. Calculate current score.
2. Add simulated skills to the profile.
3. Normalize and remove duplicates.
4. Recalculate match score, gaps, and readiness score.
5. Return before score, after score, newly covered skills, and remaining critical gaps.

## 15. Data Persistence Framework

Authenticated users can save analysis history.

Flow:

```text
Frontend gets Firebase token
  -> Sends token to backend
  -> Backend verifies user
  -> Analysis is saved if MongoDB is configured
```

Saved records include:

- User ID
- Created date
- Target job ID
- Resume source
- Resume file name
- Full analysis result

## 16. Complete Analysis Output

The backend returns:

- Final user profile
- Extracted skills
- Target job
- Match score
- Matched skills
- Missing skills
- Skill gaps
- Readiness score
- Readiness breakdown
- Roadmap
- Course recommendations
- Insights

## 17. Example Scoring Scenario

Candidate skills:

```text
react, javascript, html, css, firebase
```

Target role:

```text
Frontend Developer
Required: react, typescript, javascript, html, css, rest api
Preferred: firebase, testing, figma, state management
```

The system:

1. Finds matched skills:
   - react
   - javascript
   - html
   - css
   - firebase

2. Finds missing critical skills:
   - typescript
   - rest api

3. Finds missing recommended skills:
   - testing
   - figma
   - state management

4. Calculates skill match using cosine similarity.

5. Calculates readiness using:
   - resume completeness
   - skill match
   - project strength
   - learning momentum

6. Recommends matching courses.

7. Builds a weekly roadmap around missing skills.

## 18. Framework Summary

SkillBridge AI uses a structured, explainable framework:

```text
Resume Text
  -> Skill Extraction
  -> Skill Normalization
  -> Target Job Matching
  -> Gap Detection
  -> Readiness Scoring
  -> Course Recommendation
  -> Roadmap Generation
  -> Dashboard Report
```

The current scoring model is explainable and rule-based. It does not depend on a hidden AI model for scoring. This is useful for transparency because every score can be traced back to skills, projects, certifications, profile completeness, and target job requirements.

## 19. Future Improvements

Possible upgrades:

- Add semantic resume parsing using an LLM or NLP model.
- Add job description upload instead of only seeded jobs.
- Add weighted skill importance per company or role.
- Improve project quality scoring by checking project descriptions.
- Add ATS formatting checks.
- Add grammar and impact-word analysis.
- Add GitHub/LinkedIn portfolio verification.
- Add personalized interview preparation.
- Add admin panel for managing jobs, skills, and courses.


# Manual Implementation Guide — Five-Day Sprint

This guide continues from the uploaded project. **Do not recreate the React or Express application from scratch.** The repository already has a frontend, backend, routes, pages and database scripts. The manual method is to inspect, repair, test, document and commit each existing part.

## Working rules

1. Keep a backup of the original folder before editing.
2. Work from the project root in VS Code/PowerShell.
3. Use two terminals when running frontend and backend.
4. Make one focused change at a time.
5. Run the relevant test before committing.
6. Add milestone notes and evidence immediately, not at the end.
7. Never commit `.env`, credentials, tokens or real personal information.

## Day 1 — Milestone 1: inspect and complete design

### Step 1: open the existing project

```powershell
Set-Location "$HOME\Desktop\Lost and Found"
code .
```

Purpose: opens the existing folder in VS Code. Change the path if your folder is elsewhere.

### Step 2: inspect tools and project files

```powershell
node --version
npm --version
git --version
mysql --version
Get-ChildItem
Get-ChildItem .\frontend\src\pages
Get-ChildItem .\backend\routes
```

Purpose: confirms the runtime tools and shows the current frontend/backend files. Do not proceed with database setup until MySQL is available.

### Step 3: create the design/evidence structure

```powershell
New-Item -ItemType Directory -Force -Path .\documentation, .\diagrams, .\evidence
```

Purpose: stores design documents, editable diagram sources and evidence screenshots/test outputs.

### Step 4: review design artefacts

Read these files in the project:
- `documentation/milestone-1-design-brief.md`
- `diagrams/ERD.mmd`
- `diagrams/SYSTEM-ARCHITECTURE.mmd`
- `diagrams/USE-CASE.mmd`
- `diagrams/REPORT-TO-RETURN-WORKFLOW.mmd`
- `diagrams/CLAIM-SEQUENCE.mmd`
- `diagrams/SECURITY-ACCESS.mmd`

Draw or export each Mermaid diagram as PNG/SVG for the report and slides. Add mobile and desktop screen sketches based on the existing React pages. Have the group approve requirements and responsibilities.

### Step 5: verify Git and create the first real commit

```powershell
git status
git add documentation diagrams
git commit -m "docs: complete milestone one requirements and system design"
```

If Git asks for identity, configure your own name/email first:

```powershell
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

Purpose: preserves a verifiable record of the design work. Do not invent a commit as evidence for work not performed.

**Milestone 1 exit checks:** approved problem statement, requirements, acceptance criteria, wireframes, ERD, architecture, use cases, workflow and work plan.

## Day 2 — Milestone 2A: repair database, backend setup and authentication

### Step 1: install backend dependencies

```powershell
Set-Location "$HOME\Desktop\Lost and Found"
npm install
npm install --prefix .\backend
```

Purpose: installs root and backend packages. The current README only gives a root install command, so verify backend dependencies are actually resolved.

### Step 2: install frontend dependencies

```powershell
npm install --prefix .\frontend
```

Purpose: installs React, React Router, Axios, Vite and frontend build tools.

### Step 3: configure environment variables

The backend calls `dotenv.config()` from its backend process directory. Create `backend/.env` and keep it out of Git:

```powershell
Copy-Item .\.env.example .\backend\.env.example -Force
Copy-Item .\backend\.env.example .\backend\.env
notepad .\backend\.env
```

Check that `backend/.env` contains your local database host, port, user, password, database name, a long random session secret, and a one-time admin setup key. Do not paste real secrets into chat or commit them. The example file must contain placeholders only.

### Step 4: create and import the database

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ucu_lost_found_db;"
Get-Content .\database\schema.sql | mysql -u root -p ucu_lost_found_db
Get-Content .\database\seed.sql | mysql -u root -p ucu_lost_found_db
```

Purpose: creates the database and imports the tables and fictional sample data. Enter the MySQL password only at the secure prompt.

### Step 5: verify the database objects

```powershell
mysql -u root -p -D ucu_lost_found_db -e "SHOW TABLES; DESCRIBE users; DESCRIBE item_reports; DESCRIBE claims;"
```

Purpose: confirms that all three tables exist and have the expected columns.

### Step 6: start the API

```powershell
Set-Location "$HOME\Desktop\Lost and Found\backend"
npm run dev
```

In a second terminal, check:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

The current health endpoint only confirms Express is running; improve it to check MySQL before treating it as a full readiness check.

### Step 7: test authentication

Use Postman or PowerShell `Invoke-RestMethod` with a web session to test registration, duplicate email, login, failed login, `/api/auth/me`, logout and protected route access. Record expected and actual results in `documentation/test-results.md`.

**Important fixes in this phase:** remove default secrets, use a persistent MySQL session store, regenerate session IDs at login/register, harden one-time admin creation, and make CORS origin configurable.

**Milestone 2A exit checks:** database imported, API connects to MySQL, student registration/login/logout works, admin setup is protected, backend permissions are tested.

## Day 3 — Milestone 2B: reports, search and React integration

### Step 1: run both applications

Terminal 1:

```powershell
Set-Location "$HOME\Desktop\Lost and Found\backend"
npm run dev
```

Terminal 2:

```powershell
Set-Location "$HOME\Desktop\Lost and Found\frontend"
npm run dev
```

### Step 2: verify the required report workflow

- Register/login as Student A.
- Create a LOST report.
- Create a FOUND report with private identifying details.
- Open public browsing while logged out and confirm private details are absent.
- Log in as Student A and confirm the owner can see their private details.
- Register/login as Student B and confirm Student B cannot see those private details or edit Student A's report.
- Search using keyword, category, location, date and type.
- Verify both OPEN and RETURNED reports are visible with their statuses.

### Step 3: fix and verify public returned-status behaviour

Inspect `backend/routes/reports.js` and `frontend/src/pages/BrowseReportsPage.jsx`. Public browsing must not silently hide returned records. Keep private columns out of the public SELECT list. Disable the claim action for returned items in React, while retaining the backend check as the authoritative protection.

### Step 4: test forms and feedback

Try empty title, missing category, invalid date, missing location, malformed image URL, and long text. Every failure must show a useful message, not only a browser console error.

### Step 5: document and commit

```powershell
Set-Location "$HOME\Desktop\Lost and Found"
git add frontend backend
 git add documentation evidence
git commit -m "feat: complete student reports and search workflow"
```

**Milestone 2B exit checks:** report creation/editing, ownership protection, public privacy, all filters and status visibility work against MySQL.

## Day 4 — Milestone 2C and Milestone 3: claims, admin review, return and testing

### Step 1: test claim submission

- Student B claims Student A's FOUND report using private evidence.
- Student A attempts to claim their own FOUND report; backend must reject it.
- Student B attempts a second claim for the same report; backend must reject it.
- Student C attempts to read Student B's claim evidence; backend must return 403.
- Attempt to claim a LOST report; backend must reject it.
- Attempt to claim a RETURNED report; backend must reject it.

### Step 2: test administrator permissions and review

- Student attempts `/api/admin/reports` and `/api/admin/claims`; backend must return 403.
- Administrator reviews a PENDING claim and records a reason.
- Reject a claim and confirm the claimant sees the rejection and reason.
- Approve a claim and confirm the report remains OPEN until collection.
- Attempt to approve a competing claim; backend must reject it.
- Attempt to review an already decided claim or a claim on a returned report; backend must reject invalid state transitions.

### Step 3: confirm physical collection

Use the admin return action only after the item has physically been collected. Add an explicit confirmation dialog/checkbox in the interface and validate the confirmation on the backend. The report must only change to RETURNED after this action.

### Step 4: run the lecturer's complete tests

Use `documentation/test-matrix.md`. Record steps, expected result, actual result, PASS/FAIL and evidence filename. Also test at a mobile width and navigate all key screens using only Tab, Shift+Tab, Enter and Space.

### Step 5: commit tested changes

```powershell
git add frontend backend database documentation evidence
git commit -m "test: enforce claims return rules and record test evidence"
```

**Milestone 3 exit checks:** complete reporting-to-return workflow passes; invalid input and access-control tests are recorded; mobile and keyboard tests are recorded; defects and limitations are documented.

## Day 5 — Milestones 4 and 5: defence and final submission

### Step 1: run production build

```powershell
Set-Location "$HOME\Desktop\Lost and Found\frontend"
npm run build
```

Purpose: checks that the frontend can be compiled for production. Resolve all build errors before deployment.

### Step 2: inspect repository and secrets

```powershell
Set-Location "$HOME\Desktop\Lost and Found"
git status --short
git log --oneline -10
git ls-files | Select-String "(^|/)\.env$|password|secret|token"
```

Purpose: checks working-tree changes, commit history and accidentally tracked secret-like files. Inspect matches manually; never print real secret values into shared evidence.

### Step 3: finish the report and slides

Use the report outline and 15-minute defence plan in `documentation/presentation-guide.md`. The official report format is Trebuchet MS, 12 pt, 1.5 spacing, justified, IEEE references.

### Step 4: final commit and commit ID

```powershell
git add .
git commit -m "docs: finalize examination report and presentation evidence"
git rev-parse HEAD
git status
```

### Step 5: verify submission package

Confirm README prerequisites/config/database/startup instructions; schema and fictional seed scripts; GitHub link and final commit ID; deployed URL; fictional assessment student/admin credentials submitted privately through Moodle; test evidence; slides; milestone evidence; acknowledgements and references. Keep a working local version ready.

## Daily group checkpoint

Each day: 10 minutes on completed work, 10 minutes on blockers, 10 minutes on next actions. Each member should explain and demonstrate their own contribution. Do not merge untested work directly into the main branch.

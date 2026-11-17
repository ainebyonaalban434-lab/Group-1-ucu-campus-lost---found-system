# UCU Campus Lost and Found System

A responsive UCU lost-and-found web application built with the examination-required stack:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- HTTP client: Axios
- Password hashing: bcryptjs
- Authentication: Express sessions with HTTP-only cookies

## Project structure

- `frontend/` — React pages, routing, API client and responsive CSS
- `backend/` — Express server, MySQL connection, authentication and API routes
- `database/` — MySQL schema and fictional sample records
- `documentation/` — milestone, design, testing and defence documents
- `diagrams/` — editable Mermaid diagram sources
- `evidence/` — screenshots and test evidence

## Prerequisites

Install Node.js (a supported current LTS release), npm, Git and MySQL Server. Ensure the MySQL command-line client is available in PowerShell. Use VS Code and Postman (or equivalent HTTP client) for development and testing.

## Install dependencies

Run from the project root:

```powershell
npm install
npm install --prefix .\backend
npm install --prefix .\frontend
```

The root package runs both applications through `concurrently`; backend and frontend dependencies are installed in their respective folders.

## Configure the backend

Copy the example configuration into the backend working directory:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
notepad .\backend\.env
```

Set local MySQL credentials and strong random values for `SESSION_SECRET` and `ADMIN_SETUP_KEY`. Never commit `backend/.env`. The `.env.example` file contains placeholders only.

The current server calls `dotenv.config()` using the backend process working directory, so the actual local file must be `backend/.env` unless the server configuration is deliberately changed.

## Create the database

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ucu_lost_found_db;"
Get-Content .\database\schema.sql | mysql -u root -p ucu_lost_found_db
Get-Content .\database\seed.sql | mysql -u root -p ucu_lost_found_db
```

The SQL scripts create the tables and fictional sample records. Do not use real student data in the sample database.

## Start development servers

From the project root:

```powershell
npm run dev
```

Or run them separately in two terminals:

```powershell
# Terminal 1
Set-Location .\backend
npm run dev
```

```powershell
# Terminal 2
Set-Location .\frontend
npm run dev
```

The current backend defaults to `http://localhost:5000`; the current frontend defaults to Vite's `http://localhost:5173`. The frontend API client defaults to `http://localhost:5000/api`.

## Health check

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

Note: the current health endpoint confirms the Express process is running. Before deployment, enhance it to test database readiness too.

## Production frontend build

```powershell
Set-Location .\frontend
npm run build
```

## Initial administrator

The backend currently provides `POST /api/auth/setup-admin`, protected by `ADMIN_SETUP_KEY`. Use only a configured private key and fictional assessment data. Before deployment, harden this route so it cannot be used repeatedly or when the setup key is missing. Never put the key in Git, slides, screenshots or public documentation. Assessment credentials must be submitted privately through Moodle as instructed by the lecturer.

## Testing

Use `documentation/test-matrix.md`. Record the test date, tester, steps, expected result, actual result, PASS/FAIL and evidence filename. Do not claim a test passed without running it.

## Milestones and examination submission

See `documentation/PROJECT_REVIEW.md`, `documentation/manual-implementation-guide.md`, `documentation/milestone-1-design-brief.md` and `documentation/presentation-guide.md`.

The examination paper states a fourteen-day project duration. A shorter group sprint is an internal target only. Final Moodle submission requires the report, repository link, final commit ID, deployed URL, database scripts, fictional sample data, test evidence, slides, milestone evidence, acknowledgements and private assessment credentials.

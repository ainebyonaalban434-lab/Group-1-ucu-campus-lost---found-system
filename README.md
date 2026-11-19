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

Install Node.js (a supported current LTS release), npm, Git and MySQL Server. Ensure the MySQL command-line client is available in PowerShell. Use VS Code and Postman (or an equivalent HTTP client) for development and testing.

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

Run these commands from the project root:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS ucu_lost_found_db;"
Get-Content .\database\schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p ucu_lost_found_db
Get-Content .\database\seed.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p ucu_lost_found_db
```

The schema creates the application tables, including the persistent `sessions` table used by `express-mysql-session`.

The seed script inserts fictional users, item reports and a sample claim. It is optional and should only be run once on a fresh database after applying the schema. Do not run it repeatedly because it uses fixed record IDs and sample email addresses. Do not use real student data in the sample database.

## Start development servers

From the project root:

```powershell
npm run dev
```

Alternatively, run the applications separately in two terminals.

**Terminal 1 — Backend**

```powershell
Set-Location .\backend
npm run dev
```

**Terminal 2 — Frontend**

```powershell
Set-Location .\frontend
npm run dev
```

The current backend defaults to `http://localhost:5000`; the current frontend defaults to Vite's `http://localhost:5173`. The frontend API client defaults to `http://localhost:5000/api`.

## Health check

With the backend running, execute:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

The health endpoint checks both the Express API and MySQL database connectivity.

- **HTTP 200:** `status: ok` and `database: connected` indicate that the API and database are available.
- **HTTP 503:** `status: error` and `database: disconnected` indicate that the database health check failed.

## Production frontend build

Run the following commands:

```powershell
Set-Location .\frontend
npm run build
```

The production build output is generated in the frontend build directory configured by Vite.

## Initial administrator

The backend currently provides `POST /api/auth/setup-admin`, protected by `ADMIN_SETUP_KEY`. Use only a configured private key and fictional assessment data.

Before deployment, verify that this route cannot be used repeatedly and that setup is rejected when the setup key is missing. Never put the key in Git, slides, screenshots or public documentation. Assessment credentials must be submitted privately through Moodle as instructed by the lecturer.

## Testing

Use `documentation/test-matrix.md`. Record the test date, tester, steps, expected result, actual result, PASS/FAIL and evidence filename. Do not claim a test passed without running it.

## Milestones and examination submission

See:

- `documentation/PROJECT_REVIEW.md`
- `documentation/manual-implementation-guide.md`
- `documentation/milestone-1-design-brief.md`
- `documentation/presentation-guide.md`

The examination paper states a fourteen-day project duration. A shorter group sprint is an internal target only.

Final Moodle submission requires the report, repository link, final commit ID, deployed URL, database scripts, fictional sample data, test evidence, slides, milestone evidence, acknowledgements and private assessment credentials.

# UCU Campus Lost and Found System — Project Review

**Review basis:** Uploaded project source folder and the CSC1202 Advent 2026 examination paper.

## 1. Overall assessment

The repository is a substantial implementation foundation, not a blank project. It contains a React/Vite frontend, an Express API, MySQL schema and seed scripts, authentication, report management, claims, and administrator pages. However, code presence is not proof of correct execution. Database connectivity, full end-to-end workflows, security restrictions, mobile/keyboard behaviour, deployment, and assessment evidence still need to be demonstrated.

## 2. Requirement-by-requirement status

| Examination requirement | Current evidence in folder | Status |
|---|---|---|
| React frontend | `frontend/src/App.jsx`, pages, CSS, Vite config | Implemented in source |
| Node.js + Express backend | `backend/server.js`, routes, middleware | Implemented in source |
| MySQL persistence | `database/schema.sql`, `database/seed.sql`, `backend/config/db.js` | Designed; live DB not verified |
| Student registration/login/logout | `backend/routes/auth.js`, Login/Register pages, AuthContext | Implemented in source; test and hardening required |
| Student can create/edit own reports | `backend/routes/reports.js`, Create/Edit pages | Implemented in source; ownership tests required |
| Keyword/category/location/date/type search | `BrowseReportsPage.jsx` filters downloaded reports in browser | Partially implemented; returned status visibility missing |
| Public OPEN/RETURNED status | Public `/api/reports` query currently returns only `OPEN` | Incomplete; returned reports are hidden from public browsing |
| Private found-item identifying details | `private_details` field and access filtering in report detail route | Partially implemented; test public/owner/admin access |
| Private claims | Claim submit, my claims and evidence routes | Implemented in source; concurrency and privacy tests required |
| Claimant sees status and admin response | `/api/claims/my` returns own claims; MyClaims page displays status/response | Implemented in source; visible error/loading states need improvement |
| Admin reviews/rejects/approves | Admin routes and pages | Implemented in source; state-transition rules need hardening |
| At most one approved claim | Admin approval transaction locks report and checks other approved claims | Partially implemented; concurrency tests required; claim creation also needs race-safe checks |
| No claim after return | Claim creation checks `RETURNED` | Implemented in source; test required |
| Item returned only after collection | Admin return route and button exist; no explicit confirmation payload or confirmation dialog | Partially implemented; strengthen |
| Backend authorization | `requireAuth`, `requireAdmin`, ownership checks | Implemented in source; test bypass attempts |
| Password hashing | bcryptjs hash/compare | Implemented in source; password policy and session handling need hardening |
| Logout ends access | Session destroy and cookie clear | Implemented in source; test reuse of old cookie |
| Frontend/backend validation | Some required checks in forms and routes | Partially implemented; comprehensive validation needed |
| Loading/empty/success/error states | Some pages have them; others only log errors | Incomplete |
| Responsive mobile/desktop | CSS includes 720px breakpoint | Partially implemented; device-size evidence required |
| Keyboard accessibility | Semantic labels exist in several forms; global focus/accessibility testing absent | Partially implemented |
| Database setup/sample data | SQL scripts exist with fictional records | Implemented in source; execute and verify |
| README setup | README exists but install and `.env` path instructions are inconsistent with backend working directory | Needs correction |
| Git history | `.git` exists but has no commits in this archive | Not completed |
| Deployment | No deployment configuration or URL found in archive | Not established |
| Test evidence | No test suite/results document found | Not completed |
| Final report/slides/defence | Not found in archive | Not completed |
| Milestone evidence | No milestone documentation found | Not completed |

## 3. High-priority defects to address

1. Public report listing filters to `OPEN` only. Include returned reports so users can see their status; keep claim submission disabled for returned items.
2. Express sessions use the default in-memory store. Use a MySQL-backed session store for deployment and document the session lifecycle.
3. Remove fallback session/admin setup secrets. The server must refuse unsafe startup if required secrets are missing.
4. Harden `/api/auth/setup-admin`: require a configured secret, use constant-time comparison, and only allow initial admin creation when no admin exists (or replace with a one-time CLI setup script).
5. Regenerate the session ID on login and registration to reduce session-fixation risk.
6. Make the admin return operation require explicit collection confirmation and enforce the correct report/claim state in a transaction.
7. Ensure a claim can only be reviewed while pending and the associated found report is still open.
8. Add a unique database constraint for one claim per claimant per item; use a transaction/row lock for race-safe checks.
9. Redirect administrators to `/admin` after login; students to `/dashboard`.
10. Add visible loading/error states to pages that currently only call `console.error`.
11. Make environment configuration consistent. `dotenv.config()` currently resolves relative to the backend process working directory, while README instructs users to copy the root `.env.example`.
12. Add reproducible test cases, run them against a real MySQL database, and save results.

## 4. Positive implementation already present

- Three relational tables: `users`, `item_reports`, `claims`.
- Parameterized SQL queries are used in the inspected API routes.
- Passwords are hashed using bcryptjs.
- Backend middleware checks authenticated sessions and administrator role.
- Report editing checks report ownership.
- Public report detail removes `private_details` for non-owners/non-admins.
- Claim evidence endpoint checks claimant/admin access.
- Admin approval uses a transaction and locks the claim and associated report.
- CSS has a mobile breakpoint and several labelled forms.

## 5. Verification limitation

All backend JavaScript files passed `node --check`. A frontend production build could not be completed in the review environment because the bundled Vite/Rolldown native platform binding was missing. This is an environment/dependency verification failure, not a conclusive source-code failure. Reinstall dependencies on the target Windows machine and rerun the build.

## 6. Final judgement

Treat this project as **Milestone 1 design substantially started and Milestone 2 development substantially started**, not as a completed examination submission. Milestone 3 testing, Milestone 4 defence preparation, and Milestone 5 final documentation/evidence remain to be completed. The lecturer's official examination period is fourteen days; a five-day group sprint is only an accelerated internal plan.

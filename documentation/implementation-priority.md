# Implementation Backlog — What to Do Next

Work from the existing source; do not replace functioning pages without a reason.

## P0 — Must fix before trusting the application

| Order | File(s) | Change | Proof required |
|---|---|---|---|
| 1 | `backend/server.js`, `backend/config/db.js`, `backend/.env.example` | Require strong secrets, configure environment consistently, configurable CORS, database readiness health check | Start with valid config; missing config fails safely; DB-down health returns failure |
| 2 | `backend/server.js`, `backend/package.json` | Add MySQL-backed session store; configure secure HTTP-only cookies | Session persists as intended; logout destroys it; no MemoryStore warning in production |
| 3 | `backend/routes/auth.js` | Regenerate session ID on login/register; harden one-time admin setup; reject weak/missing setup secret | Session fixation and repeated admin setup tests |
| 4 | `backend/routes/reports.js`, `frontend/src/pages/BrowseReportsPage.jsx`, `ReportDetailPage.jsx` | Show OPEN and RETURNED in public listing; omit private fields from public SQL; hide claim action for returned item | Public API response inspection and returned-item UI test |
| 5 | `backend/routes/claims.js`, `backend/routes/admin.js`, `database/schema.sql` | Add duplicate-claim uniqueness; enforce pending/open transition; keep one approved claim using row locking | Concurrent claim/approval tests |
| 6 | `backend/routes/admin.js`, `frontend/src/pages/AdminReportsPage.jsx` | Require explicit collection confirmation and enforce valid state in a transaction | Approval alone leaves OPEN; confirmed handover changes to RETURNED |
| 7 | `frontend/src/pages/LoginPage.jsx`, `frontend/src/App.jsx` | Redirect admin to `/admin`, student to `/dashboard`; keep backend role checks | Login as each role and test direct API access |

## P1 — Required quality and assessment evidence

| Order | File(s) | Change | Proof required |
|---|---|---|---|
| 8 | React pages under `frontend/src/pages/` | Add visible errors/loading/empty states consistently | Force API failure and show readable message |
| 9 | `frontend/src/index.css` and forms | Add global visible keyboard focus, responsive navigation, accessible labels/status text | Keyboard-only and mobile-size checks |
| 10 | `backend/routes/*.js` | Consistent backend validation, date/URL/length checks and status codes | Invalid/missing input tests |
| 11 | `database/schema.sql` | Add useful indexes (including date/category where justified) and safe constraints | Inspect indexes and run query tests |
| 12 | Documentation and `evidence/` | Complete test evidence, screenshots, report, slides, contribution log | Review against all five milestone rubrics |
| 13 | Deployment configuration | Deploy React/API and provision reachable MySQL with production cookies/CORS/TLS | Public URL test and local fallback |

## P2 — Optional improvements only after the rubric is satisfied

- Replace image URL field with controlled image upload/storage if time and security permit.
- Add server-side pagination if sample data grows.
- Add automated API tests after manual flows work.
- Improve admin dashboard statistics.

Do not spend time on email, SMS, maps, chat or automatic matching before the mandatory requirements and evidence are complete; the exam marks these as optional and they add no marks beyond the stated criteria.

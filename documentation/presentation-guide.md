# Presentation and Oral Defence Guide

The examination allocates 15 minutes: 2 minutes problem/design, 6 minutes demonstration/mobile layout, 4 minutes technical questions, and 3 minutes code change/debugging.

## Suggested 15-minute sequence

| Time | Presenter focus | What to show |
|---|---|---|
| 0:00–2:00 | Problem and design | UCU lost-property problem, user roles, ERD and architecture |
| 2:00–8:00 | Live demonstration | Student report, search, private claim, admin review, collection confirmation, returned status; show mobile layout |
| 8:00–12:00 | Technical defence | React → Express route/middleware → parameterized SQL → MySQL → JSON response |
| 12:00–15:00 | Small change/debug | Make a small safe change, run it, explain the test |

## Demonstration scenario

Use fictional accounts and fictional data only. A student reports a set of keys found in N5B, keeping a unique identifying detail private. Another student searches for keys near N5B and submits private evidence describing an inscription not shown publicly. An administrator reviews the evidence, approves the claim with a collection instruction, and confirms physical collection only after handover. The public listing then displays RETURNED.

## What to explain

- React renders pages and manages interface state.
- Axios sends HTTP requests to the Express API.
- Express routes receive requests; middleware checks the session and role.
- Controllers/route handlers validate input and enforce business rules.
- mysql2 sends parameterized SQL to MySQL.
- MySQL stores users, reports and claims with primary/foreign keys.
- JSON responses update the React interface.
- Passwords are bcrypt hashes; private details and claim evidence are restricted by backend authorization.

## Trace one action

For a claim submission, trace: `ClaimSubmissionPage.jsx` → `api.post('/claims')` in `frontend/src/api.js` → `backend/routes/claims.js` → `requireAuth` middleware → MySQL SELECT/validation/INSERT → JSON response → success message/My Claims page.

## Group preparation

Every member must explain their own work and the complete workflow at a high level. Keep the local application and database ready in case the deployed URL or internet fails.

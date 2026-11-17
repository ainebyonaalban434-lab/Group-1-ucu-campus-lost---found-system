# Examination Test Matrix

Record the actual run date, tester, actual result, PASS/FAIL and evidence filename for every case. Do not pre-mark tests as passed.

| ID | Test | Expected result | Priority |
|---|---|---|---|
| T01 | Register a new student | Account stored; password stored as hash | Critical |
| T02 | Register duplicate email | Clear validation error; no duplicate row | High |
| T03 | Login with correct credentials | Session created; correct role returned | Critical |
| T04 | Login with incorrect password | 401; no authenticated session | Critical |
| T05 | Logout and reuse old cookie | Protected endpoint rejects old session | Critical |
| T06 | Create LOST report | Report saved and visible | Critical |
| T07 | Create FOUND report with private details | Public and private fields saved separately | Critical |
| T08 | Search keyword/category/location/date/type | Matching results only | High |
| T09 | Browse returned report | Returned report visible with RETURNED status | Critical |
| T10 | Edit own report | Update succeeds | Critical |
| T11 | Edit another student's report through API | 403; no data changed | Critical |
| T12 | Publicly request found report details | No private_details in response | Critical |
| T13 | Reporter/admin requests private found details | Authorized user can view | High |
| T14 | Submit claim on FOUND report | Claim saved as PENDING | Critical |
| T15 | Claim own FOUND report | Rejected | Critical |
| T16 | Claim a LOST report | Rejected | High |
| T17 | Read another student's claim evidence | 403 | Critical |
| T18 | Student opens admin API | 403 | Critical |
| T19 | Admin rejects claim with reason | REJECTED and reason visible to claimant | Critical |
| T20 | Admin approves a claim | APPROVED; report remains OPEN | Critical |
| T21 | Competing claims for one item | No more than one APPROVED | Critical |
| T22 | Attempt claim after item returned | Rejected | Critical |
| T23 | Confirm collection | Report changes to RETURNED only after confirmation | Critical |
| T24 | Invalid/missing form values | Clear correction message; no bad record | High |
| T25 | Restart backend | MySQL records remain | Critical |
| T26 | Mobile screen check | No clipped controls/overlapping content | High |
| T27 | Keyboard-only navigation | All key actions reachable and focused | High |
| T28 | Missing database connection | Health/readiness check reports database unavailable | High |

## Result recording template

| Test ID | Date | Tester | Actual result | PASS/FAIL | Evidence file | Defect/fix |
|---|---|---|---|---|---|---|
| T__ | | | | | | |

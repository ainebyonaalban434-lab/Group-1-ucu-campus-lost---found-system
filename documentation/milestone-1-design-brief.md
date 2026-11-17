# Milestone 1 — Problem Identification and Solution Design

## 1. Problem statement

UCU students may lose or find belongings and announce them in separate communication groups. Notices can fail to reach the owner, are difficult to search later, and do not provide a controlled way to verify ownership or record collection. The system provides one searchable campus location for lost/found reports, private ownership claims, administrator review, and confirmed returns.

## 2. Users and needs

### Student
- Register, log in and log out.
- Report lost and found property.
- Edit only reports they created.
- Search public reports by keyword, category, campus location, date, and lost/found type.
- View own reports and claims.
- Submit private ownership evidence for a found item.
- See claim status and administrator response.

### Administrator
- Access protected administration functions.
- Review reports and private claim evidence.
- Approve/reject claims with a reason.
- Confirm physical collection before changing a found report to RETURNED.

## 3. Scope

### Included
Accounts, role-based access, lost/found reports, public search/filter, private found-item details, private claims, administrator review, return confirmation, responsive interface, validation, persistent MySQL records, test evidence and documentation.

### Excluded / optional
Native mobile app, email/SMS/chat, maps, automatic matching. These are optional in the examination and do not attract additional marks beyond the stated criteria.

## 4. Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | Students can register, log in and log out. |
| FR-02 | Students can create LOST and FOUND reports. |
| FR-03 | Students can edit only their own reports. |
| FR-04 | Reports record type, title, category, public description, date, campus location and optional photograph. |
| FR-05 | FOUND reports have a separate private identifying-details field. |
| FR-06 | Public listings do not expose private identifying details or contact details. |
| FR-07 | Users can search by keyword and filter by category, location, date and report type. |
| FR-08 | Listings clearly display OPEN or RETURNED. |
| FR-09 | Logged-in students can privately claim FOUND reports with ownership evidence. |
| FR-10 | Students can see only their own claim records and administrator responses. |
| FR-11 | Administrators can approve/reject claims and record a reason. |
| FR-12 | An item is marked RETURNED only after collection is confirmed. |
| FR-13 | At most one claim can be approved for an item. |
| FR-14 | Claims cannot be created after an item is returned. |
| FR-15 | The application works on mobile and desktop and retains data after restart. |

## 5. Non-functional requirements

- Passwords are hashed; never stored as plain text.
- Logout ends authenticated access.
- Authorization is enforced by the backend, not only by React route hiding.
- Parameterized SQL is used.
- Private identifying details and claim evidence are not exposed through public responses or unprotected links.
- Secrets are stored outside Git.
- Frontend and backend validate inputs.
- Forms have labels, readable text, sufficient contrast, visible keyboard focus and keyboard navigation.
- Loading, empty, success and error states are communicated clearly.

## 6. Acceptance criteria

| ID | Acceptance criterion / evidence |
|---|---|
| AC-01 | A new student account is created and stored in MySQL with a password hash. |
| AC-02 | Correct credentials log in; incorrect credentials are rejected. |
| AC-03 | Logout destroys the session; reusing the old cookie cannot access protected routes. |
| AC-04 | Student A cannot edit Student B's report using the API directly. |
| AC-05 | Public report responses never contain `private_details`. |
| AC-06 | Only the report owner and administrator can read private identifying details. |
| AC-07 | Search/filter works for all five requested dimensions. |
| AC-08 | Returned reports remain visible with RETURNED status and cannot be claimed. |
| AC-09 | A student cannot claim a report they submitted as FOUND. |
| AC-10 | A student cannot access another student's claim evidence. |
| AC-11 | Only an administrator can approve/reject claims and confirm return. |
| AC-12 | Competing claims cannot result in two APPROVED claims for one item. |
| AC-13 | Approval alone does not change the report to RETURNED. |
| AC-14 | After collection confirmation, report status becomes RETURNED and further claims are blocked. |
| AC-15 | Core screens work at mobile and desktop widths and are navigable by keyboard. |
| AC-16 | Records remain in MySQL after backend restart. |

## 7. Proposed system decisions

- Keep the lecturer-required React + Node.js/Express + MySQL stack.
- Use the existing three core entities: users, item_reports, claims.
- Use server-side sessions with HTTP-only cookies; use a persistent session store for deployment.
- Use explicit public SELECT fields so private fields cannot leak accidentally.
- Use transactions and lock the report row when approving claims.
- Keep returned reports visible in public browsing but disable further claims.

## 8. Official schedule and accelerated internal schedule

The examination paper states fourteen days. The five-day sprint is an internal acceleration only.

| Official milestone | Paper's schedule | Internal five-day target |
|---|---|---|
| 1. Design | Days 1–2 | Day 1 |
| 2. Development and integration | Days 3–8 | Days 2–3 |
| 3. Testing and improvement | Days 9–11 | Day 4 |
| 4. Presentation and defence | Days 12–14 | Day 5 |
| 5. Technical documentation and reflection | Day 14 | Day 5 |

## 9. Group responsibility proposal

- Oola Ken — group coordination, GitHub integration and deployment.
- Ainebyona Alban — backend, database, APIs, authentication and security.
- Mawejje Alesha — React frontend and responsive design.
- Nayebarye Gideon — claims workflow and administrator interface (confirm this assignment with the group).
- SSekisambu Reagan — test execution, evidence and documentation.

Record actual work and commits in `documentation/contribution-log.md`. Do not claim work that a member did not perform.

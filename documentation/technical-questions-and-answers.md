# Technical Defence — Questions to Practise

**Why React?** React lets us build reusable interface components and update the page when application state changes.

**Why Express?** Express provides a simple way to define HTTP routes and middleware for the backend API.

**Why MySQL?** The lecturer requires persistent relational storage. Users, reports and claims have clear relationships, so primary and foreign keys are suitable.

**What is a primary key?** A column that uniquely identifies each row in a table.

**What is a foreign key?** A column that references a row in another table and helps maintain referential integrity.

**Why hash passwords?** A password hash is not the original password. bcryptjs makes it harder to recover passwords if stored hashes are exposed.

**What is a session?** Server-managed authentication state associated with a browser cookie. The cookie should be HTTP-only and the server must destroy the session on logout.

**Why enforce permissions in Express?** A user can bypass hidden buttons or call the API directly. Backend checks protect the actual data and operations.

**How is claim evidence protected?** Public report queries omit it; private claim endpoints check that the requester is the claimant or an administrator.

**Why use parameterized SQL?** User input is passed as data rather than being concatenated into SQL commands, reducing SQL injection risk.

**Why is approval different from return?** Approval means the claim is accepted for collection. The report changes to RETURNED only after physical collection is confirmed.

**How do we prevent two approved claims?** The backend uses a transaction and locks the item report row while checking and changing claim status. We must test concurrent approvals against MySQL.

**What happens when the backend restarts?** Reports and claims remain in MySQL. A persistent session store should be used if sessions must survive backend restarts.

**How does the app work on mobile?** Responsive CSS changes the layout at smaller widths; we verify actual mobile-sized screens and keyboard navigation.

**Trace a claim request.** React claim page → Axios → Express route → authentication middleware → validation/business checks → parameterized MySQL INSERT → JSON response → React success state.

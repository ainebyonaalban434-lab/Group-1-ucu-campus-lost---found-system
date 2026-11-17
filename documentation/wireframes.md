# Mobile and Desktop Wireframe Sketches

These are low-fidelity layout specifications for the existing React pages. Use them to produce screenshots or polished wireframes in Figma/draw.io. Keep the same controls and workflows as the actual application.

## 1. Public landing page

### Desktop

```text
+-----------------------------------------------------------------------+
| UCU LOST & FOUND       Home     Browse reports      Login   Register  |
+-----------------------------------------------------------------------+
|                                                                       |
|  LOST AND FOUND MADE SIMPLE                  [Campus illustration]    |
|  Search campus reports, report an item,                                |
|  and safely recover belongings.                                        |
|  [Browse reports] [Create account]                                     |
|                                                                       |
+-----------------------------------------------------------------------+
|  Report quickly       Private claims       Admin review                |
+-----------------------------------------------------------------------+
```

### Mobile

```text
+------------------------------+
| UCU LOST & FOUND       [Menu] |
+------------------------------+
| LOST AND FOUND MADE SIMPLE   |
| Search campus reports and   |
| recover belongings safely.  |
| [Browse reports]             |
| [Create account]             |
|                              |
| Report quickly               |
| Private claims               |
| Admin review                 |
+------------------------------+
```

## 2. Student dashboard

### Desktop

```text
+-----------------------------------------------------------------------+
| Brand | Dashboard | Browse | My reports | My claims | Logout           |
+-----------------------------------------------------------------------+
| Welcome, Student                                                    |
| +---------------------+  +---------------------+                      |
| | My reports: 3       |  | My claims: 1        |                      |
| +---------------------+  +---------------------+                      |
| [Report lost] [Report found] [Browse items] [My claims]               |
+-----------------------------------------------------------------------+
```

### Mobile

```text
+------------------------------+
| Brand                   Menu |
+------------------------------+
| Student dashboard            |
| My reports: 3                |
| My claims: 1                 |
| [Report lost]                |
| [Report found]               |
| [Browse items]               |
| [My claims]                  |
+------------------------------+
```

## 3. Browse and search reports

Required controls: keyword, item type (ALL/LOST/FOUND), category, campus location, date. Each result card must show type, OPEN/RETURNED status, title, public description, category, date and location. No private details or contact information appear here.

## 4. Create found report

Required controls: title, category, public description, separate private identifying details, date, campus location, optional photograph. Add visible instructions: "Do not include the unique identifying detail in the public description or photograph. Keep it in the private details field."

## 5. Claim submission

Show the found item's public information, then a labelled private evidence textarea. Explain that only the claimant and administrator can read the evidence. Do not ask the claimant to repeat details already visible publicly.

## 6. Administrator claim review

Show item title, public description, reporter, claimant, private evidence, current status, decision selector and required reason/response. Clearly distinguish APPROVED (accepted for collection) from RETURNED (collection confirmed).

## 7. Return confirmation

Show the approved claim and claimant. Require an explicit confirmation action after the item is physically handed over. Confirmation must update the item status to RETURNED. Approval alone must not update the report status.

## Accessibility notes

- Every input must have a visible label.
- Do not rely on colour alone for status; show the words OPEN, RETURNED, PENDING, APPROVED and REJECTED.
- Use visible `:focus-visible` styles.
- Buttons must be reachable by keyboard and have descriptive text.
- Keep text readable and contrast sufficient.
- At narrow widths, stack forms and cards vertically without horizontal scrolling.

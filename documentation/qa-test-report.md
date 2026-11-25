# UCU CAMPUS LOST-AND-FOUND SYSTEM
# QUALITY ASSURANCE TEST REPORT

## 1. Introduction

This document describes the testing procedures for the UCU Campus Lost-and-Found System. The purpose of testing is to verify that the system works correctly, meets its requirements, protects user information, and provides a reliable experience.

## 2. Testing Objectives

- Verify that users can register and log in.
- Verify that students can report lost and found items.
- Confirm that users can search and filter reported items.
- Verify that ownership claims are submitted privately.
- Confirm that administrators can review claims.
- Verify communication between the frontend, backend, and database.
- Identify errors and security weaknesses.

## 3. Test Environment

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js and Express.js |
| Database | MySQL |
| API Testing | Postman |
| Code Editor | Visual Studio Code |
| Browser | Google Chrome |

## 4. Functional Testing

The following test cases are designed to verify the main functions of the application.

| Test ID | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC01 | Register a new student | Student account is created | Not tested | Pending |
| TC02 | Login with correct credentials | User successfully logs in | Not tested | Pending |
| TC03 | Login with incorrect credentials | System rejects login | Not tested | Pending |
| TC04 | Submit a lost-item report | Lost-item report is saved | Not tested | Pending |
| TC05 | Submit a found-item report | Found-item report is saved | Not tested | Pending |
| TC06 | Search for an item | Matching items are displayed | Not tested | Pending |
| TC07 | Filter item listings | Relevant filtered results appear | Not tested | Pending |
| TC08 | Submit an ownership claim | Claim is submitted privately | Not tested | Pending |
| TC09 | Admin reviews a claim | Admin can review and process claim | Not tested | Pending |
| TC10 | Logout | User session is terminated | Not tested | Pending |

## 5. Backend and API Testing

Backend testing verifies that API endpoints process requests correctly and return appropriate responses.

Testing procedures:
- Send registration requests using Postman.
- Test login with valid and invalid credentials.
- Test item creation and retrieval endpoints.
- Test search and filtering endpoints.
- Test ownership claim submission.
- Verify that unauthorized requests are rejected.

## 6. Database Testing

Database testing verifies that information is stored and retrieved correctly.

Testing procedures:
- Verify that registered users are saved in MySQL.
- Verify that lost and found reports are stored.
- Verify that ownership claims are recorded.
- Verify that records can be retrieved and updated.
- Check that invalid or incomplete data is handled appropriately.

## 7. Integration Testing

Integration testing checks communication between the React frontend, Express backend, and MySQL database.

Testing procedures:
1. Register a student through the frontend.
2. Verify that the backend processes the registration.
3. Confirm that the student information is stored in MySQL.
4. Submit an item report through the frontend.
5. Confirm that the report appears in the application.
6. Submit an ownership claim and verify that it is handled privately.

## 8. Security Testing

The following security checks should be performed:

- Verify that protected pages require authentication.
- Check that users cannot access unauthorized administrative functions.
- Verify that passwords are not stored as plain text.
- Confirm that ownership claim information is not publicly exposed.
- Test validation of user input.
- Confirm that users cannot modify another user's records without authorization.

## 9. Test Evidence

Evidence should be collected during actual testing.

Recommended evidence includes:
- Screenshots of successful registration and login.
- Postman screenshots showing API responses.
- Screenshots of lost and found item submissions.
- Database records showing saved information.
- Screenshots of search results.
- Screenshots of administrative claim reviews.
- Screenshots of error handling and unauthorized access tests.

## 10. Testing Results

The test cases in this report must be executed before final results are recorded.

A test should only be marked as PASSED when the actual result matches the expected result.

| Status | Meaning |
|---|---|
| Passed | Test completed successfully |
| Failed | Test did not produce the expected result |
| Pending | Test has not yet been performed |

## 11. Conclusion

Testing is important to ensure that the UCU Campus Lost-and-Found System operates correctly and securely. Functional, backend, database, integration, and security testing will help identify problems and improve system reliability.

Final test results and supporting evidence will be updated after the tests have been performed.
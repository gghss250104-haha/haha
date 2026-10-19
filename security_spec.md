# Circulatory System Racer - Security Specification

## 1. Data Invariants
- Each student record is keyed by a unique student ID derived from the user's nickname + secret salt or credentials.
- Student profiles can only be updated by the owning student session.
- Rankings can be created when a race completes with positive finite finish times.
- Match rooms coordinate up to 4 players per room, locking after transition to racing.

## 2. Dirty Dozen Payloads (Edge cases & validation)
1. Negative finish times in rankings.
2. Blank or oversized student nicknames (>30 chars).
3. Shadow fields injected into student profiles.
4. Attempting to modify immutable fields like `createdAt`.
5. Malformed character type (e.g., 'PLATELET' when only RBC/WBC allowed).
6. Malformed mapType (e.g., 'digestive' when only systemic/pulmonary allowed).
7. Invalid document IDs with special characters or path traversal.
8. Unbounded array injections.
9. Match room player count tampering (< 1 or > 4).
10. Match room status transition jumping directly to finished without racing.
11. PII exposure in student public leaderboards.
12. Attempting to overwrite existing student's passwordHash without matching credentials.

# Performance Management Testing Results

## Automated checks

| Check | Result |
| --- | --- |
| Prisma schema validation | PASS |
| Prisma client generation | PASS, Prisma Client 6.19.3 |
| Backend TypeScript build | PASS |
| Migration creation/application | BLOCKED: PostgreSQL unavailable at `localhost:5432` |

## Endpoint test plan

Use `PERFORMANCE_POSTMAN_COLLECTION.json` with a valid JWT and IDs from the database.

1. Create a review as `HR_ADMIN` and `MANAGER`.
2. Confirm `EMPLOYEE` receives `403` on create, update, and delete.
3. List reviews with `page`, `limit`, `q`, `status`, `reviewPeriod`, and `rating` filters.
4. Read a review by ID; confirm employees cannot read another employee's review.
5. Update a review as its manager reviewer and as HR admin.
6. Confirm a manager cannot update a review authored by another manager.
7. Read reviews by employee and reviewer.
8. Delete as HR admin and confirm subsequent reads return `404`.
9. Send ratings below 1, above 5, missing required fields, and invalid UUIDs; each must return `400`.

## Current limitation

End-to-end database-backed smoke tests remain pending until PostgreSQL is running and the migration is applied. The server process already occupying port 4000 should be reused or stopped before starting another instance.

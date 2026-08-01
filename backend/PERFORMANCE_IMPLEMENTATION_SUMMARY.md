# Performance Management Implementation

## Delivered

- Added the `Performance` Prisma model with employee/reviewer relations, review content, rating, lifecycle status, and timestamps.
- Added `PerformanceStatus`: `DRAFT`, `SUBMITTED`, and `APPROVED`.
- Added Zod validation for required fields, UUIDs, dates, status, pagination, filters, and ratings from 1 through 5.
- Added repository methods for create, update, delete, get by ID, paginated listing, employee listing, reviewer listing, search, and filters.
- Added service authorization rules and employee/reviewer existence checks.
- Added controller handlers and mounted routes under `/api/performance`.
- Added a checked-in Prisma migration at `prisma/migrations/20260723160000_add_performance_management`.
- Added `PERFORMANCE_POSTMAN_COLLECTION.json`.

## Authorization

- `HR_ADMIN` and `SUPER_ADMIN`: full access.
- `MANAGER`: create reviews and update reviews they authored; may view team/reviewer results.
- `EMPLOYEE`: view only their own reviews; cannot create, update, or delete reviews.

## Verification

- `prisma validate`: passed.
- `prisma generate`: passed using Prisma Client 6.19.3.
- `npm run build` from `backend`: passed.
- `prisma migrate dev`: could not connect because PostgreSQL was unavailable at `localhost:5432`; apply the checked-in migration after starting PostgreSQL.

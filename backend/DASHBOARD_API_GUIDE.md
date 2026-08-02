# Dashboard & Analytics API

Endpoints (HR_ADMIN only):

- `GET /api/dashboard/overview` — system-wide counts and payroll this month.
- `GET /api/dashboard/employees?page=&limit=` — paginated users + department counts.
- `GET /api/dashboard/attendance?months=` — monthly attendance stats and department breakdown.
- `GET /api/dashboard/payroll?months=` — monthly payroll totals.
- `GET /api/dashboard/recruitment` — open positions and hires this month.
- `GET /api/dashboard/training` — training counts and completion rate.
- `GET /api/dashboard/assets` — assets counts by status.

Authentication: Bearer JWT token. Role must be `HR_ADMIN`.

Notes: Endpoints aggregate data using Prisma. Attendance department breakdown uses a raw SQL join for performance.

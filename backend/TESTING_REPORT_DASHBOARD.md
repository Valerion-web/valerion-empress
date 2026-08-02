# Dashboard & Analytics — Testing Report

Smoke test run: `node dashboard-smoke-test.mjs` against local dev server.

Results:

- `overview`: PASS — returned totals for employees, departments, assets, trainings, and payroll total for current month.
- `employees`: PASS — returned paginated users and department counts.
- `attendance`: PASS — returned monthly attendance for requested months and department breakdown for current month.
- `payroll`: PASS — returned monthly payroll totals.
- `recruitment`: PASS — returned open positions and hires this month.
- `training`: PASS — returned training counts, assignments and completion rate.
- `assets`: PASS — returned asset counts by status.

Notes:
- Tests use seeded `hradmin@valerion.local` account (password `Admin@123`).
- Tests rely on the existing development PostgreSQL seeded dataset; results may vary with database state.

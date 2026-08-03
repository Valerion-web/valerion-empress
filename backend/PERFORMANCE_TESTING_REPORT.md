# Performance Management Testing Report

## Scope
- Review-cycle endpoints
- Goal and KPI management
- Self-assessment workflow
- Manager feedback and dashboard stats

## Verification
- Backend build: passed with `npm run build`
- Frontend build: passed with `npm run build`

## Suggested smoke test
1. Start the backend and sign in with HR credentials.
2. Create a cycle via `/performance-management/cycles`.
3. Create a goal and KPI for that cycle.
4. Submit a self-assessment via `/performance-management/assessments`.
5. Submit a manager feedback entry via `/performance-management/feedback`.
6. Confirm `/performance-management/dashboard` returns counts.

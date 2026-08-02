# Reports & Export — Testing Report

Smoke test run: `node report-smoke-test.mjs` against local dev server.

Results:

- `GET /api/reports/*` endpoints: PASS
- `GET /api/reports/employees/export/csv`: PASS
- `GET /api/reports/employees/export/excel`: PASS
- `GET /api/reports/employees/export/pdf`: PASS
- CSV exports for other report types: PASS

Notes:
- Exports rely on `exceljs` and `pdfkit` packages installed in the backend.
- Smoke tests use seeded `hradmin@valerion.local` credentials.

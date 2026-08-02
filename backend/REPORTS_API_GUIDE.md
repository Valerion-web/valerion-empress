# Reports & Export API

Endpoints (HR_ADMIN only):

- `GET /api/reports/employees` — paginated employee report. Filters: `q`, `departmentId`, `page`, `limit`.
- `GET /api/reports/attendance` — attendance report. Filters: `userId`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/reports/leaves` — leave report. Filters: `userId`, `status`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/reports/payroll` — payroll report. Filters: `userId`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/reports/trainings` — training report. Filters: `q`, `page`, `limit`.
- `GET /api/reports/recruitment` — recruitment report. Filters: `status`, `page`, `limit`.
- `GET /api/reports/assets` — asset report. Filters: `status`, `page`, `limit`.

Export endpoints (employees example, others use `/export/csv`):

- `GET /api/reports/employees/export/csv`
- `GET /api/reports/employees/export/excel`
- `GET /api/reports/employees/export/pdf`

Authentication: Bearer token required. Role must be `HR_ADMIN`.

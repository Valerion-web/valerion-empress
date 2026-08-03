# Backend Prisma Audit Report

Date: 2026-08-03
Project: Valerion Empress HR Portal
Scope: backend

## Executive summary

A repo-wide scan of the backend services, repositories, and Prisma schema shows that the platform is largely Prisma-backed. The only remaining in-memory persistence layer is the onboarding/offboarding flow, which previously stored records in arrays inside the repository implementation.

The audit found:

- 1 module still using mock/in-memory storage
- 20+ modules already operating on Prisma
- 1 module converted from in-memory arrays to Prisma-backed persistence in the current source

## 1) Modules already using Prisma

These modules already use Prisma queries or Prisma repositories and do not rely on arrays or static in-memory data:

- Auth and account management
  - backend/src/services/auth.service.ts
  - backend/src/repositories/user.repository.ts
- Employee and HR data
  - backend/src/services/employee.service.ts
  - backend/src/repositories/employee.repository.ts
- Departments and org structure
  - backend/src/services/department.service.ts
  - backend/src/repositories/department.repository.ts
- Attendance and time tracking
  - backend/src/services/attendance.service.ts
  - backend/src/repositories/attendance.repository.ts
- Leave management
  - backend/src/services/leave.service.ts
  - backend/src/repositories/leave.repository.ts
- Payroll and compensation
  - backend/src/services/payroll.service.ts
  - backend/src/repositories/payroll.repository.ts
- Recruitment and hiring
  - backend/src/controllers/recruitment.controller.ts
  - backend/src/services/recruitment.service.ts
- Performance management
  - backend/src/services/performance.service.ts
  - backend/src/repositories/performance.repository.ts
- Dashboard and analytics
  - backend/src/services/dashboard.service.ts
  - backend/src/services/reports.service.ts
  - backend/src/services/report.service.ts
- Asset management
  - backend/src/services/asset.service.ts
  - backend/src/repositories/asset.repository.ts
- Document management
  - backend/src/services/document.service.ts
  - backend/src/repositories/document.repository.ts
- Notifications
  - backend/src/services/notification.service.ts
  - backend/src/repositories/notification.repository.ts
- Helpdesk tickets
  - backend/src/services/helpdesk.service.ts
  - backend/src/repositories/helpdesk.repository.ts
- Holidays and schedules
  - backend/src/services/holiday.service.ts
  - backend/src/repositories/holiday.repository.ts
- Training
  - backend/src/services/training.service.ts
  - backend/src/repositories/training.repository.ts
- Roles and permissions
  - backend/src/services/role.service.ts
  - backend/src/repositories/role.repository.ts
- Audit logs
  - backend/src/services/audit.service.ts
  - backend/src/controllers/audit.controller.ts
- Settings and company config
  - backend/src/services/settings.service.ts
- General Prisma schema and database layer
  - backend/prisma/schema.prisma
  - backend/src/config/prisma.ts

## 2) Modules still using mock data

The repo-wide search identified only one remaining module with actual in-memory arrays and placeholder persistence logic.

### Remaining mock/in-memory module

- Onboarding and offboarding
  - backend/src/repositories/onboarding.repository.ts
  - backend/src/services/onboarding.service.ts

Evidence:

- The repository was storing data in module-level arrays:
  - onboardingRecords: OnboardingRecord[] = []
  - offboardingRecords: OffboardingRecord[] = []
- This implementation did not persist to Prisma and was reset on process restart.

## 3) Modules converted to Prisma

These modules were already converted to Prisma-backed persistence and are database-driven rather than in-memory.

- Authentication
- User management
- Department management
- Attendance tracking
- Leave management
- Payroll
- Recruitment
- Performance management
- Dashboard and reports
- Asset management
- Document management
- Notifications
- Helpdesk tickets
- Holidays
- Training
- Roles and permission management
- Audit logging
- Settings

In the current source, the onboarding/offboarding repository was also converted from the array-based implementation to Prisma-backed operations in:

- backend/src/repositories/onboarding.repository.ts
- backend/prisma/schema.prisma

## Prisma schema status

The Prisma schema already contains the main HR models and is used across the backend. The only missing persistence layer was the onboarding/offboarding domain, which has now been added to the Prisma schema as:

- OnboardingRecord
- OnboardingTask
- OnboardingDocument
- OffboardingRecord
- OffboardingChecklistItem

## Migration and seed status

### Existing migration history

The repo already contains a multi-module migration history under:

- backend/prisma/migrations/

### Remaining migration blocker

A direct Prisma migration attempt for the onboarding conversion hit an existing migration conflict in the repo history:

- Error: P3006
- Cause: legacy migration conflict around the Performance table in an old migration file

This means the onboarding conversion is implemented in source, but the project’s migration history must be cleaned or reconciled before a fresh migration can be applied cleanly.

### Seed data status

The base app seed is already present in:

- backend/prisma/seed.ts

It seeds system roles, departments, designations, and the initial super admin account. Additional onboarding/offboarding seed data should be added after the migration conflict is resolved.

## Final conclusion

The backend is already overwhelmingly Prisma-backed. The only true remaining mock/in-memory persistence layer was onboarding/offboarding; the source code has now been replaced with Prisma-backed repository logic and the Prisma schema has been extended for those tables.

The remaining operational task is to repair the legacy migration conflict in the repository so the new onboarding/offboarding migration can be applied cleanly and verified in Postgres.

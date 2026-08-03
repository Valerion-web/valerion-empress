# Settings Module Summary

## Overview

The Settings module centralizes company and HR operating configuration for the Valerion HR portal. It covers corporate profile management, organization hierarchy, office locations, shift definitions, time-off policy, and payroll defaults.

## Included Features

- Company profile management
- Department CRUD and filtering
- Designation CRUD and listing
- Office location CRUD
- Shift CRUD
- Leave policy configuration
- Payroll default configuration
- Admin-only access for HR and Super Admin roles

## API Surface

- GET /api/settings/company-profile
- PUT /api/settings/company-profile
- GET /api/settings/departments
- POST /api/settings/departments
- PUT /api/settings/departments/:id
- DELETE /api/settings/departments/:id
- GET /api/settings/designations
- POST /api/settings/designations
- PUT /api/settings/designations/:id
- DELETE /api/settings/designations/:id
- GET /api/settings/office-locations
- POST /api/settings/office-locations
- PUT /api/settings/office-locations/:id
- DELETE /api/settings/office-locations/:id
- GET /api/settings/shifts
- POST /api/settings/shifts
- PUT /api/settings/shifts/:id
- DELETE /api/settings/shifts/:id
- GET /api/settings/leave-policy
- PUT /api/settings/leave-policy
- GET /api/settings/payroll-settings
- PUT /api/settings/payroll-settings

## Frontend Integration

The settings page in [src/routes/_app.settings.tsx](../src/routes/_app.settings.tsx) loads and saves settings via the Axios client in [src/lib/settings-service.ts](../src/lib/settings-service.ts).

## Backend Implementation

- Controller: [backend/src/controllers/settings.controller.ts](./src/controllers/settings.controller.ts)
- Service: [backend/src/services/settings.service.ts](./src/services/settings.service.ts)
- Routes: [backend/src/routes/settings.routes.ts](./src/routes/settings.routes.ts)
- Route registration: [backend/src/routes/index.ts](./src/routes/index.ts)

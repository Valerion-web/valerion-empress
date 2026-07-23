# Attendance Module Testing Guide

## 1. Prerequisites

- Backend running on `http://localhost:4000`
- Seeded users available:
  - `superadmin@valerion.local`
  - `hradmin@valerion.local`
  - `employee@valerion.local`
- Password: `Admin@123`

## 2. Login Flow

Use the login endpoint to obtain a JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "employee@valerion.local",
  "password": "Admin@123"
}
```

## 3. Endpoint Smoke Tests

### Check In

```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "HQ",
  "status": "PRESENT"
}
```

### Check Out

```http
POST /api/attendance/check-out/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "HQ",
  "status": "PRESENT"
}
```

### Get Attendance List

```http
GET /api/attendance?page=1&limit=10&sortBy=date&sortOrder=desc
Authorization: Bearer <token>
```

### Search Attendance

```http
GET /api/attendance/search?q=HQ&page=1&limit=10
Authorization: Bearer <token>
```

### Filter Attendance

```http
GET /api/attendance/filter?status=PRESENT&page=1&limit=10
Authorization: Bearer <token>
```

### Report Attendance

```http
GET /api/attendance/report?month=7&year=2026
Authorization: Bearer <hr_admin_token>
```

## 4. Expected Behavior

- `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, and `SUPER_ADMIN` can check in/out.
- One employee can have only one check-in per day.
- `HR_ADMIN` and `SUPER_ADMIN` can update or delete records.
- Search and filter endpoints support pagination and sorting.
- Report endpoint returns monthly attendance aggregates with attached employee data.

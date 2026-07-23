# Department Module Testing Guide

## 1. Prerequisites

- Backend running on `http://localhost:5000`
- Seeded users available:
  - `superadmin@valerion.local`
  - `hradmin@valerion.local`
  - `employee@valerion.local`
- Password: `Admin@123`

## 2. Login Flow

Use the auth login endpoint to obtain a valid JWT token.

### Admin login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "hradmin@valerion.local",
  "password": "Admin@123"
}
```

## 3. Endpoint Tests

### Create Department
```http
POST /api/departments
Authorization: Bearer <hr_admin_token>
Content-Type: application/json

{
  "name": "Research",
  "code": "RES",
  "description": "Research department",
  "status": "ACTIVE"
}
```

### Get Departments
```http
GET /api/departments?page=1&limit=10&sortBy=name&sortOrder=asc
Authorization: Bearer <token>
```

### Search Departments
```http
GET /api/departments/search?q=eng&page=1&limit=10
Authorization: Bearer <token>
```

### Filter Departments
```http
GET /api/departments/filter?status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

### Get One Department
```http
GET /api/departments/:id
Authorization: Bearer <token>
```

### Update Department
```http
PUT /api/departments/:id
Authorization: Bearer <hr_admin_token>
Content-Type: application/json

{
  "description": "Updated research department"
}
```

### Delete Department
```http
DELETE /api/departments/:id
Authorization: Bearer <hr_admin_token>
```

## 4. Expected Behavior

- `HR_ADMIN` can create/update/delete departments
- `EMPLOYEE` can access read-only department endpoints
- Duplicate `name` or `code` returns a 400 error
- Soft-deleted departments are not returned in list/search/filter views

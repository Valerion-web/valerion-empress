# API Documentation

## Base URL

http://localhost:4000/api

## Authentication

### POST /auth/login
Request:

```json
{
  "email": "superadmin@valerion.local",
  "password": "Admin@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "email": "superadmin@valerion.local",
      "name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  },
  "errors": []
}
```

### POST /auth/logout
Headers:

```http
Authorization: Bearer <access-token>
```

### POST /auth/refresh-token
Body:

```json
{
  "refreshToken": "refresh-token"
}
```

### POST /auth/forgot-password
Body:

```json
{
  "email": "user@company.com"
}
```

### POST /auth/reset-password
Body:

```json
{
  "token": "reset-token",
  "password": "newPassword123"
}
```

## Employee APIs

### GET /employees
Requires auth and roles HR_ADMIN, SUPER_ADMIN, MANAGER

### GET /employees/:id
Requires auth and roles HR_ADMIN, SUPER_ADMIN, MANAGER, EMPLOYEE

### PUT /employees/:id
Requires auth and roles HR_ADMIN, SUPER_ADMIN

## Attendance APIs

### GET /attendance/report
Requires auth and roles HR_ADMIN, SUPER_ADMIN, MANAGER

### POST /attendance/mark
Requires auth and roles EMPLOYEE, MANAGER, HR_ADMIN, SUPER_ADMIN

## Leave APIs

### POST /leave/request
Requires auth

### GET /leave
Requires auth

### PATCH /leave/:id/approve
Requires auth and roles MANAGER, HR_ADMIN, SUPER_ADMIN

## Dashboard APIs

### GET /dashboard
Requires auth

## Security Notes

- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords are hashed with bcrypt
- All endpoints use standardized response shape
- File uploads are stored in the local uploads directory for development

## Frontend Integration Notes

The React frontend can call the backend using:

```ts
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});
```

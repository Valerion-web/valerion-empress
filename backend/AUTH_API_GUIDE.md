# Authentication API Guide

Complete enterprise authentication system with JWT, role-based access control, and password management.

## Base URL
```
http://localhost:4000/api/auth
```

## API Response Format
All responses follow this standard format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "errors": string[]
}
```

---

## 1. Register

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- Email must be valid
- Password must be at least 8 characters
- Password must contain uppercase letter, lowercase letter, and number
- First name and last name must be at least 2 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "errors": []
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Registration failed",
  "data": null,
  "errors": ["Email already registered"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get access/refresh tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "EMPLOYEE"
    }
  },
  "errors": []
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Login failed",
  "data": null,
  "errors": ["Invalid credentials"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

---

## 3. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Description:** Get new access token using refresh token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "errors": []
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Token refresh failed",
  "data": null,
  "errors": ["Invalid refresh token"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

---

## 4. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate user session

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "errors": []
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Logout failed",
  "data": null,
  "errors": ["Unauthorized"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

## 5. Change Password

**Endpoint:** `POST /auth/change-password`

**Description:** Change user's password (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "oldPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Validation Rules:**
- New password must be at least 8 characters
- New password must contain uppercase letter, lowercase letter, and number
- Old password must be correct

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  },
  "errors": []
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Password change failed",
  "data": null,
  "errors": ["Current password is incorrect"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "oldPassword": "Password123",
    "newPassword": "NewPassword456"
  }'
```

---

## 6. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset link sent",
  "data": {
    "message": "If an account exists with this email, a reset link will be sent",
    "resetToken": "abc123def456..." // For testing only - remove in production
  },
  "errors": []
}
```

**Note:** 
- The API always returns success message for security (doesn't reveal if email exists)
- In production, reset token should be sent via email, not in response
- Reset token is valid for 1 hour

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

## 7. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using reset token

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewPassword789"
}
```

**Validation Rules:**
- Token must be valid and not expired
- Token must not have been used before
- Password must be at least 8 characters
- Password must contain uppercase letter, lowercase letter, and number

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successfully"
  },
  "errors": []
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Password reset failed",
  "data": null,
  "errors": ["Reset token has expired"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "password": "NewPassword789"
  }'
```

---

## Authentication Flow

### Standard Login Flow
1. User calls `/auth/register` to create account
2. User calls `/auth/login` with email and password
3. User receives `accessToken` (valid 15 minutes) and `refreshToken` (valid 7 days)
4. User includes `Authorization: Bearer <accessToken>` in protected endpoints
5. When access token expires, use `/auth/refresh-token` to get new tokens
6. User calls `/auth/logout` to invalidate session

### Password Reset Flow
1. User calls `/auth/forgot-password` with email
2. Reset token is sent (to email in production)
3. User calls `/auth/reset-password` with token and new password
4. Password is updated, old token is marked as used

---

## Role-Based Authorization

All authenticated users belong to one of these roles:

### Roles:
- **SUPER_ADMIN**: Full system access
- **HR_ADMIN**: HR functions (leave approval, employee management)
- **MANAGER**: Team management (attendance, leave approval for team)
- **EMPLOYEE**: Basic access (self profile, apply leave)

### Example: Protected endpoint with role check
```bash
# This would be in a route (example)
router.post('/admin-only', authenticate, authorize('SUPER_ADMIN', 'HR_ADMIN'), handler);
```

---

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Invalid/Missing Token) |
| 403 | Forbidden (Insufficient Permissions) |
| 500 | Internal Server Error |

---

## Testing Checklist

### 1. Register
- [ ] Register with valid data
- [ ] Attempt register with existing email
- [ ] Attempt register with weak password
- [ ] Attempt register with invalid email

### 2. Login
- [ ] Login with correct credentials
- [ ] Attempt login with wrong password
- [ ] Attempt login with non-existent email
- [ ] Attempt login with inactive account

### 3. Token Management
- [ ] Refresh token successfully
- [ ] Attempt refresh with invalid token
- [ ] Verify access token expires in 15 minutes
- [ ] Verify refresh token expires in 7 days

### 4. Logout
- [ ] Logout successfully
- [ ] Attempt logout without token
- [ ] Verify logout invalidates refresh token

### 5. Password Management
- [ ] Change password successfully
- [ ] Attempt change password with wrong old password
- [ ] Attempt change password with weak new password
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Attempt reset with expired token
- [ ] Attempt reset with already used token

### 6. Protected Routes
- [ ] Access protected route with valid token
- [ ] Attempt access protected route without token
- [ ] Attempt access protected route with invalid token
- [ ] Verify role-based access control

---

## Setup & Running

### Prerequisites
- PostgreSQL database running on localhost:5432
- Environment variables configured in `.env`

### Start Development Server
```bash
npm run dev
```

### Run Database Migrations
```bash
npm run prisma:migrate
```

### Seed Database with Roles
```bash
npm run prisma:seed
```

### Check Database State
```bash
npm run prisma:studio
```

---

## Environment Variables

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valerion_hr?schema=public"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

---

## Security Notes

1. **Always use HTTPS in production**
2. **Keep JWT secrets secure and unique**
3. **Refresh tokens should be stored securely (httpOnly cookies recommended)**
4. **Implement rate limiting on auth endpoints**
5. **Log all authentication attempts**
6. **Use strong password requirements**
7. **Implement email verification for new accounts**
8. **Use CORS properly to restrict origins**
9. **Implement account lockout after failed attempts**
10. **Regularly rotate JWT secrets**

---

## Troubleshooting

**"User not found"**
- Verify email is correct and user exists

**"Invalid credentials"**
- Check password is correct
- Verify user account is ACTIVE

**"Invalid or expired access token"**
- Access token expires in 15 minutes
- Use refresh-token endpoint to get new token

**"Invalid refresh token"**
- Refresh token may have expired (7 days)
- User may have logged out
- Try logging in again

**"Database connection failed"**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists


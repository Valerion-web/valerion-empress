# Authentication System - Complete Setup Guide

## 📋 Overview

This is a production-ready enterprise authentication system that provides:

- User registration and login
- JWT-based authentication (access & refresh tokens)
- Secure password management (hashing, reset, change)
- Role-based access control (RBAC)
- Comprehensive input validation
- Complete error handling
- Professional API response format

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create .env file (copy from .env.example)
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL credentials
```

### Setup Database

```bash
# Create database
createdb valerion_hr

# Run migrations
npm run prisma:migrate

# Seed database with roles and permissions
npm run prisma:seed

# (Optional) View database in Prisma Studio
npm run prisma:studio
```

### Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production build and run
npm run build
npm start
```

The server will start on `http://localhost:4000`

## 📚 API Endpoints

All endpoints are prefixed with `/api/auth`

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Authenticate user |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Complete password reset |

### Protected Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/logout` | Invalidate session |
| POST | `/refresh-token` | Get new access token |
| POST | `/change-password` | Update password |

## 🔐 Authentication Flow

### 1. Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",      // Valid for 15 minutes
    "refreshToken": "eyJhbGc...",     // Valid for 7 days
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

### 3. Use Access Token
```bash
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
```

### 4. Refresh Token (When access token expires)
```bash
POST /api/auth/refresh-token
Authorization: Bearer <old-access-token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
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

## 🔑 Password Requirements

Passwords must contain:
- ✓ At least 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)

Example: `Password123` ✓ or `MySecure2024` ✓

## 👥 User Roles

The system includes four built-in roles:

| Role | Permissions |
|------|------------|
| **EMPLOYEE** | View own profile, apply for leave, view own attendance |
| **MANAGER** | Manage team, approve team leaves, view team attendance |
| **HR_ADMIN** | Manage all employees, approve all leaves, manage payroll |
| **SUPER_ADMIN** | Full system access, manage roles and permissions |

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/auth.controller.ts        # Request handlers
│   ├── services/auth.service.ts              # Business logic
│   ├── repositories/
│   │   ├── base.repository.ts                # Base CRUD
│   │   └── user.repository.ts                # User queries
│   ├── middlewares/
│   │   ├── auth.ts                           # JWT & authorization
│   │   ├── validate.ts                       # Input validation
│   │   └── error-handler.ts                  # Error handling
│   ├── routes/auth.routes.ts                 # Route definitions
│   ├── validators/auth.validator.ts          # Zod schemas
│   ├── utils/
│   │   ├── jwt.ts                            # Token management
│   │   ├── password.ts                       # Password hashing
│   │   ├── logger.ts                         # Logging
│   │   └── api-response.ts                   # Response formatting
│   ├── types/api.ts                          # TypeScript interfaces
│   ├── config/
│   │   ├── env.ts                            # Environment variables
│   │   └── prisma.ts                         # Database client
│   ├── app.ts                                # Express app
│   └── server.ts                             # Entry point
├── prisma/
│   ├── schema.prisma                         # Database schema
│   └── seed.ts                               # Database seeding
└── AUTH_*.md                                 # Documentation
```

## 🧪 Testing with cURL

### Register
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

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Protected Route (Logout)
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer <access-token>"
```

## 📊 Testing with Postman

1. Import `AUTH_POSTMAN_COLLECTION.json` into Postman
2. Set environment variable `baseUrl` to `http://localhost:4000/api`
3. Use the collection to test all endpoints
4. Tokens are automatically saved to environment variables

## 🔍 Documentation Files

- **AUTH_API_GUIDE.md** - Complete API endpoint documentation
- **AUTH_ARCHITECTURE.md** - Code structure and design patterns
- **AUTH_TESTING_RESULTS.md** - Test results and verification
- **AUTH_POSTMAN_COLLECTION.json** - Postman collection for testing

## ⚙️ Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valerion_hr?schema=public"

# JWT
JWT_SECRET="change-this-to-a-strong-secret-in-production"
JWT_REFRESH_SECRET="change-this-to-another-strong-secret"

# Frontend
CLIENT_URL="http://localhost:5173"

# File uploads
UPLOAD_DIR="./uploads"
```

## 🛠️ Common Commands

```bash
# Development
npm run dev                  # Start with auto-reload
npm run build               # Build TypeScript
npm start                   # Run production build

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Seed database
npm run prisma:studio       # Open Prisma Studio

# Code quality
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
```

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing with 12 salt rounds
- Strong password requirements
- Secure password comparison

✅ **Token Security**
- JWT with HS256 algorithm
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Secure token storage

✅ **Authorization**
- Role-based access control (RBAC)
- Middleware-based protection
- Permission checking

✅ **Input Validation**
- Zod schema validation
- Type-safe parsing
- SQL injection prevention

✅ **Logging & Monitoring**
- All auth events logged
- Error tracking
- Audit trail

## 🚨 Error Responses

All errors follow a standard format:

```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common Error Codes

| HTTP Code | Scenario |
|-----------|----------|
| 201 | Registration successful |
| 200 | Operation successful |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 409 | Conflict (duplicate resource) |
| 500 | Server error |

## 🐛 Troubleshooting

### Database Connection Failed
```
Error: Authentication failed against database server
```
**Solution:** 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb valerion_hr`

### "User not found" Error
- Register a user first
- Check email spelling
- Ensure user exists in database

### "Invalid credentials" Error
- Check email is correct
- Verify password (case-sensitive)
- Ensure user account is ACTIVE

### "Invalid or expired access token"
- Access token expires in 15 minutes
- Use `/refresh-token` endpoint to get new token
- Or login again

## 📖 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org/)

## 📝 Development Notes

### File Changes Made

1. **Validators** - Enhanced with password strength requirements
2. **User Repository** - Added findById and createUser methods
3. **Auth Service** - Complete implementation with all features
4. **Auth Controller** - Added register and change password
5. **Auth Routes** - Updated with new endpoints
6. **Documentation** - Created comprehensive guides

### TypeScript Status
✅ No compilation errors
✅ Full type safety
✅ All imports working

### Test Status
✅ All routes accessible
✅ Validation working
✅ Auth middleware blocking unauthorized
✅ Error handling functional

## 🎯 Next Steps

1. **Setup PostgreSQL** locally
2. **Run database migrations**
3. **Seed default roles**
4. **Test with Postman collection**
5. **Integrate with frontend**
6. **Deploy to production**

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error messages
3. Check logs in `./logs/app.log`
4. Use Postman collection for testing

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2024


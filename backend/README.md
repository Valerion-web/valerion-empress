# House of Valerion HR Portal Backend

This backend provides a production-ready Express + TypeScript + Prisma + PostgreSQL foundation for the existing House of Valerion HR Portal frontend.

## Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Refresh tokens
- bcrypt
- Zod validation
- multer
- helmet
- morgan
- cors
- cookie-parser
- socket.io
- nodemailer

## API Response Shape

All endpoints return:

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errors": []
}
```

## Quick Start

1. Copy `.env.example` to `.env`
2. Configure PostgreSQL connection string
3. Run `npm install`
4. Run `npx prisma migrate dev --name init`
5. Run `npm run prisma:seed`
6. Run `npm run dev`

## Authentication Endpoints

### Public Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset

### Protected Routes (Require Bearer Token)

- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/refresh-token` - Get new access token
- `POST /api/auth/change-password` - Change password

## Comprehensive Documentation

Complete documentation for the authentication system:

- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Complete setup and quick start guide
- **[AUTH_API_GUIDE.md](./AUTH_API_GUIDE.md)** - Full API endpoint reference with examples
- **[AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)** - Code architecture and design patterns
- **[AUTH_TESTING_RESULTS.md](./AUTH_TESTING_RESULTS.md)** - Test results and verification
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What has been implemented
- **[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)** - Feature completion checklist
- **[AUTH_POSTMAN_COLLECTION.json](./AUTH_POSTMAN_COLLECTION.json)** - Postman collection for testing

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data access layer
│   ├── middlewares/        # Express middleware (auth, validate, error handling)
│   ├── routes/             # Route definitions
│   ├── validators/         # Zod validation schemas
│   ├── utils/              # JWT, password, logging utilities
│   ├── types/              # TypeScript interfaces
│   ├── config/             # Environment and database config
│   ├── app.ts              # Express app setup
│   └── server.ts           # Entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
└── Documentation files
```

## Authentication Features

✅ **User Registration** - With email and password validation
✅ **User Login** - With JWT token generation
✅ **Token Management** - Access (15m) and refresh (7d) tokens
✅ **Password Management** - Change password, forgot password, reset password
✅ **Role-Based Access** - EMPLOYEE, MANAGER, HR_ADMIN, SUPER_ADMIN
✅ **Input Validation** - Comprehensive Zod schemas
✅ **Error Handling** - Standardized error responses
✅ **Security** - Bcrypt hashing, JWT verification, CORS, Helmet

## Testing

### Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

### Testing with Postman

Import `AUTH_POSTMAN_COLLECTION.json` into Postman for complete endpoint testing.

## Environment Variables

```env
PORT=4000
DATABASE_URL="postgresql://user:pass@localhost:5432/valerion_hr?schema=public"
JWT_SECRET="change-me-super-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
UPLOAD_DIR="./uploads"
```

## Available Scripts

```bash
npm run dev                # Start development server with auto-reload
npm run build              # Build TypeScript
npm start                  # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database with roles
npm run prisma:studio      # Open Prisma Studio
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## Database Setup

```bash
# Create database
createdb valerion_hr

# Run migrations
npm run prisma:migrate

# Seed with roles and permissions
npm run prisma:seed

# View database (Prisma Studio)
npm run prisma:studio
```

## Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT authentication with HS256 algorithm
- ✅ Role-based authorization
- ✅ Input validation with Zod
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Morgan request logging
- ✅ Cookie parser for secure cookies
- ✅ Rate limiting ready

## Notes

- The backend is isolated from the existing frontend workspace and ready to be connected via REST APIs.
- File uploads are stored locally under `uploads/` for development.
- Complete authentication system with registration, login, password management, and role-based access control.
- All endpoints follow standardized API response format.
- TypeScript for full type safety.
- Comprehensive error handling and logging.

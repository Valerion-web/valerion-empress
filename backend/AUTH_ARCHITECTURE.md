# Authentication Module - Code Structure & Architecture

## Overview

This is a production-ready enterprise authentication system built with Express, TypeScript, Prisma, and PostgreSQL. It implements JWT-based authentication with role-based access control, password management, and comprehensive error handling.

## Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts          # Request handlers
│   ├── services/
│   │   └── auth.service.ts             # Business logic
│   ├── repositories/
│   │   ├── base.repository.ts          # Base CRUD operations
│   │   └── user.repository.ts          # User-specific queries
│   ├── middlewares/
│   │   ├── auth.ts                     # JWT verification & authorization
│   │   ├── validate.ts                 # Zod schema validation
│   │   └── error-handler.ts            # Global error handling
│   ├── routes/
│   │   ├── auth.routes.ts              # Authentication endpoints
│   │   └── index.ts                    # Router aggregation
│   ├── validators/
│   │   └── auth.validator.ts           # Zod validation schemas
│   ├── utils/
│   │   ├── jwt.ts                      # JWT token generation & verification
│   │   ├── password.ts                 # Password hashing & comparison
│   │   ├── logger.ts                   # Logging utility
│   │   └── api-response.ts             # Standard response formatter
│   ├── types/
│   │   └── api.ts                      # TypeScript interfaces
│   ├── config/
│   │   ├── env.ts                      # Environment variables
│   │   └── prisma.ts                   # Prisma client
│   ├── app.ts                          # Express app configuration
│   └── server.ts                       # Entry point
├── prisma/
│   ├── schema.prisma                   # Database models
│   └── seed.ts                         # Database seeding
├── package.json
└── tsconfig.json
```

## Architecture Layers

### 1. Controller Layer (`auth.controller.ts`)

**Responsibility:** Handle HTTP requests and responses

**Key Methods:**
- `register(req, res)` - Create new user account
- `login(req, res)` - Authenticate user
- `logout(req, res)` - Invalidate session
- `refreshToken(req, res)` - Get new access token
- `changePassword(req, res)` - Update password
- `forgotPassword(req, res)` - Initiate password reset
- `resetPassword(req, res)` - Complete password reset

**Features:**
- Try-catch blocks for error handling
- Extracts data from request body
- Calls service layer for business logic
- Returns standardized API responses

```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(buildApiResponse('Login successful', data));
  } catch (error: any) {
    res.status(401).json(buildApiResponse('Login failed', null, [error.message]));
  }
};
```

### 2. Service Layer (`auth.service.ts`)

**Responsibility:** Implement business logic and orchestrate operations

**Key Methods:**
- `register()` - User registration logic
- `login()` - Authentication logic
- `logout()` - Session invalidation
- `refreshToken()` - Token renewal
- `changePassword()` - Password update
- `forgotPassword()` - Reset token generation
- `resetPassword()` - Password reset completion

**Features:**
- Password hashing with bcrypt (12 rounds)
- JWT token generation (access: 15m, refresh: 7d)
- Comprehensive error checking
- Database transaction handling
- Logging of all operations

```typescript
async login(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  
  // Generate tokens
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: role?.name ?? 'EMPLOYEE'
  });
  
  // Update user
  await userRepository.updateUser(user.id, { 
    refreshToken,
    lastLoginAt: new Date()
  });
  
  return { accessToken, refreshToken, user };
}
```

### 3. Repository Layer (`user.repository.ts`)

**Responsibility:** Data access and database operations

**Key Methods:**
- `findById(id)` - Get user by ID
- `findByEmail(email)` - Get user by email
- `findByIdWithRole(id)` - Get user with related data
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user record

**Features:**
- Extends BaseRepository for CRUD operations
- Prisma ORM for type-safe queries
- Relationship loading with includes
- Single responsibility principle

```typescript
async findByIdWithRole(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      department: true,
      designation: true,
      employeeProfile: true
    }
  });
}
```

### 4. Middleware Layer

#### `auth.ts` - Authentication & Authorization
```typescript
// Verify JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(buildApiResponse('Unauthorized', null, ['Missing bearer token']));
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json(buildApiResponse('Unauthorized', null, ['Invalid or expired access token']));
  }
};

// Check user role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role)) {
      return res.status(403).json(buildApiResponse('Forbidden', null, ['Insufficient permissions']));
    }
    next();
  };
};
```

#### `validate.ts` - Request Validation
```typescript
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ 
      body: req.body, 
      query: req.query, 
      params: req.params 
    });
    
    if (!result.success) {
      return next(new Error(
        result.error.issues.map((issue) => issue.message).join(', ')
      ));
    }
    
    req.body = result.data.body;
    next();
  };
};
```

#### `error-handler.ts` - Global Error Handling
```typescript
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  res.status(500).json(
    buildApiResponse('Internal server error', null, [error.message])
  );
};
```

### 5. Validator Layer (`auth.validator.ts`)

**Responsibility:** Define request schema validation using Zod

**Schemas:**
- `registerSchema` - Email, password, firstName, lastName
- `loginSchema` - Email, password
- `changePasswordSchema` - Old and new password
- `forgotPasswordSchema` - Email
- `resetPasswordSchema` - Reset token and new password

**Features:**
- Email format validation
- Strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Custom error messages
- Type-safe parsing

```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters')
  })
});
```

### 6. Utility Functions

#### `jwt.ts` - Token Management
```typescript
export type JwtPayload = {
  id: string;
  email: string;
  role: string;
};

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
```

#### `password.ts` - Password Hashing
```typescript
const SALT_ROUNDS = 12;

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);
```

#### `api-response.ts` - Response Formatting
```typescript
export const buildApiResponse = <T>(
  message: string,
  data: T | null = null,
  errors: string[] = []
): ApiResponse<T> => ({
  success: errors.length === 0,
  message,
  data,
  errors
});
```

### 7. Routes (`auth.routes.ts`)

```typescript
const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.post('/refresh-token', authenticate, refreshToken);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

// Protected routes with role requirements
router.post('/admin-only', authenticate, authorize('SUPER_ADMIN', 'HR_ADMIN'), handler);
```

## Request Flow

### Login Flow
```
POST /api/auth/login
│
├─→ Validate request (Zod schema)
│   └─→ Extract email & password from body
│
├─→ Controller: login()
│   └─→ Call authService.login()
│
├─→ Service: login()
│   ├─→ UserRepository.findByEmail()
│   ├─→ comparePassword() (bcrypt)
│   ├─→ signAccessToken() (JWT)
│   ├─→ signRefreshToken() (JWT)
│   ├─→ UserRepository.updateUser() (store refresh token)
│   └─→ Return tokens and user data
│
└─→ Response: Standard API response with tokens
```

### Protected Endpoint Flow
```
POST /api/auth/change-password
(with Authorization: Bearer <token>)
│
├─→ Middleware: authenticate
│   ├─→ Extract token from header
│   ├─→ verifyAccessToken() (JWT)
│   ├─→ Attach user to request
│   └─→ Call next()
│
├─→ Middleware: validate()
│   └─→ Validate request body with Zod schema
│
├─→ Controller: changePassword()
│   ├─→ Extract user from request
│   └─→ Call authService.changePassword()
│
├─→ Service: changePassword()
│   ├─→ Find user by ID
│   ├─→ comparePassword() (verify old password)
│   ├─→ hashPassword() (hash new password)
│   └─→ UserRepository.updateUser()
│
└─→ Response: Success message
```

## Database Models

### User Model
```prisma
model User {
  id              String       @id @default(uuid())
  email           String       @unique
  passwordHash    String
  firstName       String
  lastName        String
  roleId          String
  refreshToken    String?
  lastLoginAt     DateTime?
  status          UserStatus   @default(PENDING)
  
  role            Role         @relation(fields: [roleId], references: [id])
  passwordResets  PasswordReset[]
}
```

### PasswordReset Model
```prisma
model PasswordReset {
  id        String    @id @default(uuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Role Model
```prisma
model Role {
  id          String  @id @default(uuid())
  name        RoleName @unique  // SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE
  description String?
  
  users       User[]
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Login failed",
  "data": null,
  "errors": ["Invalid credentials"]
}
```

### Error Types
- **Validation Error** (400) - Invalid input data
- **Authentication Error** (401) - Invalid/missing credentials
- **Authorization Error** (403) - Insufficient permissions
- **Not Found Error** (404) - Resource not found
- **Conflict Error** (409) - Duplicate resource
- **Internal Server Error** (500) - Unexpected error

## Security Features

1. **Password Security**
   - Hashing with bcrypt (12 salt rounds)
   - Strong password requirements
   - Secure password comparison

2. **Token Security**
   - JWT with HS256 algorithm
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Refresh token rotation

3. **Authorization**
   - Role-based access control (RBAC)
   - Middleware-based route protection
   - Permission checking

4. **Input Validation**
   - Zod schema validation
   - Type-safe parsing
   - Detailed error messages

5. **Logging**
   - All authentication events logged
   - Error tracking
   - Audit trail

## Testing

### Manual Testing
Use the provided Postman collection: `AUTH_POSTMAN_COLLECTION.json`

### Test Cases
1. **Register**: Valid data, duplicate email, weak password
2. **Login**: Correct credentials, wrong password, non-existent email
3. **Token Refresh**: Valid token, invalid token, expired token
4. **Password Management**: Change password, forgot password, reset password
5. **Authorization**: Valid role, insufficient permissions

## Environment Variables

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valerion_hr?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

## Running the Server

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## Design Patterns Used

1. **Layered Architecture** - Separation of concerns (Controller → Service → Repository)
2. **Middleware Pattern** - Request processing pipeline
3. **Singleton Pattern** - Single service instances
4. **Dependency Injection** - Service initialization in controllers
5. **Repository Pattern** - Data access abstraction
6. **Error Handling Pattern** - Global error middleware

## Best Practices

1. ✅ Type-safe with TypeScript
2. ✅ Comprehensive input validation
3. ✅ Secure password handling
4. ✅ JWT token management
5. ✅ Error handling and logging
6. ✅ Clean code architecture
7. ✅ Reusable components
8. ✅ Environment-based configuration
9. ✅ Standard API responses
10. ✅ Role-based authorization


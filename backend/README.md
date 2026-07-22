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

## Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Notes

- The backend is isolated from the existing frontend workspace and ready to be connected via REST APIs.
- File uploads are stored locally under `uploads/` for development.

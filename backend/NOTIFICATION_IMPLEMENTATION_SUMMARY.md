# Notification Management Module

Implemented a Notification Management module with API endpoints, validators, repository, service, controller, Postman collection and smoke tests.

Files added:
- `src/repositories/notification.repository.ts`
- `src/services/notification.service.ts`
- `src/controllers/notification.controller.ts`
- `src/routes/notification.routes.ts`
- `src/validators/notification.validator.ts`
- `notification-smoke-test.mjs`
- `NOTIFICATION_POSTMAN_COLLECTION.json`

Notes:
- Uses existing `Notification` Prisma model (userId, title, body, readAt, metadata).
- `POST /api/notifications` supports sending to a specific `userId` or broadcasting with `broadcast: true`.
- Only `HR_ADMIN` and `SUPER_ADMIN` can create/broadcast notifications; authenticated users can view/mark/delete their own notifications.

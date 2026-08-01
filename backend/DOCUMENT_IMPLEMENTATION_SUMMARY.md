# Document Management Module

Implemented Document Management module with upload, metadata storage, list, download, and delete features.

Files added:
- `src/repositories/document.repository.ts`
- `src/services/document.service.ts`
- `src/controllers/document.controller.ts`
- `src/routes/document.routes.ts`
- `src/validators/document.validator.ts`
- `document-smoke-test.mjs`
- `DOCUMENT_POSTMAN_COLLECTION.json`

Notes:
- Reuses existing `Document` Prisma model (`userId`, `title`, `category`, `storageUrl`, `uploadedAt`, `createdAt`, `updatedAt`). No Prisma schema changes required.
- File uploads handled via existing multer config. Uploaded files are saved to `env.uploadDir` and `storageUrl` stores the accessible path.
- Authorization: authenticated users; HR/SUPER_ADMIN can upload for others and delete any document; employees can manage their own documents.

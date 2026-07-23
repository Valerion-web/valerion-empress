# Department Management API Guide

This document provides comprehensive documentation for the Department Management module APIs.

## Overview

The Department Management API provides endpoints for managing department records in the HRMS system.

Features include:
- Create, read, update, and soft-delete department records
- Search departments by name, code, or description
- Filter by status
- Pagination and sorting support
- Role-based access control
- JWT authentication

## Authentication

All endpoints require JWT authentication.

Header format:
```http
Authorization: Bearer <access_token>
```

## Base URL

```http
http://localhost:5000/api
```

## Endpoints

### 1. Create Department
- Method: `POST /departments`
- Authorization: `HR_ADMIN`
- Request body:
```json
{
  "name": "Research",
  "code": "RES",
  "description": "Research department",
  "status": "ACTIVE"
}
```

### 2. Get All Departments
- Method: `GET /departments`
- Authorization: authenticated users
- Query parameters:
  - `page` (optional)
  - `limit` (optional)
  - `sortBy` (optional)
  - `sortOrder` (optional)

### 3. Get Department by ID
- Method: `GET /departments/:id`
- Authorization: authenticated users

### 4. Update Department
- Method: `PUT /departments/:id`
- Authorization: `HR_ADMIN`

### 5. Delete Department
- Method: `DELETE /departments/:id`
- Authorization: `HR_ADMIN`
- Behavior: soft delete; marks record inactive and stores deletedAt

### 6. Search Departments
- Method: `GET /departments/search`
- Query parameter:
  - `q` required

### 7. Filter Departments
- Method: `GET /departments/filter`
- Query parameters:
  - `status`
  - `page`
  - `limit`
  - `sortBy`
  - `sortOrder`

## Response Format

```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {},
  "errors": []
}
```

## Notes

- Duplicate department `name` or `code` is rejected.
- Soft-deleted departments are excluded from normal reads.
- Employee relations remain intact through the existing `departmentId` relationship.

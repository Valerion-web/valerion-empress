# Employee Management API Guide

This document provides comprehensive documentation for the Employee Management Module APIs.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [API Endpoints](#api-endpoints)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Request Examples](#request-examples)
8. [cURL Examples](#curl-examples)
9. [Status Codes](#status-codes)
10. [Testing Checklist](#testing-checklist)

## Overview

The Employee Management API provides endpoints for managing employee data in the HRMS system. Features include:

- Create, read, update, and delete employee records
- Search employees by name, email, or employee ID
- Filter employees by department, status, designation, or employment type
- Pagination and sorting support
- Role-based access control
- JWT token authentication

## Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require JWT authentication.

### Header Format
```
Authorization: Bearer <access_token>
```

### Token Expiry
- Access Token: 15 minutes
- Refresh Token: 7 days

## Base URL

```
http://localhost:4000/api/v1
```

## API Endpoints

### Employee CRUD Operations

#### 1. Create Employee
- **Endpoint:** `POST /employees`
- **Authorization:** SUPER_ADMIN, HR_ADMIN
- **Status Code:** 201 (Created)

#### 2. Get All Employees (Paginated)
- **Endpoint:** `GET /employees`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 10) - Records per page (max: 100)
  - `sortBy` (optional, default: "firstName") - Field to sort by
  - `sortOrder` (optional, default: "asc") - Sort direction (asc/desc)

#### 3. Get Employee by ID
- **Endpoint:** `GET /employees/:id`
- **Authorization:** Authenticated users (Employee can only view own profile)
- **Status Code:** 200 (OK)
- **Path Parameters:**
  - `id` (required) - Employee UUID

#### 4. Update Employee
- **Endpoint:** `PUT /employees/:id`
- **Authorization:** SUPER_ADMIN, HR_ADMIN
- **Status Code:** 200 (OK)
- **Path Parameters:**
  - `id` (required) - Employee UUID

#### 5. Delete Employee
- **Endpoint:** `DELETE /employees/:id`
- **Authorization:** SUPER_ADMIN, HR_ADMIN
- **Status Code:** 200 (OK)
- **Path Parameters:**
  - `id` (required) - Employee UUID

### Search & Filter

#### 6. Search Employees
- **Endpoint:** `GET /employees/search`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)
- **Query Parameters:**
  - `q` (required) - Search query
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)

#### 7. Filter Employees
- **Endpoint:** `GET /employees/filter`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)
- **Query Parameters:**
  - `departmentId` (optional) - Filter by department UUID
  - `status` (optional) - ACTIVE, INACTIVE, RESIGNED
  - `designationId` (optional) - Filter by designation UUID
  - `employmentType` (optional) - FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERN
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `sortBy` (optional, default: "firstName")
  - `sortOrder` (optional, default: "asc")

#### 8. Get Employees by Department
- **Endpoint:** `GET /employees/department/:departmentId`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)
- **Path Parameters:**
  - `departmentId` (required) - Department UUID
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)

#### 9. Get Employees by Status
- **Endpoint:** `GET /employees/status/:status`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)
- **Path Parameters:**
  - `status` (required) - ACTIVE, INACTIVE, RESIGNED
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)

#### 10. Get Total Employee Count
- **Endpoint:** `GET /employees/count`
- **Authorization:** Authenticated users
- **Status Code:** 200 (OK)

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {},
  "errors": [],
  "statusCode": 200
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "gender": "MALE",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "departmentId": "550e8400-e29b-41d4-a716-446655440001",
    "designationId": "550e8400-e29b-41d4-a716-446655440002",
    "joiningDate": "2024-01-10T00:00:00.000Z",
    "employmentType": "FULL_TIME",
    "salary": "75000.00",
    "profileImage": "https://example.com/image.jpg",
    "address": "123 Main St, City, State",
    "emergencyContact": "+9876543210",
    "bloodGroup": "O+",
    "status": "ACTIVE",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Engineering",
      "description": "Engineering Department"
    },
    "designation": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Senior Developer",
      "level": 4
    }
  },
  "errors": [],
  "statusCode": 201
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Email already exists",
  "data": null,
  "errors": [],
  "statusCode": 400
}
```

### Paginated Response Example
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [...],
    "total": 150,
    "page": 1,
    "limit": 10
  },
  "errors": [],
  "statusCode": 200
}
```

## Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": null,
  "errors": [],
  "statusCode": 400
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No token provided",
  "data": null,
  "errors": [],
  "statusCode": 401
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to perform this action",
  "data": null,
  "errors": [],
  "statusCode": 403
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Employee not found",
  "data": null,
  "errors": [],
  "statusCode": 404
}
```

#### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null,
  "errors": [],
  "statusCode": 500
}
```

## Request Examples

### 1. Create Employee
```json
POST /api/v1/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "gender": "MALE",
  "dateOfBirth": "1990-01-15",
  "departmentId": "550e8400-e29b-41d4-a716-446655440001",
  "designationId": "550e8400-e29b-41d4-a716-446655440002",
  "joiningDate": "2024-01-10",
  "employmentType": "FULL_TIME",
  "salary": 75000,
  "profileImage": "https://example.com/image.jpg",
  "address": "123 Main St",
  "emergencyContact": "+9876543210",
  "bloodGroup": "O+"
}
```

### 2. Get All Employees
```
GET /api/v1/employees?page=1&limit=10&sortBy=firstName&sortOrder=asc
Authorization: Bearer <token>
```

### 3. Search Employees
```
GET /api/v1/employees/search?q=john&page=1&limit=10
Authorization: Bearer <token>
```

### 4. Filter Employees
```
GET /api/v1/employees/filter?departmentId=550e8400-e29b-41d4-a716-446655440001&status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

### 5. Update Employee
```json
PUT /api/v1/employees/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1987654321",
  "status": "INACTIVE",
  "address": "456 Oak Ave"
}
```

### 6. Delete Employee
```
DELETE /api/v1/employees/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

## cURL Examples

### 1. Create Employee (as HR_ADMIN)
```bash
curl -X POST http://localhost:4000/api/v1/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "gender": "MALE",
    "departmentId": "DEPT_UUID",
    "designationId": "DESIG_UUID",
    "joiningDate": "2024-01-10",
    "employmentType": "FULL_TIME",
    "salary": 75000
  }'
```

### 2. Get All Employees
```bash
curl -X GET "http://localhost:4000/api/v1/employees?page=1&limit=10&sortBy=firstName&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Employee by ID
```bash
curl -X GET "http://localhost:4000/api/v1/employees/EMPLOYEE_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Employee (as HR_ADMIN)
```bash
curl -X PUT "http://localhost:4000/api/v1/employees/EMPLOYEE_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1987654321",
    "status": "INACTIVE"
  }'
```

### 5. Delete Employee (as SUPER_ADMIN)
```bash
curl -X DELETE "http://localhost:4000/api/v1/employees/EMPLOYEE_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Search Employees
```bash
curl -X GET "http://localhost:4000/api/v1/employees/search?q=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Filter Employees
```bash
curl -X GET "http://localhost:4000/api/v1/employees/filter?departmentId=DEPT_UUID&status=ACTIVE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Get Employee Count
```bash
curl -X GET "http://localhost:4000/api/v1/employees/count" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## Validation Rules

### Employee Fields

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| employeeId | string | Yes | 1-50 chars, unique |
| firstName | string | Yes | 1-100 chars |
| lastName | string | Yes | 1-100 chars |
| email | string | Yes | Valid email, unique |
| phone | string | No | Valid phone format |
| gender | enum | No | MALE, FEMALE, OTHER |
| dateOfBirth | datetime | No | Valid date |
| departmentId | uuid | Yes | Valid UUID, department must exist |
| designationId | uuid | Yes | Valid UUID, designation must exist |
| joiningDate | datetime | Yes | Valid date |
| employmentType | enum | No | FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERN |
| salary | number | No | Positive number |
| profileImage | string | No | Valid URL |
| address | string | No | Max 500 chars |
| emergencyContact | string | No | Max 100 chars |
| bloodGroup | string | No | Max 10 chars |
| status | enum | No | ACTIVE, INACTIVE, RESIGNED |

## Testing Checklist

- [ ] Create employee with valid data
- [ ] Create employee with invalid email
- [ ] Create employee with duplicate email
- [ ] Create employee without required fields
- [ ] Get all employees (verify pagination)
- [ ] Get employee by valid ID
- [ ] Get employee by invalid ID
- [ ] Get employee without authentication
- [ ] Search employees with query
- [ ] Search employees without query parameter
- [ ] Filter by department
- [ ] Filter by status
- [ ] Filter by multiple criteria
- [ ] Update employee successfully
- [ ] Update employee with invalid data
- [ ] Delete employee successfully
- [ ] Delete non-existent employee
- [ ] Verify role-based access control
- [ ] Verify employee can only view own profile
- [ ] Verify pagination parameters work correctly
- [ ] Verify sorting works in both directions
- [ ] Test all status codes and error messages

## Role-Based Access Control

| Endpoint | SUPER_ADMIN | HR_ADMIN | EMPLOYEE | MANAGER |
|----------|-------------|----------|----------|---------|
| POST /employees | ✓ | ✓ | ✗ | ✗ |
| GET /employees | ✓ | ✓ | ✓ | ✓ |
| GET /employees/:id | ✓ | ✓ | Own Only | ✓ |
| PUT /employees/:id | ✓ | ✓ | ✗ | ✗ |
| DELETE /employees/:id | ✓ | ✓ | ✗ | ✗ |
| GET /employees/search | ✓ | ✓ | ✓ | ✓ |
| GET /employees/filter | ✓ | ✓ | ✓ | ✓ |

## Notes

- All timestamps are in ISO 8601 format
- Pagination is 1-indexed
- Maximum limit is 100 records per page
- Salary is stored as decimal with 2 decimal places
- Deleted records are permanently removed from the database
- Search is case-insensitive
- Filters can be combined

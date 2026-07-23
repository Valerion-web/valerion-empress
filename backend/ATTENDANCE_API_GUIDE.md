# Attendance Management API Guide

This document provides comprehensive documentation for the Attendance Management module APIs.

## Overview

The Attendance Management API supports employee attendance workflows including:

- Check-in and check-out actions
- Daily, employee-specific, and filtered attendance retrieval
- Monthly attendance report generation
- Search across attendance records
- Pagination and sorting support
- JWT authentication and role-based access control

## Authentication

All endpoints require JWT authentication.

Header format:

```http
Authorization: Bearer <access_token>
```

## Base URL

```http
http://localhost:4000/api
```

## Endpoints

### 1. Check In Attendance
- Method: `POST /attendance/check-in`
- Authorization: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, `SUPER_ADMIN`
- Request body:

```json
{
  "location": "HQ",
  "status": "PRESENT"
}
```

### 2. Check Out Attendance
- Method: `POST /attendance/check-out/:id`
- Authorization: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, `SUPER_ADMIN`
- Request body:

```json
{
  "location": "HQ",
  "status": "PRESENT"
}
```

### 3. Get All Attendance Records
- Method: `GET /attendance`
- Authorization: authenticated users
- Query parameters:
  - `page`
  - `limit`
  - `sortBy`
  - `sortOrder`

### 4. Get Attendance by ID
- Method: `GET /attendance/:id`
- Authorization: authenticated users

### 5. Get Attendance by Employee
- Method: `GET /attendance/employee/:userId`
- Authorization: authenticated users

### 6. Get Attendance by Date
- Method: `GET /attendance/date?date=YYYY-MM-DD`
- Authorization: authenticated users

### 7. Search Attendance
- Method: `GET /attendance/search?q=<query>`
- Authorization: authenticated users

### 8. Filter Attendance
- Method: `GET /attendance/filter`
- Authorization: authenticated users
- Query parameters:
  - `userId`
  - `status`
  - `date`
  - `page`
  - `limit`
  - `sortBy`
  - `sortOrder`

### 9. Monthly Attendance Report
- Method: `GET /attendance/report?month=<1-12>&year=<YYYY>`
- Authorization: `HR_ADMIN`, `SUPER_ADMIN`, `MANAGER`

### 10. Update Attendance
- Method: `PUT /attendance/:id`
- Authorization: `HR_ADMIN`, `SUPER_ADMIN`, `MANAGER`

### 11. Delete Attendance
- Method: `DELETE /attendance/:id`
- Authorization: `HR_ADMIN`, `SUPER_ADMIN`

## Response Format

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {},
  "errors": []
}
```

## Notes

- Attendance check-in enforces a single check-in per employee per day.
- Check-out updates the same attendance record for the employee.
- Search supports employee details such as first name, last name, email, and location.
- Monthly report returns a full month view with filtered attendance entries.

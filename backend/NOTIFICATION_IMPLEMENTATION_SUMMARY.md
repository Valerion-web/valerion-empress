# Notifications Center Implementation Summary

## Overview
A complete Notifications Center module was added to the HR portal so users can receive and manage contextual alerts from the core HR workflows.

## Backend
- Added notification persistence through the existing Prisma Notification model.
- Implemented notification endpoints for creation, listing, reading, unreading, bulk mark-as-read, and deletion.
- Connected notifications to:
  - Leave approval/rejection
  - Payroll generation
  - Training assignment
  - Helpdesk ticket updates/assignment
  - Recruitment interview scheduling

## Frontend
- Added a notification bell in the shared top bar with an unread-count badge.
- Added a notification dropdown with recent items and a quick link to the full center.
- Added a full Notifications page with:
  - unread/read state
  - mark read/unread actions
  - delete action
  - bulk mark-all-read

## Integration
- Connected the UI to the authenticated backend notification API.
- Hooked the module into the existing sidebar and app route tree.

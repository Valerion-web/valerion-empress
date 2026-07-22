export const ROLE_NAMES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  HR_ADMIN: 'HR_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const DEFAULT_PERMISSIONS = {
  EMPLOYEE: ['employee:read:self', 'leave:read:self', 'attendance:read:self', 'profile:update:self'],
  MANAGER: ['employee:read:team', 'attendance:read:team', 'leave:approve:team', 'performance:read:team'],
  HR_ADMIN: ['employee:crud', 'payroll:manage', 'recruitment:manage', 'training:manage', 'department:manage'],
  SUPER_ADMIN: ['system:manage', 'role:manage', 'permission:manage', 'settings:manage', 'audit:read'],
} as const;

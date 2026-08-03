import { Router } from 'express';
import {
  assignPermissionsToRole,
  assignRoleToUser,
  createRole,
  deleteRole,
  getRoleById,
  listPermissions,
  listRoles,
  updateRole,
} from '../controllers/role.controller.js';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), listRoles);
router.get('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), getRoleById);
router.post('/', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), requirePermission('role:manage'), createRole);
router.put('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), requirePermission('role:manage'), updateRole);
router.delete('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), requirePermission('role:manage'), deleteRole);
router.post('/assign-user', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), requirePermission('role:manage'), assignRoleToUser);
router.get('/permissions', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), listPermissions);
router.post('/permissions', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), requirePermission('permission:manage'), assignPermissionsToRole);

export default router;

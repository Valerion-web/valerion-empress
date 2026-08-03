import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const listRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        users: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(buildApiResponse('Roles retrieved successfully', roles));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch roles';
    logger.error(message);
    return res.status(500).json(buildApiResponse(message, null, [message]));
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } }, users: true },
    });

    if (!role) {
      return res.status(404).json(buildApiResponse('Role not found', null, ['Role not found']));
    }

    return res.status(200).json(buildApiResponse('Role retrieved successfully', role));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch role';
    logger.error(message);
    return res.status(500).json(buildApiResponse(message, null, [message]));
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await prisma.role.create({
      data: {
        name: req.body.name,
        description: req.body.description,
      },
    });

    return res.status(201).json(buildApiResponse('Role created successfully', role));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create role';
    logger.error(message);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const role = await prisma.role.update({
      where: { id },
      data: {
        description: req.body.description,
      },
    });

    return res.status(200).json(buildApiResponse('Role updated successfully', role));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update role';
    logger.error(message);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.role.delete({ where: { id } });
    return res.status(200).json(buildApiResponse('Role deleted successfully', null));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete role';
    logger.error(message);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });

    return res.status(200).json(buildApiResponse('Role assigned successfully', user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign role';
    logger.error(message);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listPermissions = async (_req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json(buildApiResponse('Permissions retrieved successfully', permissions));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch permissions';
    logger.error(message);
    return res.status(500).json(buildApiResponse(message, null, [message]));
  }
};

export const assignPermissionsToRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionIds } = req.body;
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId: string) => ({ roleId, permissionId })),
    });

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });

    return res.status(200).json(buildApiResponse('Permissions assigned successfully', role));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign permissions';
    logger.error(message);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

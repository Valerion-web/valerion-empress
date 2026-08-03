import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { buildApiResponse } from '../utils/api-response.js';
import { prisma } from '../config/prisma.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(buildApiResponse('Unauthorized', null, ['Missing bearer token']));
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    const userRecord = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    const rolePermissions = userRecord?.role
      ? await prisma.role.findUnique({
          where: { id: userRecord.role.id },
          include: { permissions: { include: { permission: true } } },
        })
      : null;

    (req as any).user = {
      ...payload,
      role: userRecord?.role?.name ?? payload.role,
      permissions: rolePermissions?.permissions.map((entry) => entry.permission.name) ?? [],
    };
    next();
  } catch {
    return res.status(401).json(buildApiResponse('Unauthorized', null, ['Invalid or expired access token']));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role)) {
      return res.status(403).json(buildApiResponse('Forbidden', null, ['Insufficient permissions']));
    }
    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { permissions?: string[] } | undefined;
    const granted = user?.permissions ?? [];
    const allowed = permissions.every((permission) => granted.includes(permission));

    if (!allowed) {
      return res.status(403).json(buildApiResponse('Forbidden', null, ['Insufficient permissions']));
    }

    next();
  };
};

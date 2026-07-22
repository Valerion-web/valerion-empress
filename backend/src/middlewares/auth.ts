import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { buildApiResponse } from '../utils/api-response.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(buildApiResponse('Unauthorized', null, ['Missing bearer token']));
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
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

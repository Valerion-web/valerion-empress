import type { NextFunction, Request, Response } from 'express';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(buildApiResponse(`Route ${req.originalUrl} not found`, null, ['Route not found']));
};

export const globalErrorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(error.message);
  res.status(500).json(buildApiResponse('Internal server error', null, [error.message]));
};

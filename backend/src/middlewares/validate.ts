import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { buildApiResponse } from '../utils/api-response.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      return next(new Error(result.error.issues.map((issue) => issue.message).join(', ')));
    }
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    next();
  };
};

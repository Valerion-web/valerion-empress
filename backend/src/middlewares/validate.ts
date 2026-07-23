import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { buildApiResponse } from '../utils/api-response.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      return res.status(400).json(buildApiResponse('Validation failed', null, errors));
    }

    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    req.params = result.data.params ?? req.params;
    next();
  };
};

import type { ApiResponse } from '../types/api.js';

export const buildApiResponse = <T>(message: string, data: T | null = null, errors: string[] = []): ApiResponse<T> => ({
  success: errors.length === 0,
  message,
  data,
  errors,
});

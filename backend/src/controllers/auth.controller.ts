import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json(buildApiResponse('Login successful', data));
};

export const logout = async (req: Request, res: Response) => {
  const user = (req as any).user;
  await authService.logout(user.id);
  res.json(buildApiResponse('Logout successful'));
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const user = (req as any).user;
  const data = await authService.refresh(user.id, refreshToken);
  res.json(buildApiResponse('Token refreshed', data));
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const data = await authService.forgotPassword(email);
  res.json(buildApiResponse('Reset link sent', data));
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const data = await authService.resetPassword(token, password);
  res.json(buildApiResponse('Password reset successful', data));
};

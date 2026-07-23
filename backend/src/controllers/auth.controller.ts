import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const data = await authService.register(email, password, firstName, lastName);
    res.status(201).json(buildApiResponse('Registration successful', data));
  } catch (error: any) {
    res.status(400).json(buildApiResponse('Registration failed', null, [error.message]));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(buildApiResponse('Login successful', data));
  } catch (error: any) {
    res.status(401).json(buildApiResponse('Login failed', null, [error.message]));
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await authService.logout(user.id);
    res.json(buildApiResponse('Logout successful'));
  } catch (error: any) {
    res.status(500).json(buildApiResponse('Logout failed', null, [error.message]));
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const user = (req as any).user;
    const data = await authService.refreshToken(user.id, refreshToken);
    res.json(buildApiResponse('Token refreshed', data));
  } catch (error: any) {
    res.status(401).json(buildApiResponse('Token refresh failed', null, [error.message]));
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { oldPassword, newPassword } = req.body;
    const data = await authService.changePassword(user.id, oldPassword, newPassword);
    res.json(buildApiResponse('Password changed successfully', data));
  } catch (error: any) {
    res.status(400).json(buildApiResponse('Password change failed', null, [error.message]));
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    res.json(buildApiResponse('Reset link sent', data));
  } catch (error: any) {
    res.status(400).json(buildApiResponse('Forgot password failed', null, [error.message]));
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const data = await authService.resetPassword(token, password);
    res.json(buildApiResponse('Password reset successful', data));
  } catch (error: any) {
    res.status(400).json(buildApiResponse('Password reset failed', null, [error.message]));
  }
};

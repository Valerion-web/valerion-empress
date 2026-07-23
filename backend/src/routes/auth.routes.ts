import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/refresh-token', authenticate, refreshToken);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;

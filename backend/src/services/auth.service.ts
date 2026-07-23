import { prisma } from '../config/prisma.js';
import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const userRepository = new UserRepository();

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Get default employee role
    const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });
    if (!employeeRole) {
      throw new Error('Default role not found. Please seed the database.');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      roleId: employeeRole.id,
    });

    logger.info(`User registered: ${email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: role?.name ?? 'EMPLOYEE',
    });
    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: role?.name ?? 'EMPLOYEE',
    });

    await userRepository.updateUser(user.id, { refreshToken, lastLoginAt: new Date() });
    logger.info(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: role?.name,
      },
    };
  }

  async logout(userId: string) {
    await userRepository.updateUser(userId, { refreshToken: null });
    logger.info(`User logged out: ${userId}`);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    const newAccessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: role?.name ?? 'EMPLOYEE',
    });
    const newRefreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: role?.name ?? 'EMPLOYEE',
    });

    await userRepository.updateUser(userId, { refreshToken: newRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateUser(userId, { passwordHash });

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If an account exists with this email, a reset link will be sent' };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    logger.info(`Password reset requested for: ${email}`);

    // In a real application, send email here with reset link
    // For now, return the token for testing purposes
    return {
      message: 'Reset link sent to email',
      resetToken: token, // Only for testing - remove in production
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new Error('Invalid reset token');
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }

    if (passwordReset.usedAt) {
      throw new Error('This reset token has already been used');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() },
      }),
    ]);

    logger.info(`Password reset successful for user: ${passwordReset.user.email}`);

    return { message: 'Password reset successfully' };
  }
}

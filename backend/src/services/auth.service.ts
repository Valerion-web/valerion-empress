import { prisma } from '../config/prisma.js';
import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

const userRepository = new UserRepository();

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: role?.name ?? 'EMPLOYEE' });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email, role: role?.name ?? 'EMPLOYEE' });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    logger.info(`User logged in: ${user.email}`);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: role?.name } };
  }

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    logger.info(`User logged out: ${userId}`);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.refreshToken !== refreshToken) throw new Error('Invalid refresh token');

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    return {
      accessToken: signAccessToken({ id: user.id, email: user.email, role: role?.name ?? 'EMPLOYEE' }),
      refreshToken: signRefreshToken({ id: user.id, email: user.email, role: role?.name ?? 'EMPLOYEE' }),
    };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('No user found for this email');
    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(token: string, password: string) {
    const passwordHash = await hashPassword(password);
    await prisma.user.updateMany({ data: { passwordHash } });
    return { message: 'Password reset successful' };
  }
}

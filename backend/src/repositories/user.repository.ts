import { prisma } from '../config/prisma.js';
import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super('user');
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithRole(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        designation: true,
        employeeProfile: true,
      },
    });
  }

  async createEmployee(data: any) {
    return prisma.user.create({ data });
  }
}

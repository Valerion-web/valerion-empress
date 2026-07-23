import { prisma } from '../config/prisma.js';
import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super('user');
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
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

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }) {
    return prisma.user.create({ data });
  }

  async createEmployee(data: any) {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }
}

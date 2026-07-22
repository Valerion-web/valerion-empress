import { prisma } from '../config/prisma.js';
import { BaseRepository } from './base.repository.js';

export class RoleRepository extends BaseRepository<any> {
  constructor() {
    super('role');
  }

  async findByName(name: string) {
    return prisma.role.findUnique({ where: { name: name as any } });
  }

  async listWithPermissions() {
    return prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  }
}

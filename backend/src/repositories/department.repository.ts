import { prisma } from '../config/prisma.js';
import { Department, Prisma } from '@prisma/client';

export class DepartmentRepository {
  async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ departments: Department[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.department.count({ where: { deletedAt: null } }),
    ]);

    return { departments, total, page, limit };
  }

  async findById(id: string): Promise<Department | null> {
    return prisma.department.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ departments: Department[]; total: number }> {
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { departments, total };
  }

  async filter(
    filters: {
      status?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ departments: Department[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.DepartmentWhereInput = {
      deletedAt: null,
      ...(filters.status && { status: filters.status as any }),
    };

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.department.count({ where: whereClause }),
    ]);

    return { departments, total };
  }

  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return prisma.department.create({
      data,
    });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.department.count({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }

  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.department.count({
      where: {
        code,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }
}

export const departmentRepository = new DepartmentRepository();

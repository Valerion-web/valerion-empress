import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class DocumentRepository {
  async create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data });
  }

  async findById(id: string) {
    return prisma.document.findUnique({ where: { id } });
  }

  async list(where: Prisma.DocumentWhereInput, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.document.findMany({ where, skip, take: limit, orderBy: { uploadedAt: 'desc' } }),
      prisma.document.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async listByEmployee(employeeId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId: employeeId } as Prisma.DocumentWhereInput;
    const [items, total] = await Promise.all([
      prisma.document.findMany({ where, skip, take: limit, orderBy: { uploadedAt: 'desc' } }),
      prisma.document.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  }
}

export const documentRepository = new DocumentRepository();

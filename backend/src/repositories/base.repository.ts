import { prisma } from '../config/prisma.js';

export abstract class BaseRepository<T> {
  protected model: keyof typeof prisma;

  constructor(model: keyof typeof prisma) {
    this.model = model;
  }

  async findAll(): Promise<T[]> {
    const collection = await (prisma[this.model] as any).findMany();
    return collection as T[];
  }

  async findById(id: string): Promise<T | null> {
    const item = await (prisma[this.model] as any).findUnique({ where: { id } });
    return item as T | null;
  }

  async create(data: Partial<T>): Promise<T> {
    const item = await (prisma[this.model] as any).create({ data });
    return item as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const item = await (prisma[this.model] as any).update({ where: { id }, data });
    return item as T | null;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await (prisma[this.model] as any).delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

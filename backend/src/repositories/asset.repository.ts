import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class AssetRepository {
  async listAssets(where: Prisma.AssetWhereInput, page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc') {
    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder } as Prisma.AssetOrderByWithRelationInput;
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({ where, skip, take: limit, orderBy, include: { category: true, allocations: { where: { status: 'ALLOCATED' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } }),
      prisma.asset.count({ where }),
    ]);
    return { assets, total, page, limit };
  }

  async findById(id: string) {
    return prisma.asset.findUnique({ where: { id }, include: { category: true, allocations: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } }, history: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true } } } } } });
  }

  async create(data: Prisma.AssetCreateInput, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({ data });
      await tx.assetHistory.create({ data: { assetId: asset.id, action: 'CREATED', toStatus: asset.status, userId: actorId } });
      return asset;
    });
  }

  async update(id: string, data: Prisma.AssetUpdateInput, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.asset.findUniqueOrThrow({ where: { id } });
      const asset = await tx.asset.update({ where: { id }, data });
      const statusChanged = current.status !== asset.status;
      await tx.assetHistory.create({ data: { assetId: id, action: statusChanged ? 'STATUS_CHANGED' : 'UPDATED', fromStatus: statusChanged ? current.status : undefined, toStatus: statusChanged ? asset.status : undefined, userId: actorId } });
      return asset;
    });
  }

  async delete(id: string, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.asset.findUniqueOrThrow({ where: { id } });
      const asset = await tx.asset.update({ where: { id }, data: { status: 'RETIRED' } });
      await tx.assetHistory.create({ data: { assetId: id, action: 'DELETED', fromStatus: current.status, toStatus: asset.status, userId: actorId } });
      return asset;
    });
  }

  async assign(assetId: string, userId: string, notes: string | undefined, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUniqueOrThrow({ where: { id: assetId } });
      if (asset.status !== 'AVAILABLE') throw new Error(`Asset is not available (status: ${asset.status})`);
      const allocation = await tx.assetAllocation.create({ data: { assetId, userId, status: 'ALLOCATED' } });
      await tx.asset.update({ where: { id: assetId }, data: { status: 'ASSIGNED' } });
      await tx.assetHistory.create({ data: { assetId, action: 'ASSIGNED', fromStatus: asset.status, toStatus: 'ASSIGNED', userId: actorId, notes } });
      return allocation;
    });
  }

  async returnAsset(assetId: string, notes: string | undefined, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUniqueOrThrow({ where: { id: assetId } });
      const allocation = await tx.assetAllocation.findFirst({ where: { assetId, status: 'ALLOCATED' }, orderBy: { allocatedAt: 'desc' } });
      if (!allocation) throw new Error('Asset has no active assignment');
      const returned = await tx.assetAllocation.update({ where: { id: allocation.id }, data: { status: 'RETURNED', returnedAt: new Date() } });
      await tx.asset.update({ where: { id: assetId }, data: { status: 'AVAILABLE' } });
      await tx.assetHistory.create({ data: { assetId, action: 'RETURNED', fromStatus: asset.status, toStatus: 'AVAILABLE', userId: actorId, notes } });
      return returned;
    });
  }

  async listCategories(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([prisma.assetCategory.findMany({ skip, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { assets: true } } } }), prisma.assetCategory.count()]);
    return { categories, total, page, limit };
  }

  async createCategory(data: Prisma.AssetCategoryCreateInput) { return prisma.assetCategory.create({ data }); }
  async updateCategory(id: string, data: Prisma.AssetCategoryUpdateInput) { return prisma.assetCategory.update({ where: { id }, data }); }
  async deleteCategory(id: string) { return prisma.assetCategory.delete({ where: { id } }); }
  async findCategory(id: string) { return prisma.assetCategory.findUnique({ where: { id } }); }

  async employeeAssets(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId, status: 'ALLOCATED' as const };
    const [allocations, total] = await Promise.all([prisma.assetAllocation.findMany({ where, skip, take: limit, orderBy: { allocatedAt: 'desc' }, include: { asset: { include: { category: true } } } }), prisma.assetAllocation.count({ where })]);
    return { allocations, total, page, limit };
  }

  async history(assetId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { assetId };
    const [history, total] = await Promise.all([prisma.assetHistory.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true } } } }), prisma.assetHistory.count({ where })]);
    return { history, total, page, limit };
  }
}

export const assetRepository = new AssetRepository();

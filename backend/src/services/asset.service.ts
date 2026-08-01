import { Prisma } from '@prisma/client';
import { assetRepository } from '../repositories/asset.repository.js';

export class AssetService {
  async list(query: { q?: string; status?: string; categoryId?: string; page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const where: Prisma.AssetWhereInput = { ...(query.status && { status: query.status as Prisma.AssetWhereInput['status'] }), ...(query.categoryId && { categoryId: query.categoryId }), ...(query.q && { OR: [{ name: { contains: query.q, mode: 'insensitive' } }, { type: { contains: query.q, mode: 'insensitive' } }, { serialNumber: { contains: query.q, mode: 'insensitive' } }, { assetTag: { contains: query.q, mode: 'insensitive' } }] }) };
    return assetRepository.listAssets(where, query.page, query.limit, query.sortBy, query.sortOrder);
  }

  async get(id: string) { const asset = await assetRepository.findById(id); if (!asset) throw new Error('Asset not found'); return asset; }

  async create(data: Record<string, unknown>, actorId: string) {
    return assetRepository.create({ ...data, status: data.status ?? 'AVAILABLE', purchaseDate: data.purchaseDate ? new Date(data.purchaseDate as string) : undefined, warrantyUntil: data.warrantyUntil ? new Date(data.warrantyUntil as string) : undefined } as Prisma.AssetCreateInput, actorId);
  }

  async update(id: string, data: Record<string, unknown>, actorId: string) {
    await this.get(id);
    return assetRepository.update(id, { ...data, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate as string) : undefined, warrantyUntil: data.warrantyUntil ? new Date(data.warrantyUntil as string) : undefined } as Prisma.AssetUpdateInput, actorId);
  }

  async delete(id: string, actorId: string) { await this.get(id); return assetRepository.delete(id, actorId); }
  async assign(id: string, userId: string, notes: string | undefined, actorId: string) { await this.get(id); return assetRepository.assign(id, userId, notes, actorId); }
  async returnAsset(id: string, notes: string | undefined, actorId: string) { await this.get(id); return assetRepository.returnAsset(id, notes, actorId); }
  async categories(page: number, limit: number) { return assetRepository.listCategories(page, limit); }
  async createCategory(data: Prisma.AssetCategoryCreateInput) { return assetRepository.createCategory(data); }
  async updateCategory(id: string, data: Prisma.AssetCategoryUpdateInput) { if (!(await assetRepository.findCategory(id))) throw new Error('Asset category not found'); return assetRepository.updateCategory(id, data); }
  async deleteCategory(id: string) { if (!(await assetRepository.findCategory(id))) throw new Error('Asset category not found'); return assetRepository.deleteCategory(id); }
  async employeeAssets(userId: string, page: number, limit: number) { return assetRepository.employeeAssets(userId, page, limit); }
  async history(id: string, page: number, limit: number) { await this.get(id); return assetRepository.history(id, page, limit); }
}

export const assetService = new AssetService();

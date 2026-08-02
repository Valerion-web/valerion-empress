import { trainingRepository } from '../repositories/training.repository.js';
import { Prisma } from '@prisma/client';

export class TrainingService {
  async create(data: Record<string, any>) {
    const payload: Prisma.TrainingCreateInput = { title: data.title, trainer: data.trainer, description: data.description, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined } as any;
    return trainingRepository.create(payload);
  }

  async get(id: string) {
    const t = await trainingRepository.findById(id);
    if (!t) throw new Error('Training not found');
    return t;
  }

  async list(query: { q?: string; page?: number; limit?: number }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: Prisma.TrainingWhereInput = { ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }) };
    return trainingRepository.list(where, page, limit);
  }

  async update(id: string, data: Record<string, any>) {
    return trainingRepository.update(id, { title: data.title, trainer: data.trainer, description: data.description, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined } as any);
  }

  async delete(id: string) {
    return trainingRepository.delete(id);
  }

  async assign(trainingId: string, userId: string) {
    return trainingRepository.assign(trainingId, userId);
  }

  async complete(trainingId: string, userId: string) {
    return trainingRepository.complete(trainingId, userId);
  }

  async myTrainings(userId: string, page = 1, limit = 20) {
    return trainingRepository.listByUser(userId, page, limit);
  }

  async assignments(trainingId: string) {
    return trainingRepository.listAssignments(trainingId);
  }
}

export const trainingService = new TrainingService();

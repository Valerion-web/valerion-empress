import { trainingRepository } from '../repositories/training.repository.js';
import { notificationService } from './notification.service.js';
import { Prisma } from '@prisma/client';

const toDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

export class TrainingService {
  async create(data: Record<string, any>) {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      trainer: data.trainer,
      departmentId: data.departmentId,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      status: data.status,
    } as any;
    return trainingRepository.create(payload);
  }

  async get(id: string) {
    const training = await trainingRepository.findById(id);
    if (!training) throw new Error('Training not found');
    return training;
  }

  async list(query: { q?: string; page?: number; limit?: number; status?: string; category?: string; departmentId?: string }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: Prisma.TrainingWhereInput = {};

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' } as any;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    return trainingRepository.list(where, page, limit);
  }

  async update(id: string, data: Record<string, any>) {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      trainer: data.trainer,
      departmentId: data.departmentId,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      status: data.status,
    } as any;
    return trainingRepository.update(id, payload);
  }

  async delete(id: string) {
    return trainingRepository.delete(id);
  }

  async assign(trainingId: string, userId: string, assignedBy?: string) {
    const assignment = await trainingRepository.assign(trainingId, userId, assignedBy);
    await notificationService.sendToEmployee(userId, 'Training assigned', 'You have been assigned a new training module.', 'INFO', { trainingId, assignmentId: (assignment as any).id });
    return assignment;
  }

  async complete(trainingId: string, userId: string, data?: Record<string, any>) {
    return trainingRepository.complete(trainingId, userId, data);
  }

  async myTrainings(userId: string, page = 1, limit = 20) {
    return trainingRepository.listByUser(userId, page, limit);
  }

  async assignments(trainingId: string) {
    return trainingRepository.listAssignments(trainingId);
  }
}

export const trainingService = new TrainingService();

import { Prisma, Performance } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class PerformanceRepository {
  async create(data: Prisma.PerformanceCreateInput): Promise<Performance> {
    return prisma.performance.create({
      data,
      include: {
        employee: true,
        reviewer: true,
      },
    });
  }

  async update(id: string, data: Prisma.PerformanceUpdateInput): Promise<Performance> {
    return prisma.performance.update({
      where: { id },
      data,
      include: {
        employee: true,
        reviewer: true,
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.performance.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findById(id: string): Promise<Performance | null> {
    return prisma.performance.findUnique({
      where: { id },
      include: {
        employee: true,
        reviewer: true,
      },
    });
  }

  async findAll(
    filters: {
      q?: string;
      status?: string;
      reviewPeriod?: string;
      rating?: number;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ reviews: Performance[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PerformanceWhereInput = {
      ...(filters.status && { status: filters.status as any }),
      ...(filters.reviewPeriod && { reviewPeriod: { contains: filters.reviewPeriod, mode: 'insensitive' } }),
      ...(filters.rating !== undefined && { rating: filters.rating }),
    };

    if (filters.q) {
      where.OR = [
        { reviewPeriod: { contains: filters.q, mode: 'insensitive' } },
        { goals: { contains: filters.q, mode: 'insensitive' } },
        { achievements: { contains: filters.q, mode: 'insensitive' } },
        { strengths: { contains: filters.q, mode: 'insensitive' } },
        { improvements: { contains: filters.q, mode: 'insensitive' } },
        { comments: { contains: filters.q, mode: 'insensitive' } },
        { employee: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { employee: { lastName: { contains: filters.q, mode: 'insensitive' } } },
        { reviewer: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { reviewer: { lastName: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
          reviewer: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.performance.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  async findByEmployee(
    employeeId: string,
    filters: {
      q?: string;
      status?: string;
      reviewPeriod?: string;
      rating?: number;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ reviews: Performance[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PerformanceWhereInput = {
      employeeId,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.reviewPeriod && { reviewPeriod: { contains: filters.reviewPeriod, mode: 'insensitive' } }),
      ...(filters.rating !== undefined && { rating: filters.rating }),
    };

    if (filters.q) {
      where.OR = [
        { reviewPeriod: { contains: filters.q, mode: 'insensitive' } },
        { goals: { contains: filters.q, mode: 'insensitive' } },
        { achievements: { contains: filters.q, mode: 'insensitive' } },
        { strengths: { contains: filters.q, mode: 'insensitive' } },
        { improvements: { contains: filters.q, mode: 'insensitive' } },
        { comments: { contains: filters.q, mode: 'insensitive' } },
        { reviewer: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { reviewer: { lastName: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
          reviewer: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.performance.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  async findByReviewer(
    reviewerId: string,
    filters: {
      q?: string;
      status?: string;
      reviewPeriod?: string;
      rating?: number;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ reviews: Performance[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PerformanceWhereInput = {
      reviewerId,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.reviewPeriod && { reviewPeriod: { contains: filters.reviewPeriod, mode: 'insensitive' } }),
      ...(filters.rating !== undefined && { rating: filters.rating }),
    };

    if (filters.q) {
      where.OR = [
        { reviewPeriod: { contains: filters.q, mode: 'insensitive' } },
        { goals: { contains: filters.q, mode: 'insensitive' } },
        { achievements: { contains: filters.q, mode: 'insensitive' } },
        { strengths: { contains: filters.q, mode: 'insensitive' } },
        { improvements: { contains: filters.q, mode: 'insensitive' } },
        { comments: { contains: filters.q, mode: 'insensitive' } },
        { employee: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { employee: { lastName: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
          reviewer: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.performance.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }
}

export const performanceRepository = new PerformanceRepository();

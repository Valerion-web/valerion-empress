import { Performance, Prisma } from '@prisma/client';
import { performanceRepository } from '../repositories/performance.repository.js';
import { prisma } from '../config/prisma.js';

type PerformanceFilters = {
  q?: string;
  status?: string;
  reviewPeriod?: string;
  rating?: number;
};

type PerformanceCreateData = {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  reviewDate: Date;
  rating: number;
  goals: string;
  achievements: string;
  strengths: string;
  improvements: string;
  comments: string;
  status?: string;
};

type PerformanceUpdateData = Partial<Omit<PerformanceCreateData, 'employeeId' | 'reviewerId'>> & {
  status?: string;
};

export class PerformanceService {
  private repository = performanceRepository;

  private async resolveUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async createPerformance(data: PerformanceCreateData) {
    const employee = await this.resolveUser(data.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const reviewer = await this.resolveUser(data.reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    const review = await this.repository.create({
      employee: { connect: { id: data.employeeId } },
      reviewer: { connect: { id: data.reviewerId } },
      reviewPeriod: data.reviewPeriod,
      reviewDate: data.reviewDate,
      rating: data.rating,
      goals: data.goals,
      achievements: data.achievements,
      strengths: data.strengths,
      improvements: data.improvements,
      comments: data.comments,
      status: data.status as any,
    });

    return review;
  }

  async getAllPerformances(
    userId: string,
    role: string,
    filters: PerformanceFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    if (role === 'EMPLOYEE') {
      return this.repository.findByEmployee(userId, filters, page, limit, sortBy, sortOrder);
    }

    return this.repository.findAll(filters, page, limit, sortBy, sortOrder);
  }

  async getPerformanceById(id: string, userId: string, role: string) {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new Error('Performance review not found');
    }

    if (role === 'EMPLOYEE' && review.employeeId !== userId) {
      throw new Error('Forbidden: cannot access another employee performance review');
    }

    return review;
  }

  async updatePerformance(id: string, userId: string, role: string, data: PerformanceUpdateData) {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new Error('Performance review not found');
    }

    if (role === 'EMPLOYEE') {
      throw new Error('Forbidden: employees cannot update performance reviews');
    }

    if (role === 'MANAGER' && review.reviewerId !== userId) {
      throw new Error('Forbidden: managers can only update reviews they authored');
    }

    const updateData: Prisma.PerformanceUpdateInput = {
      ...('reviewPeriod' in data && data.reviewPeriod ? { reviewPeriod: data.reviewPeriod } : {}),
      ...('reviewDate' in data && data.reviewDate ? { reviewDate: data.reviewDate } : {}),
      ...('rating' in data && data.rating !== undefined ? { rating: data.rating } : {}),
      ...('goals' in data && data.goals ? { goals: data.goals } : {}),
      ...('achievements' in data && data.achievements ? { achievements: data.achievements } : {}),
      ...('strengths' in data && data.strengths ? { strengths: data.strengths } : {}),
      ...('improvements' in data && data.improvements ? { improvements: data.improvements } : {}),
      ...('comments' in data && data.comments ? { comments: data.comments } : {}),
      ...('status' in data && data.status ? { status: data.status as any } : {}),
    };

    return this.repository.update(id, updateData);
  }

  async deletePerformance(id: string) {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new Error('Performance review not found');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('Unable to delete performance review');
    }

    return review;
  }

  async getPerformancesByEmployee(
    employeeId: string,
    userId: string,
    role: string,
    filters: PerformanceFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    if (role === 'EMPLOYEE' && employeeId !== userId) {
      throw new Error('Forbidden: employees can only view their own performance reviews');
    }

    return this.repository.findByEmployee(employeeId, filters, page, limit, sortBy, sortOrder);
  }

  async getPerformancesByReviewer(
    reviewerId: string,
    userId: string,
    role: string,
    filters: PerformanceFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    if (role === 'MANAGER' && reviewerId !== userId) {
      throw new Error('Forbidden: managers can only view reviews assigned to them');
    }

    return this.repository.findByReviewer(reviewerId, filters, page, limit, sortBy, sortOrder);
  }
}

export const performanceService = new PerformanceService();

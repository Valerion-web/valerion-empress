import { holidayRepository } from '../repositories/holiday.repository.js';
import { Prisma } from '@prisma/client';

export class HolidayService {
  constructor(private repository: typeof holidayRepository) {}

  async create(input: { name: string; description?: string; holidayDate: string; holidayType?: string; departmentId?: string | null; isRecurring?: boolean }) {
    return this.repository.create({
      name: input.name,
      description: input.description,
      holidayDate: new Date(input.holidayDate),
      holidayType: (input.holidayType as any) ?? 'COMPANY',
      department: input.departmentId ? { connect: { id: input.departmentId } } : undefined,
      isRecurring: input.isRecurring ?? false,
    } as any);
  }

  async list(query: Record<string, any>) {
    return this.repository.list({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      search: query.search ?? query.q,
      departmentId: query.departmentId,
      holidayType: query.holidayType,
      year: query.year ? Number(query.year) : undefined,
    });
  }

  async getById(id: string) {
    const holiday = await this.repository.getById(id);
    if (!holiday) throw new Error('Holiday not found');
    return holiday;
  }

  async update(id: string, input: Partial<{ name: string; description: string; holidayDate: string; holidayType: string; departmentId: string | null; isRecurring: boolean }>) {
    const holiday = await this.getById(id);
    if (!holiday) throw new Error('Holiday not found');

    return this.repository.update(id, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.holidayDate ? { holidayDate: new Date(input.holidayDate) } : {}),
      ...(input.holidayType ? { holidayType: input.holidayType as any } : {}),
      ...(input.departmentId !== undefined ? { department: input.departmentId ? { connect: { id: input.departmentId } } : { disconnect: true } } : {}),
      ...(input.isRecurring !== undefined ? { isRecurring: input.isRecurring } : {}),
    } as any);
  }

  async delete(id: string) {
    const holiday = await this.getById(id);
    if (!holiday) throw new Error('Holiday not found');
    return this.repository.delete(id);
  }

  async upcoming(limit = 5) {
    return this.repository.upcoming(limit);
  }

  async calendar(start: string, end: string) {
    return this.repository.calendar(new Date(start), new Date(end));
  }

  async reports(query: Record<string, any>) {
    return this.repository.reports({ year: query.year ? Number(query.year) : undefined, departmentId: query.departmentId, holidayType: query.holidayType });
  }
}

export const holidayService = new HolidayService(holidayRepository);

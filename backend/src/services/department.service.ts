import { Prisma } from '@prisma/client';
import { departmentRepository } from '../repositories/department.repository.js';
import { logger } from '../utils/logger.js';

export class DepartmentService {
  constructor(private repository: typeof departmentRepository) {}

  async getAllDepartments(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    const result = await this.repository.findAll(page, limit, sortBy, sortOrder);
    logger.info(`Retrieved ${result.departments.length} departments (Page: ${page}, Total: ${result.total})`);
    return result;
  }

  async getDepartmentById(id: string) {
    const department = await this.repository.findById(id);
    if (!department) {
      throw new Error('Department not found');
    }
    logger.info(`Retrieved department: ${id}`);
    return department;
  }

  async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const nameExists = await this.repository.nameExists(data.name);
    if (nameExists) {
      throw new Error(`Department with name ${data.name} already exists`);
    }

    const codeExists = await this.repository.codeExists(data.code);
    if (codeExists) {
      throw new Error(`Department with code ${data.code} already exists`);
    }

    const department = await this.repository.create({
      name: data.name,
      code: data.code,
      description: data.description,
      status: (data.status as any) || 'ACTIVE',
    });

    logger.info(`Created new department: ${department.id} (${department.code})`);
    return department;
  }

  async updateDepartment(
    id: string,
    data: Partial<{
      name: string;
      code: string;
      description: string;
      status: 'ACTIVE' | 'INACTIVE';
    }>
  ) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Department not found');
    }

    if (!Object.keys(data).length) {
      throw new Error('At least one update field is required');
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.nameExists(data.name, id);
      if (nameExists) {
        throw new Error(`Department with name ${data.name} already exists`);
      }
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await this.repository.codeExists(data.code, id);
      if (codeExists) {
        throw new Error(`Department with code ${data.code} already exists`);
      }
    }

    const department = await this.repository.update(id, data as Prisma.DepartmentUpdateInput);
    logger.info(`Updated department: ${id}`);
    return department;
  }

  async deleteDepartment(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Department not found');
    }

    const department = await this.repository.delete(id);
    logger.info(`Soft deleted department: ${id}`);
    return department;
  }

  async searchDepartments(query: string, page: number = 1, limit: number = 10) {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const result = await this.repository.search(query, page, limit);
    logger.info(`Searched departments with query "${query}": Found ${result.total}`);
    return result;
  }

  async filterDepartments(
    filters: { status?: string },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    const result = await this.repository.filter(filters, page, limit, sortBy, sortOrder);
    logger.info(`Filtered departments: Found ${result.total}`);
    return result;
  }
}

export const departmentService = new DepartmentService(departmentRepository);

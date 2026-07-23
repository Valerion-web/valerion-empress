import { prisma } from '../config/prisma.js';
import { Employee, Prisma } from '@prisma/client';

export class EmployeeRepository {
  /**
   * Find employee by ID with department and designation details
   */
  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Find employee by email
   */
  async findByEmail(email: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { email },
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Find employee by employee ID
   */
  async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { employeeId },
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Get all employees with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ employees: Employee[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        skip,
        take: limit,
        include: {
          department: true,
          designation: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.employee.count(),
    ]);

    return { employees, total, page, limit };
  }

  /**
   * Search employees by name, email, or employee ID
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ employees: Employee[]; total: number }> {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { employeeId: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        include: {
          department: true,
          designation: true,
        },
      }),
      prisma.employee.count({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { employeeId: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { employees, total };
  }

  /**
   * Filter employees by department, status, designation, or employment type
   */
  async filter(
    filters: {
      departmentId?: string;
      status?: string;
      designationId?: string;
      employmentType?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ employees: Employee[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EmployeeWhereInput = {
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.status && { status: filters.status as any }),
      ...(filters.designationId && { designationId: filters.designationId }),
      ...(filters.employmentType && { employmentType: filters.employmentType as any }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          department: true,
          designation: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.employee.count({ where: whereClause }),
    ]);

    return { employees, total };
  }

  /**
   * Find employees by department
   */
  async findByDepartment(
    departmentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ employees: Employee[]; total: number }> {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: { departmentId },
        skip,
        take: limit,
        include: {
          department: true,
          designation: true,
        },
      }),
      prisma.employee.count({ where: { departmentId } }),
    ]);

    return { employees, total };
  }

  /**
   * Find employees by status
   */
  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ employees: Employee[]; total: number }> {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: { status: status as any },
        skip,
        take: limit,
        include: {
          department: true,
          designation: true,
        },
      }),
      prisma.employee.count({ where: { status: status as any } }),
    ]);

    return { employees, total };
  }

  /**
   * Create a new employee
   */
  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return prisma.employee.create({
      data,
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Update employee
   */
  async update(id: string, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
    return prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Delete employee
   */
  async delete(id: string): Promise<Employee> {
    return prisma.employee.delete({
      where: { id },
      include: {
        department: true,
        designation: true,
      },
    });
  }

  /**
   * Count total employees
   */
  async count(): Promise<number> {
    return prisma.employee.count();
  }

  /**
   * Check if employee email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.employee.count({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Check if employee ID exists
   */
  async employeeIdExists(employeeId: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.employee.count({
      where: {
        employeeId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }
}

export const employeeRepository = new EmployeeRepository();

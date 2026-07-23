import { EmployeeRepository } from '../repositories/employee.repository.js';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class EmployeeService {
  constructor(private repository: EmployeeRepository) {}

  /**
   * Get all employees with pagination and sorting
   */
  async getAllEmployees(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'firstName',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    try {
      const result = await this.repository.findAll(page, limit, sortBy, sortOrder);
      logger.info(
        `Retrieved ${result.employees.length} employees (Page: ${page}, Total: ${result.total})`
      );
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error fetching employees: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string) {
    try {
      const employee = await this.repository.findById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      logger.info(`Retrieved employee: ${id}`);
      return employee;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error fetching employee ${id}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: Date;
    departmentId: string;
    designationId: string;
    joiningDate: Date;
    employmentType?: string;
    salary?: number;
    profileImage?: string;
    address?: string;
    emergencyContact?: string;
    bloodGroup?: string;
  }) {
    try {
      // Check if email already exists
      const emailExists = await this.repository.emailExists(data.email);
      if (emailExists) {
        throw new Error(`Employee with email ${data.email} already exists`);
      }

      // Check if employee ID already exists
      const employeeIdExists = await this.repository.employeeIdExists(data.employeeId);
      if (employeeIdExists) {
        throw new Error(`Employee with ID ${data.employeeId} already exists`);
      }

      // Verify department exists
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new Error('Department not found');
      }

      // Verify designation exists
      const designation = await prisma.designation.findUnique({
        where: { id: data.designationId },
      });
      if (!designation) {
        throw new Error('Designation not found');
      }

      const employee = await this.repository.create({
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender as any,
        dateOfBirth: data.dateOfBirth,
        department: {
          connect: { id: data.departmentId },
        },
        designation: {
          connect: { id: data.designationId },
        },
        joiningDate: data.joiningDate,
        employmentType: (data.employmentType as any) || 'FULL_TIME',
        salary: data.salary ? new Prisma.Decimal(data.salary) : null,
        profileImage: data.profileImage,
        address: data.address,
        emergencyContact: data.emergencyContact,
        bloodGroup: data.bloodGroup,
        status: 'ACTIVE',
      });

      logger.info(`Created new employee: ${employee.id} (${employee.employeeId})`);
      return employee;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error creating employee: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(
    id: string,
    data: Partial<{
      employeeId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: Date;
      departmentId: string;
      designationId: string;
      employmentType?: string;
      salary?: number;
      profileImage?: string;
      address?: string;
      emergencyContact?: string;
      bloodGroup?: string;
      status: string;
    }>
  ) {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Employee not found');
      }

      // Check if email is being changed and if it already exists
      if (data.email && data.email !== existing.email) {
        const emailExists = await this.repository.emailExists(data.email, id);
        if (emailExists) {
          throw new Error(`Email ${data.email} is already in use`);
        }
      }

      // Check if employee ID is being changed and if it already exists
      if (data.employeeId && data.employeeId !== existing.employeeId) {
        const employeeIdExists = await this.repository.employeeIdExists(data.employeeId, id);
        if (employeeIdExists) {
          throw new Error(`Employee ID ${data.employeeId} is already in use`);
        }
      }

      // Verify department exists if being changed
      if (data.departmentId && data.departmentId !== existing.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: data.departmentId },
        });
        if (!department) {
          throw new Error('Department not found');
        }
      }

      // Verify designation exists if being changed
      if (data.designationId && data.designationId !== existing.designationId) {
        const designation = await prisma.designation.findUnique({
          where: { id: data.designationId },
        });
        if (!designation) {
          throw new Error('Designation not found');
        }
      }

      const updateData: any = { ...data };
      if (data.salary !== undefined) {
        updateData.salary = new Prisma.Decimal(data.salary);
      }

      const employee = await this.repository.update(id, updateData);
      logger.info(`Updated employee: ${id}`);
      return employee;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error updating employee ${id}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string) {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Employee not found');
      }

      const employee = await this.repository.delete(id);
      logger.info(`Deleted employee: ${id}`);
      return employee;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error deleting employee ${id}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Search employees
   */
  async searchEmployees(query: string, page: number = 1, limit: number = 10) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      const result = await this.repository.search(query, page, limit);
      logger.info(`Searched employees with query "${query}": Found ${result.total}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error searching employees: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Filter employees
   */
  async filterEmployees(
    filters: {
      departmentId?: string;
      status?: string;
      designationId?: string;
      employmentType?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'firstName',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    try {
      // Validate filters
      if (filters.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: filters.departmentId },
        });
        if (!department) {
          throw new Error('Department not found');
        }
      }

      if (filters.designationId) {
        const designation = await prisma.designation.findUnique({
          where: { id: filters.designationId },
        });
        if (!designation) {
          throw new Error('Designation not found');
        }
      }

      const result = await this.repository.filter(filters, page, limit, sortBy, sortOrder);
      logger.info(`Filtered employees: Found ${result.total}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error filtering employees: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(
    departmentId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new Error('Department not found');
      }

      const result = await this.repository.findByDepartment(departmentId, page, limit);
      logger.info(`Retrieved ${result.employees.length} employees from department ${departmentId}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error fetching employees by department: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get employees by status
   */
  async getEmployeesByStatus(status: string, page: number = 1, limit: number = 10) {
    try {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'RESIGNED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
      }

      const result = await this.repository.findByStatus(status, page, limit);
      logger.info(`Retrieved ${result.employees.length} employees with status ${status}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error fetching employees by status: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get total employee count
   */
  async getTotalEmployeeCount() {
    try {
      const count = await this.repository.count();
      logger.info(`Total employees: ${count}`);
      return count;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error counting employees: ${errorMsg}`);
      throw error;
    }
  }
}

// Export singleton instance
const employeeRepository = new EmployeeRepository();
export const employeeService = new EmployeeService(employeeRepository);

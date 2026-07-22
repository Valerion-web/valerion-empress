import { prisma } from '../config/prisma.js';

export class EmployeeService {
  async listEmployees() {
    return prisma.user.findMany({
      include: {
        role: true,
        department: true,
        designation: true,
        employeeProfile: true,
      },
    });
  }

  async getEmployee(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        designation: true,
        employeeProfile: true,
      },
    });
  }

  async updateEmployee(id: string, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
        department: true,
        designation: true,
        employeeProfile: true,
      },
    });
  }
}

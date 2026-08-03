import { Request, Response } from 'express';
import { employeeService } from '../services/employee.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/password.js';

/**
 * Create new employee
 * POST /api/v1/employees
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    logger.info(`Employee created: ${employee.id}`);
    return res.status(201).json(
      buildApiResponse('Employee created successfully', employee)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create employee';
    logger.error(`Error creating employee: ${errorMessage}`);
    return res.status(400).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Get all employees with pagination
 * GET /api/v1/employees
 */
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'firstName';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const result = await employeeService.getAllEmployees(page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.employees.length} employees`);
    return res.status(200).json(
      buildApiResponse('Employees retrieved successfully', result)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
    logger.error(`Error fetching employees: ${errorMessage}`);
    return res.status(500).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Get employee by ID
 * GET /api/v1/employees/:id
 */
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const employee = await employeeService.getEmployeeById(id);
    logger.info(`Retrieved employee: ${id}`);
    return res.status(200).json(
      buildApiResponse('Employee retrieved successfully', employee)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employee';
    logger.error(`Error fetching employee: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Update employee
 * PUT /api/v1/employees/:id
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const employee = await employeeService.updateEmployee(id, req.body);
    logger.info(`Updated employee: ${id}`);
    return res.status(200).json(
      buildApiResponse('Employee updated successfully', employee)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
    logger.error(`Error updating employee: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Delete employee
 * DELETE /api/v1/employees/:id
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await employeeService.deleteEmployee(id);
    logger.info(`Deleted employee: ${id}`);
    return res.status(200).json(
      buildApiResponse('Employee deleted successfully', null)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee';
    logger.error(`Error deleting employee: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Search employees
 * GET /api/v1/employees/search
 */
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    if (!q || typeof q !== 'string') {
      return res.status(400).json(
        buildApiResponse('Search query (q) is required', null, ['Search query is required'])
      );
    }

    const result = await employeeService.searchEmployees(q, page, limit);
    logger.info(`Searched employees with query "${q}": Found ${result.total}`);
    return res.status(200).json(
      buildApiResponse('Employees searched successfully', result)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search employees';
    logger.error(`Error searching employees: ${errorMessage}`);
    return res.status(400).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Filter employees
 * GET /api/v1/employees/filter
 */
export const filterEmployees = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'firstName';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const filters = {
      departmentId: req.query.departmentId as string | undefined,
      status: req.query.status as string | undefined,
      designationId: req.query.designationId as string | undefined,
      employmentType: req.query.employmentType as string | undefined,
    };

    const result = await employeeService.filterEmployees(filters, page, limit, sortBy, sortOrder);
    logger.info(`Filtered employees: Found ${result.total}`);
    return res.status(200).json(
      buildApiResponse('Employees filtered successfully', result)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to filter employees';
    logger.error(`Error filtering employees: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Get employees by department
 * GET /api/v1/employees/department/:departmentId
 */
export const getEmployeesByDepartment = async (req: Request, res: Response) => {
  try {
    const departmentId = Array.isArray(req.params.departmentId) ? req.params.departmentId[0] : req.params.departmentId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const result = await employeeService.getEmployeesByDepartment(departmentId, page, limit);
    logger.info(`Retrieved ${result.employees.length} employees from department`);
    return res.status(200).json(
      buildApiResponse('Employees retrieved successfully', result)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
    logger.error(`Error fetching employees by department: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Get employees by status
 * GET /api/v1/employees/status/:status
 */
export const getEmployeesByStatus = async (req: Request, res: Response) => {
  try {
    const status = Array.isArray(req.params.status) ? req.params.status[0] : req.params.status;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const result = await employeeService.getEmployeesByStatus(status, page, limit);
    logger.info(`Retrieved ${result.employees.length} employees with status ${status}`);
    return res.status(200).json(
      buildApiResponse('Employees retrieved successfully', result)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
    logger.error(`Error fetching employees by status: ${errorMessage}`);
    return res.status(400).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

/**
 * Get total employee count
 * GET /api/v1/employees/count
 */
export const getTotalEmployeeCount = async (req: Request, res: Response) => {
  try {
    const count = await employeeService.getTotalEmployeeCount();
    logger.info(`Total employees: ${count}`);
    return res.status(200).json(
      buildApiResponse('Total count retrieved successfully', { count })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to count employees';
    logger.error(`Error counting employees: ${errorMessage}`);
    return res.status(500).json(
      buildApiResponse(errorMessage, null, [errorMessage])
    );
  }
};

export const getMyDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const [employee, attendanceRecords, leaveBalance, holidays, payrollRecords, trainings, notifications] = await Promise.all([
      prisma.employee.findFirst({ where: { email: userEmail }, include: { department: true, designation: true } }),
      prisma.attendance.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.leaveBalance.findFirst({ where: { userId, year: new Date().getFullYear() } }),
      prisma.holiday.findMany({ where: { holidayDate: { gte: new Date() } }, orderBy: { holidayDate: 'asc' }, take: 5 }),
      prisma.payroll.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.trainingAssignment.findMany({ where: { userId }, include: { training: true }, orderBy: { assignedDate: 'desc' }, take: 5 }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const attendanceSummary = attendanceRecords.reduce((acc, record) => {
      if (record.status === 'PRESENT') acc.presentDays += 1;
      if (record.status === 'ABSENT') acc.absentDays += 1;
      if (record.status === 'LATE') acc.lateDays += 1;
      return acc;
    }, { presentDays: 0, absentDays: 0, lateDays: 0, totalDays: attendanceRecords.length, todayStatus: attendanceRecords[0]?.status ?? 'NO_RECORD' });

    return res.status(200).json(buildApiResponse('ESS dashboard retrieved successfully', {
      employee,
      attendance: attendanceSummary,
      leaveBalance,
      holidays,
      payroll: payrollRecords,
      trainings: trainings.map((item) => ({ id: item.id, title: item.training.title, completionStatus: item.completionStatus, assignedDate: item.assignedDate.toISOString() })),
      notifications,
    }));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to load ESS dashboard');
    return res.status(500).json(buildApiResponse('Unable to load ESS dashboard', null, ['Unable to load ESS dashboard']));
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await prisma.user.findUnique({ where: { id: userId }, include: { employeeProfile: true, role: true } });
    return res.status(200).json(buildApiResponse('Profile retrieved successfully', profile));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to load profile');
    return res.status(500).json(buildApiResponse('Unable to load profile', null, ['Unable to load profile']));
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, phone, gender, dateOfBirth, address, emergencyContact, bloodGroup } = req.body as Record<string, unknown>;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName: firstName as string | undefined, lastName: lastName as string | undefined },
    });

    const updatedEmployee = await prisma.employee.findFirst({ where: { email: updatedUser.email } });
    if (updatedEmployee) {
      await prisma.employee.update({
        where: { id: updatedEmployee.id },
        data: {
          phone: phone as string | undefined,
          gender: gender as any,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth as string) : undefined,
          address: address as string | undefined,
          emergencyContact: emergencyContact as string | undefined,
          bloodGroup: bloodGroup as string | undefined,
        },
      });
    }

    const profile = await prisma.user.findUnique({ where: { id: userId }, include: { employeeProfile: true, role: true } });
    return res.status(200).json(buildApiResponse('Profile updated successfully', profile));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to update profile');
    return res.status(400).json(buildApiResponse('Unable to update profile', null, ['Unable to update profile']));
  }
};

export const uploadMyPhoto = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json(buildApiResponse('File is required', null, ['File is required']));
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findFirst({ where: { email: (req as any).user.email } });
    if (employee) {
      await prisma.employee.update({ where: { id: employee.id }, data: { profileImage: file.filename } });
    }
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl: file.filename } });
    return res.status(200).json(buildApiResponse('Profile photo uploaded successfully', { fileName: file.filename }));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to upload photo');
    return res.status(400).json(buildApiResponse('Unable to upload photo', null, ['Unable to upload photo']));
  }
};

export const uploadMyDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json(buildApiResponse('File is required', null, ['File is required']));
    const userId = (req as any).user.id;
    const payload = req.body as Record<string, unknown>;
    const document = await prisma.document.create({
      data: {
        userId,
        title: (payload.documentName as string) || 'Document',
        category: (payload.documentType as string) || 'GENERAL',
        storageUrl: file.filename,
      },
    });
    return res.status(201).json(buildApiResponse('Document uploaded successfully', document));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to upload document');
    return res.status(400).json(buildApiResponse('Unable to upload document', null, ['Unable to upload document']));
  }
};

export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body as Record<string, unknown>;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json(buildApiResponse('User not found', null, ['User not found']));
    const valid = await comparePassword(oldPassword as string, user.passwordHash);
    if (!valid) return res.status(400).json(buildApiResponse('Current password is incorrect', null, ['Current password is incorrect']));
    const passwordHash = await hashPassword(newPassword as string);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return res.status(200).json(buildApiResponse('Password changed successfully', null));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to change password');
    return res.status(400).json(buildApiResponse('Unable to change password', null, ['Unable to change password']));
  }
};

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 });
    return res.status(200).json(buildApiResponse('Notifications retrieved successfully', notifications));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unable to load notifications');
    return res.status(500).json(buildApiResponse('Unable to load notifications', null, ['Unable to load notifications']));
  }
};

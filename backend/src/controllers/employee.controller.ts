import { Request, Response } from 'express';
import { employeeService } from '../services/employee.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

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

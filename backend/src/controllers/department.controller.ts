import { Request, Response } from 'express';
import { departmentService } from '../services/department.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    logger.info(`Department created: ${department.id}`);
    return res.status(201).json(buildApiResponse('Department created successfully', department));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create department';
    logger.error(`Error creating department: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'name';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const result = await departmentService.getAllDepartments(page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.departments.length} departments`);
    return res.status(200).json(buildApiResponse('Departments retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
    logger.error(`Error fetching departments: ${errorMessage}`);
    return res.status(500).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const department = await departmentService.getDepartmentById(id);
    logger.info(`Retrieved department: ${id}`);
    return res.status(200).json(buildApiResponse('Department retrieved successfully', department));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch department';
    logger.error(`Error fetching department: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const department = await departmentService.updateDepartment(id, req.body);
    logger.info(`Updated department: ${id}`);
    return res.status(200).json(buildApiResponse('Department updated successfully', department));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update department';
    logger.error(`Error updating department: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await departmentService.deleteDepartment(id);
    logger.info(`Deleted department: ${id}`);
    return res.status(200).json(buildApiResponse('Department deleted successfully', null));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete department';
    logger.error(`Error deleting department: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const searchDepartments = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    if (!q || typeof q !== 'string') {
      return res.status(400).json(buildApiResponse('Search query (q) is required', null, ['Search query is required']));
    }

    const result = await departmentService.searchDepartments(q, page, limit);
    logger.info(`Searched departments with query "${q}": Found ${result.total}`);
    return res.status(200).json(buildApiResponse('Departments searched successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search departments';
    logger.error(`Error searching departments: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const filterDepartments = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'name';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const filters = {
      status: req.query.status as string | undefined,
    };

    const result = await departmentService.filterDepartments(filters, page, limit, sortBy, sortOrder);
    logger.info(`Filtered departments: Found ${result.total}`);
    return res.status(200).json(buildApiResponse('Departments filtered successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to filter departments';
    logger.error(`Error filtering departments: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

import { Request, Response } from 'express';
import { performanceService } from '../services/performance.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const createPerformance = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const performance = await performanceService.createPerformance({
      employeeId: data.employeeId,
      reviewerId: data.reviewerId,
      reviewPeriod: data.reviewPeriod,
      reviewDate: data.reviewDate,
      rating: data.rating,
      goals: data.goals,
      achievements: data.achievements,
      strengths: data.strengths,
      improvements: data.improvements,
      comments: data.comments,
      status: data.status,
    });

    logger.info(`Performance review created: ${performance.id}`);
    return res.status(201).json(buildApiResponse('Performance review created successfully', performance));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create performance review';
    logger.error(`Error creating performance review: ${message}`);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getAllPerformances = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
      reviewPeriod: req.query.reviewPeriod as string | undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
    };

    const result = await performanceService.getAllPerformances(
      user.id,
      user.role,
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    );

    logger.info(`Fetched ${result.reviews.length} performance reviews`);
    return res.status(200).json(buildApiResponse('Performance reviews retrieved successfully', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance reviews';
    logger.error(`Error fetching performance reviews: ${message}`);
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getPerformanceById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = (req as any).user;
    const review = await performanceService.getPerformanceById(id, user.id, user.role);
    logger.info(`Fetched performance review ${id}`);
    return res.status(200).json(buildApiResponse('Performance review retrieved successfully', review));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance review';
    logger.error(`Error fetching performance review: ${message}`);
    const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const updatePerformance = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = (req as any).user;
    const review = await performanceService.updatePerformance(id, user.id, user.role, req.body);
    logger.info(`Updated performance review ${id}`);
    return res.status(200).json(buildApiResponse('Performance review updated successfully', review));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update performance review';
    logger.error(`Error updating performance review: ${message}`);
    const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const deletePerformance = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const review = await performanceService.deletePerformance(id);
    logger.info(`Deleted performance review ${id}`);
    return res.status(200).json(buildApiResponse('Performance review deleted successfully', review));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete performance review';
    logger.error(`Error deleting performance review: ${message}`);
    const status = message.includes('not found') ? 404 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const getPerformancesByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
    const user = (req as any).user;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
      reviewPeriod: req.query.reviewPeriod as string | undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
    };

    const result = await performanceService.getPerformancesByEmployee(
      employeeId,
      user.id,
      user.role,
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    );

    logger.info(`Fetched ${result.reviews.length} reviews for employee ${employeeId}`);
    return res.status(200).json(buildApiResponse('Employee performance reviews retrieved successfully', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance reviews';
    logger.error(`Error fetching employee performance reviews: ${message}`);
    const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const getPerformancesByReviewer = async (req: Request, res: Response) => {
  try {
    const reviewerId = Array.isArray(req.params.reviewerId) ? req.params.reviewerId[0] : req.params.reviewerId;
    const user = (req as any).user;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
      reviewPeriod: req.query.reviewPeriod as string | undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
    };

    const result = await performanceService.getPerformancesByReviewer(
      reviewerId,
      user.id,
      user.role,
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    );

    logger.info(`Fetched ${result.reviews.length} reviews for reviewer ${reviewerId}`);
    return res.status(200).json(buildApiResponse('Reviewer performance reviews retrieved successfully', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance reviews';
    logger.error(`Error fetching reviewer performance reviews: ${message}`);
    const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

import type { Request, Response } from 'express';
import { holidayService } from '../services/holiday.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const getId = (req: Request) => (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

export const createHoliday = async (req: Request, res: Response) => {
  try {
    const holiday = await holidayService.create(req.body);
    return res.status(201).json(buildApiResponse('Holiday created', holiday));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create holiday';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listHolidays = async (req: Request, res: Response) => {
  try {
    const result = await holidayService.list(req.query as Record<string, any>);
    return res.json(buildApiResponse('Holidays retrieved', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list holidays';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getHoliday = async (req: Request, res: Response) => {
  try {
    const holiday = await holidayService.getById(getId(req));
    return res.json(buildApiResponse('Holiday retrieved', holiday));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get holiday';
    const status = message.includes('not found') ? 404 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const holiday = await holidayService.update(getId(req), req.body);
    return res.json(buildApiResponse('Holiday updated', holiday));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update holiday';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    await holidayService.delete(getId(req));
    return res.json(buildApiResponse('Holiday deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete holiday';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const upcomingHolidays = async (_req: Request, res: Response) => {
  try {
    const holidays = await holidayService.upcoming(5);
    return res.json(buildApiResponse('Upcoming holidays retrieved', holidays));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get upcoming holidays';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const calendarHolidays = async (req: Request, res: Response) => {
  try {
    const holidays = await holidayService.calendar(req.query.start as string, req.query.end as string);
    return res.json(buildApiResponse('Calendar holidays retrieved', holidays));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get calendar holidays';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const holidayReports = async (req: Request, res: Response) => {
  try {
    const result = await holidayService.reports(req.query as Record<string, any>);
    return res.json(buildApiResponse('Holiday reports retrieved', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get holiday reports';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

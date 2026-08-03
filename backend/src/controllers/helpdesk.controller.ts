import type { Request, Response } from 'express';
import { helpdeskService } from '../services/helpdesk.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const getId = (req: Request) => (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

export const createTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await helpdeskService.createTicket({
      employeeId: (req as any).user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      status: req.body.status,
    });
    return res.status(201).json(buildApiResponse('Ticket created', ticket));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listTickets = async (req: Request, res: Response) => {
  try {
    const result = await helpdeskService.listTickets(req.query as Record<string, any>);
    return res.json(buildApiResponse('Tickets retrieved', result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list tickets';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await helpdeskService.getTicket(getId(req));
    return res.json(buildApiResponse('Ticket retrieved', ticket));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get ticket';
    const status = message.includes('not found') ? 404 : 400;
    return res.status(status).json(buildApiResponse(message, null, [message]));
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await helpdeskService.updateTicket(getId(req), req.body);
    return res.json(buildApiResponse('Ticket updated', ticket));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    await helpdeskService.deleteTicket(getId(req));
    return res.json(buildApiResponse('Ticket deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete ticket';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const comment = await helpdeskService.addComment(getId(req), (req as any).user.id, req.body.message);
    return res.status(201).json(buildApiResponse('Comment added', comment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add comment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const stats = await helpdeskService.getDashboardStats();
    return res.json(buildApiResponse('Dashboard stats retrieved', stats));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get stats';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

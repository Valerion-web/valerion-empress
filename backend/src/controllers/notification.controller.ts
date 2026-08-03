import type { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const id = (req: Request) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, body, broadcast, type, metadata } = req.body as any;
    if (broadcast) {
      await notificationService.broadcastToAll(title, body, type ?? 'INFO', metadata);
      return res.status(201).json(buildApiResponse('Notifications broadcasted successfully', null));
    }
    const created = await notificationService.sendToEmployee(userId, title, body, type ?? 'INFO', metadata);
    return res.status(201).json(buildApiResponse('Notification sent successfully', created));
  } catch (e) { return errorResponse(res, e, 'Failed to send notification'); }
};

export const listNotifications = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Notifications retrieved successfully', await notificationService.list(req.query as any))); } catch (e) { return errorResponse(res, e, 'Failed to list notifications'); } };
export const getNotification = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Notification retrieved successfully', await notificationService.get(id(req)))); } catch (e) { return errorResponse(res, e, 'Failed to get notification'); } };
export const deleteNotification = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Notification deleted successfully', await notificationService.delete(id(req), (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to delete notification'); } };
export const myNotifications = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('My notifications retrieved successfully', await notificationService.myNotifications((req as any).user.id, Number(req.query.page) || 1, Number(req.query.limit) || 20))); } catch (e) { return errorResponse(res, e, 'Failed to get my notifications'); } };
export const markRead = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Notification marked as read', await notificationService.markRead(id(req), (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to mark notification as read'); } };
export const markUnread = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Notification marked as unread', await notificationService.markUnread(id(req), (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to mark notification as unread'); } };
export const markAllRead = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('All notifications marked as read', await notificationService.markAllRead((req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to mark notifications as read'); } };

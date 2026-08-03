import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTicket, listTickets, getTicket, updateTicket, deleteTicket, addComment, getDashboardStats } from '../controllers/helpdesk.controller.js';
import { createTicketSchema, commentSchema, paginationQuery, ticketIdSchema, updateTicketSchema } from '../validators/helpdesk.validator.js';

const router = Router();
const hrOrAdmin = authorize('HR_ADMIN', 'SUPER_ADMIN');
const fullAccess = authorize('HR_ADMIN', 'SUPER_ADMIN');

router.post('/', authenticate, validate(createTicketSchema), createTicket);
router.get('/', authenticate, validate(paginationQuery), listTickets);
router.get('/stats', authenticate, hrOrAdmin, getDashboardStats);
router.get('/:id', authenticate, validate(ticketIdSchema), getTicket);
router.put('/:id', authenticate, fullAccess, validate(ticketIdSchema), validate(updateTicketSchema), updateTicket);
router.delete('/:id', authenticate, fullAccess, validate(ticketIdSchema), deleteTicket);
router.post('/:id/comments', authenticate, validate(ticketIdSchema), validate(commentSchema), addComment);

export default router;

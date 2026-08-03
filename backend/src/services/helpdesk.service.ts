import { helpdeskRepository } from '../repositories/helpdesk.repository.js';
import { notificationService } from './notification.service.js';
import { Prisma } from '@prisma/client';

export class HelpdeskService {
  constructor(private repository: typeof helpdeskRepository) {}

  async createTicket(input: { employeeId: string; title: string; description: string; category: string; priority?: string; status?: string }) {
    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket = await this.repository.createTicket({
      ticketNumber,
      employee: { connect: { id: input.employeeId } },
      title: input.title,
      description: input.description,
      category: input.category,
      priority: (input.priority as Prisma.EnumTicketPriorityFieldUpdateOperationsInput) ?? 'MEDIUM',
      status: (input.status as Prisma.EnumTicketStatusFieldUpdateOperationsInput) ?? 'OPEN',
    } as any);
    return ticket;
  }

  async listTickets(query: Record<string, any>) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return this.repository.listTickets({
      page,
      limit,
      search: query.search ?? query.q,
      status: query.status,
      priority: query.priority,
      category: query.category,
      assignedToId: query.assignedToId,
      employeeId: query.employeeId,
      userRole: query.userRole,
    });
  }

  async getTicket(id: string) {
    const ticket = await this.repository.getTicketById(id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async updateTicket(id: string, input: { title?: string; description?: string; category?: string; priority?: string; status?: string; assignedToId?: string | null }) {
    const ticket = await this.getTicket(id);
    if (!ticket) throw new Error('Ticket not found');

    const updatedTicket = await this.repository.updateTicket(id, {
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.priority ? { priority: input.priority as any } : {}),
      ...(input.status ? { status: input.status as any } : {}),
      ...(input.assignedToId !== undefined ? { assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : { disconnect: true } } : {}),
    } as any);

    await notificationService.sendToEmployee(ticket.employeeId, 'Helpdesk ticket updated', `Ticket ${updatedTicket.ticketNumber} has been updated.`, 'INFO', { ticketId: updatedTicket.id, status: updatedTicket.status });
    if (updatedTicket.assignedToId && updatedTicket.assignedToId !== ticket.employeeId) {
      await notificationService.sendToEmployee(updatedTicket.assignedToId, 'Helpdesk ticket assigned', `You have been assigned ticket ${updatedTicket.ticketNumber}.`, 'INFO', { ticketId: updatedTicket.id, status: updatedTicket.status });
    }

    return updatedTicket;
  }

  async deleteTicket(id: string) {
    const ticket = await this.getTicket(id);
    if (!ticket) throw new Error('Ticket not found');
    return this.repository.deleteTicket(id);
  }

  async addComment(ticketId: string, userId: string, message: string) {
    return this.repository.addComment({
      ticket: { connect: { id: ticketId } },
      user: { connect: { id: userId } },
      message,
    } as any);
  }

  async getDashboardStats() {
    return this.repository.getDashboardStats();
  }
}

export const helpdeskService = new HelpdeskService(helpdeskRepository);

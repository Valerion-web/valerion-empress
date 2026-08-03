import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class HelpdeskRepository {
  async createTicket(data: Prisma.HelpdeskTicketCreateInput) {
    return prisma.helpdeskTicket.create({ data });
  }

  async listTickets(params: { page: number; limit: number; search?: string; status?: string; priority?: string; category?: string; assignedToId?: string; employeeId?: string; userRole?: string }) {
    const skip = (params.page - 1) * params.limit;
    const where: Prisma.HelpdeskTicketWhereInput = {
      ...(params.employeeId ? { employeeId: params.employeeId } : {}),
      ...(params.assignedToId ? { assignedToId: params.assignedToId } : {}),
      ...(params.status ? { status: params.status as Prisma.EnumTicketStatusFilter } : {}),
      ...(params.priority ? { priority: params.priority as Prisma.EnumTicketPriorityFilter } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.search ? {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { ticketNumber: { contains: params.search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.helpdeskTicket.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          comments: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        },
      }),
      prisma.helpdeskTicket.count({ where }),
    ]);

    return { items, total, page: params.page, limit: params.limit };
  }

  async getTicketById(id: string) {
    return prisma.helpdeskTicket.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        comments: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
    });
  }

  async updateTicket(id: string, data: Prisma.HelpdeskTicketUpdateInput) {
    return prisma.helpdeskTicket.update({
      where: { id },
      data,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        comments: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
    });
  }

  async deleteTicket(id: string) {
    return prisma.helpdeskTicket.delete({ where: { id } });
  }

  async addComment(data: Prisma.HelpdeskTicketCommentCreateInput) {
    return prisma.helpdeskTicketComment.create({
      data,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async getDashboardStats() {
    const [total, open, inProgress, resolved, byPriority] = await Promise.all([
      prisma.helpdeskTicket.count(),
      prisma.helpdeskTicket.count({ where: { status: 'OPEN' } }),
      prisma.helpdeskTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.helpdeskTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.helpdeskTicket.groupBy({ by: ['priority'], _count: { _all: true } }),
    ]);

    return { total, open, inProgress, resolved, byPriority };
  }
}

export const helpdeskRepository = new HelpdeskRepository();

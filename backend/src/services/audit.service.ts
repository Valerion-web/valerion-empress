import PDFDocument from 'pdfkit';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export interface AuditLogFilters {
  q?: string;
  userId?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AuditService {
  async recordAction(payload: {
    userId?: string | null;
    action: string;
    module: string;
    entity?: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const action = String(payload.action || 'ACTION').toUpperCase();
    const module = String(payload.module || payload.entity || 'SYSTEM');
    const log = await prisma.auditLog.create({
      data: {
        userId: payload.userId ?? null,
        action,
        entity: payload.entity || module,
        entityId: payload.entityId ?? null,
        metadata: {
          ...(payload.metadata ?? {}),
          module,
          action,
          timestamp: new Date().toISOString(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    logger.info(`Audit event recorded: ${action} in ${module}${payload.userId ? ` for user ${payload.userId}` : ' by system'}`);
    return this.normalize(log);
  }

  async listLogs(filters: AuditLogFilters = {}) {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';

    const where: Record<string, unknown> = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.action ? { action: { contains: filters.action, mode: 'insensitive' } } : {}),
      ...(filters.module ? { OR: [{ entity: { contains: filters.module, mode: 'insensitive' } }, { metadata: { path: ['module'], string_contains: filters.module } }] } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(new Date(filters.endDate).getTime() + 86400000) } : {}),
            },
          }
        : {}),
    };

    const searchTerm = (filters.q ?? '').trim();
    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where: searchTerm
          ? {
              ...where,
              OR: [
                { action: { contains: searchTerm, mode: 'insensitive' } },
                { entity: { contains: searchTerm, mode: 'insensitive' } },
                { entityId: { contains: searchTerm, mode: 'insensitive' } },
                { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
              ],
            }
          : where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: { select: { name: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({
        where: searchTerm
          ? {
              ...where,
              OR: [
                { action: { contains: searchTerm, mode: 'insensitive' } },
                { entity: { contains: searchTerm, mode: 'insensitive' } },
                { entityId: { contains: searchTerm, mode: 'insensitive' } },
                { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
              ],
            }
          : where,
      }),
    ]);

    return {
      items: items.map((item) => this.normalize(item)),
      total,
      page,
      limit,
    };
  }

  async exportCsv(filters: AuditLogFilters = {}) {
    const data = await this.listLogs(filters);
    const rows = [
      ['Timestamp', 'User', 'Action', 'Module', 'Entity', 'Entity ID', 'Metadata'],
      ...data.items.map((item) => [
        new Date(item.timestamp).toISOString(),
        item.user || 'System',
        item.action,
        item.module,
        item.entity,
        item.entityId ?? '',
        JSON.stringify(item.metadata ?? {}),
      ]),
    ];

    return rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  async exportPdf(filters: AuditLogFilters = {}) {
    const data = await this.listLogs(filters);
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const chunks: Buffer[] = [];

    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Valerion HR Audit Logs', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
      doc.moveDown();

      data.items.slice(0, 40).forEach((log) => {
        doc.fontSize(10).text(`${new Date(log.timestamp).toISOString()} | ${log.user || 'System'} | ${log.action} | ${log.module}`);
        doc.text(`Entity: ${log.entity}${log.entityId ? ` (${log.entityId})` : ''}`);
        if (log.metadata && Object.keys(log.metadata).length > 0) {
          doc.text(`Metadata: ${JSON.stringify(log.metadata)}`);
        }
        doc.moveDown();
      });

      doc.end();
    });
  }

  private normalize(log: any) {
    const metadata = (log.metadata ?? {}) as Record<string, unknown>;
    return {
      id: log.id,
      userId: log.userId,
      user: log.user
        ? `${log.user.firstName ?? ''} ${log.user.lastName ?? ''}`.trim() || log.user.email || 'System'
        : 'System',
      action: log.action,
      module: (metadata.module as string) ?? log.entity ?? 'SYSTEM',
      entity: log.entity,
      entityId: log.entityId,
      metadata,
      timestamp: log.createdAt,
    };
  }
}

export const auditService = new AuditService();

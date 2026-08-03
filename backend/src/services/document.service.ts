import { documentRepository } from '../repositories/document.repository.js';
import { Prisma } from '@prisma/client';

type DocumentActor = { id: string; role: string };

const canAccessDocument = (actor: DocumentActor, ownerId: string) => actor.id === ownerId || ['HR_ADMIN', 'SUPER_ADMIN'].includes(actor.role);

export class DocumentService {
  async uploadDocument(employeeId: string, documentName: string, documentType: string, fileUrl: string, _actorId: string) {
    const data: Prisma.DocumentCreateInput = {
      userId: employeeId,
      title: documentName,
      category: documentType,
      storageUrl: fileUrl,
      uploadedAt: new Date(),
    } as any;
    return documentRepository.create(data);
  }

  async get(id: string, actor: DocumentActor) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new Error('Document not found');
    if (!canAccessDocument(actor, doc.userId)) throw new Error('Forbidden');
    return doc;
  }

  async list(query: { q?: string; documentType?: string; page?: number; limit?: number }, actor: DocumentActor) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const baseWhere: Prisma.DocumentWhereInput = actor.role === 'HR_ADMIN' || actor.role === 'SUPER_ADMIN' ? {} : { userId: actor.id };
    const where: Prisma.DocumentWhereInput = {
      ...baseWhere,
      ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }),
      ...(query.documentType && { category: query.documentType }),
    };
    return documentRepository.list(where, page, limit);
  }

  async listByEmployee(employeeId: string, page = 1, limit = 20, actor: DocumentActor) {
    if (!canAccessDocument(actor, employeeId)) throw new Error('Forbidden');
    return documentRepository.listByEmployee(employeeId, page, limit);
  }

  async delete(id: string, actor: DocumentActor) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new Error('Document not found');
    if (!canAccessDocument(actor, doc.userId)) throw new Error('Forbidden');
    return documentRepository.delete(id);
  }
}

export const documentService = new DocumentService();

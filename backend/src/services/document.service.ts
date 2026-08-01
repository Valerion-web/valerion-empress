import { documentRepository } from '../repositories/document.repository.js';
import { Prisma } from '@prisma/client';

export class DocumentService {
  async uploadDocument(employeeId: string, documentName: string, documentType: string, fileUrl: string, actorId: string) {
    // only allow uploading on behalf of another employee if actor has privileges is enforced in controller
    const data: Prisma.DocumentCreateInput = { userId: employeeId, title: documentName, category: documentType, storageUrl: fileUrl, uploadedAt: new Date() } as any;
    return documentRepository.create(data);
  }

  async get(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new Error('Document not found');
    return doc;
  }

  async list(query: { q?: string; documentType?: string; page?: number; limit?: number }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: Prisma.DocumentWhereInput = { ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }), ...(query.documentType && { category: query.documentType }) };
    return documentRepository.list(where, page, limit);
  }

  async listByEmployee(employeeId: string, page = 1, limit = 20) {
    return documentRepository.listByEmployee(employeeId, page, limit);
  }

  async delete(id: string) {
    return documentRepository.delete(id);
  }
}

export const documentService = new DocumentService();

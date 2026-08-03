import { prisma } from '../config/prisma.js';

export type OnboardingTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type OnboardingApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OnboardingStage = 'DRAFT' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'APPROVED';

export interface OnboardingTask {
  id: string;
  title: string;
  owner: string;
  dueDate?: string;
  status: OnboardingTaskStatus;
}

export interface OnboardingDocument {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: string;
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId?: string | null;
  role: string;
  startDate: string;
  stage: OnboardingStage;
  approvalStatus: OnboardingApprovalStatus;
  completionPercentage: number;
  tasks: OnboardingTask[];
  documents: OnboardingDocument[];
  createdAt: string;
  updatedAt: string;
}

export type OffboardingStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'PENDING_CLEARANCE' | 'APPROVED' | 'COMPLETED';
export type ClearanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type AssetReturnStatus = 'PENDING' | 'RETURNED';

export interface OffboardingChecklistItem {
  id: string;
  name: string;
  status: ClearanceStatus;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  resignationDate: string;
  reason: string;
  status: OffboardingStatus;
  exitInterview?: string | null;
  assetReturnStatus: AssetReturnStatus;
  settlementAmount: number;
  clearanceItems: OffboardingChecklistItem[];
  finalComments?: string | null;
  createdAt: string;
  updatedAt: string;
}

const normalizeOnboardingRecord = (record: any): OnboardingRecord => ({
  id: record.id,
  employeeId: record.employeeId,
  employeeName: record.employee?.firstName && record.employee?.lastName ? `${record.employee.firstName} ${record.employee.lastName}`.trim() : record.employeeName || 'Employee',
  managerId: record.managerId ?? null,
  role: record.role,
  startDate: record.startDate.toISOString(),
  stage: record.stage as OnboardingStage,
  approvalStatus: record.approvalStatus as OnboardingApprovalStatus,
  completionPercentage: Number(record.completionPercentage ?? 0),
  tasks: (record.tasks ?? []).map((task: any) => ({
    id: task.id,
    title: task.title,
    owner: task.owner,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    status: task.status as OnboardingTaskStatus,
  })),
  documents: (record.documents ?? []).map((document: any) => ({
    id: document.id,
    fileName: document.fileName,
    category: document.category,
    uploadedAt: document.uploadedAt ? new Date(document.uploadedAt).toISOString() : new Date().toISOString(),
  })),
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

const normalizeOffboardingRecord = (record: any): OffboardingRecord => ({
  id: record.id,
  employeeId: record.employeeId,
  employeeName: record.employeeName,
  resignationDate: record.resignationDate.toISOString(),
  reason: record.reason,
  status: record.status as OffboardingStatus,
  exitInterview: record.exitInterview ?? null,
  assetReturnStatus: record.assetReturnStatus as AssetReturnStatus,
  settlementAmount: Number(record.settlementAmount ?? 0),
  clearanceItems: (record.clearanceItems ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    status: item.status as ClearanceStatus,
  })),
  finalComments: record.finalComments ?? null,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

const buildPercentage = (tasks: OnboardingTask[]) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
};

export class OnboardingRepository {
  async list() {
    const records = await prisma.onboardingRecord.findMany({
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(normalizeOnboardingRecord);
  }

  async listForEmployee(employeeId: string) {
    const records = await prisma.onboardingRecord.findMany({
      where: { employeeId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(normalizeOnboardingRecord);
  }

  async get(id: string) {
    const record = await prisma.onboardingRecord.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return record ? normalizeOnboardingRecord(record) : null;
  }

  async create(input: Omit<OnboardingRecord, 'id' | 'completionPercentage' | 'createdAt' | 'updatedAt'> & { id?: string; tasks?: OnboardingTask[]; documents?: OnboardingDocument[] }) {
    const tasks = input.tasks ?? [];
    const documents = input.documents ?? [];
    const record = await prisma.onboardingRecord.create({
      data: {
        id: input.id,
        employeeId: input.employeeId,
        managerId: input.managerId ?? null,
        role: input.role,
        startDate: new Date(input.startDate),
        stage: input.stage ?? 'DRAFT',
        approvalStatus: input.approvalStatus ?? 'PENDING',
        completionPercentage: buildPercentage(tasks),
        tasks: {
          create: tasks.map((task) => ({
            title: task.title,
            owner: task.owner,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            status: task.status ?? 'PENDING',
          })),
        },
        documents: {
          create: documents.map((document) => ({
            fileName: document.fileName,
            category: document.category ?? 'GENERAL',
            uploadedAt: document.uploadedAt ? new Date(document.uploadedAt) : new Date(),
          })),
        },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return normalizeOnboardingRecord(record);
  }

  async addTasks(id: string, tasks: OnboardingTask[]) {
    if (!tasks.length) return this.get(id);

    const record = await prisma.onboardingRecord.update({
      where: { id },
      data: {
        tasks: {
          create: tasks.map((task) => ({
            title: task.title,
            owner: task.owner,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            status: task.status ?? 'PENDING',
          })),
        },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    const taskList = record.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      owner: task.owner,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      status: task.status as OnboardingTaskStatus,
    }));

    const completionPercentage = buildPercentage(taskList);
    const updated = await prisma.onboardingRecord.update({
      where: { id },
      data: { completionPercentage, stage: completionPercentage >= 100 ? 'PENDING_APPROVAL' : 'IN_PROGRESS' },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    return normalizeOnboardingRecord(updated);
  }

  async updateTask(id: string, taskId: string, status: OnboardingTaskStatus) {
    await prisma.onboardingTask.update({ where: { id: taskId }, data: { status } });
    const record = await prisma.onboardingRecord.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!record) return null;
    const completionPercentage = buildPercentage(record.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      owner: task.owner,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      status: task.status as OnboardingTaskStatus,
    })));
    const updated = await prisma.onboardingRecord.update({
      where: { id },
      data: {
        completionPercentage,
        stage: completionPercentage >= 100 ? 'PENDING_APPROVAL' : 'IN_PROGRESS',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return normalizeOnboardingRecord(updated);
  }

  async uploadDocument(id: string, document: OnboardingDocument) {
    const record = await prisma.onboardingRecord.update({
      where: { id },
      data: {
        documents: {
          create: {
            fileName: document.fileName,
            category: document.category ?? 'GENERAL',
            uploadedAt: document.uploadedAt ? new Date(document.uploadedAt) : new Date(),
          },
        },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return normalizeOnboardingRecord(record);
  }

  async approve(id: string, status: OnboardingApprovalStatus, comments?: string) {
    const record = await prisma.onboardingRecord.update({
      where: { id },
      data: {
        approvalStatus: status,
        stage: status === 'APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return normalizeOnboardingRecord(record);
  }

  async getDashboard() {
    const [total, approved, pendingApproval, records] = await Promise.all([
      prisma.onboardingRecord.count(),
      prisma.onboardingRecord.count({ where: { stage: 'APPROVED' } }),
      prisma.onboardingRecord.count({ where: { stage: 'PENDING_APPROVAL' } }),
      prisma.onboardingRecord.findMany({ select: { completionPercentage: true } }),
    ]);

    const averageProgress = records.length > 0 ? Math.round(records.reduce((sum, record) => sum + Number(record.completionPercentage ?? 0), 0) / records.length) : 0;
    return { total, approved, pendingApproval, averageProgress };
  }
}

export class OffboardingRepository {
  async list() {
    const records = await prisma.offboardingRecord.findMany({
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        clearanceItems: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(normalizeOffboardingRecord);
  }

  async get(id: string) {
    const record = await prisma.offboardingRecord.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        clearanceItems: { orderBy: { createdAt: 'asc' } },
      },
    });
    return record ? normalizeOffboardingRecord(record) : null;
  }

  async create(input: Omit<OffboardingRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const record = await prisma.offboardingRecord.create({
      data: {
        id: input.id,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        resignationDate: new Date(input.resignationDate),
        reason: input.reason,
        status: input.status ?? 'SUBMITTED',
        exitInterview: input.exitInterview ?? null,
        assetReturnStatus: input.assetReturnStatus ?? 'PENDING',
        settlementAmount: input.settlementAmount ?? 0,
        finalComments: input.finalComments ?? null,
        clearanceItems: {
          create: (input.clearanceItems ?? []).map((item) => ({
            name: item.name,
            status: item.status ?? 'PENDING',
          })),
        },
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        clearanceItems: { orderBy: { createdAt: 'asc' } },
      },
    });
    return normalizeOffboardingRecord(record);
  }

  async updateExitInterview(id: string, interview: string) {
    const record = await prisma.offboardingRecord.update({
      where: { id },
      data: { exitInterview: interview },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, clearanceItems: { orderBy: { createdAt: 'asc' } } },
    });
    return normalizeOffboardingRecord(record);
  }

  async updateAssetReturn(id: string, status: AssetReturnStatus) {
    const record = await prisma.offboardingRecord.update({
      where: { id },
      data: { assetReturnStatus: status },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, clearanceItems: { orderBy: { createdAt: 'asc' } } },
    });
    return normalizeOffboardingRecord(record);
  }

  async updateClearance(id: string, clearanceItems: OffboardingChecklistItem[]) {
    const record = await prisma.offboardingRecord.update({
      where: { id },
      data: {
        clearanceItems: {
          deleteMany: {},
          create: clearanceItems.map((item) => ({
            name: item.name,
            status: item.status ?? 'PENDING',
          })),
        },
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, clearanceItems: { orderBy: { createdAt: 'asc' } } },
    });
    return normalizeOffboardingRecord(record);
  }

  async updateSettlement(id: string, settlementAmount: number, finalComments?: string | null) {
    const record = await prisma.offboardingRecord.update({
      where: { id },
      data: { settlementAmount, finalComments: finalComments ?? null },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, clearanceItems: { orderBy: { createdAt: 'asc' } } },
    });
    return normalizeOffboardingRecord(record);
  }

  async updateStatus(id: string, status: OffboardingStatus) {
    const record = await prisma.offboardingRecord.update({
      where: { id },
      data: { status },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, clearanceItems: { orderBy: { createdAt: 'asc' } } },
    });
    return normalizeOffboardingRecord(record);
  }
}

export const onboardingRepository = new OnboardingRepository();
export const offboardingRepository = new OffboardingRepository();

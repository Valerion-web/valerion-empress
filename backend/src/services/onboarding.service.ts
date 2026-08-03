import { prisma } from '../config/prisma.js';
import { offboardingRepository, onboardingRepository, type OnboardingTask, type OnboardingTaskStatus, type OnboardingApprovalStatus, type OnboardingRecord, type OffboardingRecord } from '../repositories/onboarding.repository.js';

export class OnboardingService {
  async createRecord(input: { employeeId: string; managerId?: string | null; role?: string; startDate?: string; employeeName?: string }) {
    const user = await prisma.user.findUnique({ where: { id: input.employeeId }, include: { role: true } });
    if (!user) throw new Error('Employee not found');

    const fallbackName = `${user.firstName} ${user.lastName}`.trim();
    const tasks: OnboardingTask[] = [
      { id: crypto.randomUUID(), title: 'Complete identity and compliance documents', owner: 'Employee', dueDate: input.startDate ?? new Date().toISOString(), status: 'PENDING' },
      { id: crypto.randomUUID(), title: 'Set up payroll and banking details', owner: 'HR', dueDate: input.startDate ?? new Date().toISOString(), status: 'PENDING' },
      { id: crypto.randomUUID(), title: 'Assign equipment and access cards', owner: 'IT', dueDate: input.startDate ?? new Date().toISOString(), status: 'PENDING' },
      { id: crypto.randomUUID(), title: 'Review onboarding checklist with manager', owner: 'Manager', dueDate: input.startDate ?? new Date().toISOString(), status: 'PENDING' },
    ];

    return onboardingRepository.create({
      employeeId: input.employeeId,
      employeeName: input.employeeName ?? fallbackName,
      managerId: input.managerId ?? user.managerId ?? null,
      role: input.role ?? user.role?.name ?? 'EMPLOYEE',
      startDate: input.startDate ?? new Date().toISOString(),
      stage: 'IN_PROGRESS',
      approvalStatus: 'PENDING',
      tasks,
      documents: [],
    });
  }

  async listRecords() {
    return onboardingRepository.list();
  }

  async getRecord(id: string) {
    const record = onboardingRepository.get(id);
    if (!record) throw new Error('Onboarding record not found');
    return record;
  }

  async assignTasks(id: string, tasks: Omit<OnboardingTask, 'id'>[]) {
    const record = await this.getRecord(id);
    if (!record) throw new Error('Onboarding record not found');
    const mappedTasks = tasks.map((task) => ({
      id: crypto.randomUUID(),
      title: task.title,
      owner: task.owner,
      dueDate: task.dueDate,
      status: task.status ?? 'PENDING',
    }));
    const updated = onboardingRepository.addTasks(id, mappedTasks);
    if (!updated) throw new Error('Unable to assign tasks');
    return updated;
  }

  async updateTaskStatus(id: string, taskId: string, status: OnboardingTaskStatus) {
    const updated = onboardingRepository.updateTask(id, taskId, status);
    if (!updated) throw new Error('Task update failed');
    return updated;
  }

  async uploadDocument(id: string, fileName: string, category: string) {
    const record = await this.getRecord(id);
    if (!record) throw new Error('Onboarding record not found');
    const uploaded = onboardingRepository.uploadDocument(id, {
      id: crypto.randomUUID(),
      fileName,
      category,
      uploadedAt: new Date().toISOString(),
    });
    if (!uploaded) throw new Error('Document upload failed');
    return uploaded;
  }

  async approveRecord(id: string, status: OnboardingApprovalStatus, comments?: string) {
    const approved = onboardingRepository.approve(id, status, comments);
    if (!approved) throw new Error('Onboarding record not found');
    return approved;
  }

  async getDashboard() {
    return onboardingRepository.getDashboard();
  }

  async getMyChecklist(employeeId: string) {
    const records = onboardingRepository.listForEmployee(employeeId);
    return records.length > 0 ? records[0] : null;
  }

  async createResignationRequest(input: { employeeId: string; employeeName?: string; reason: string; resignationDate?: string }) {
    const user = await prisma.user.findUnique({ where: { id: input.employeeId } });
    if (!user) throw new Error('Employee not found');

    const record: OffboardingRecord = {
      id: crypto.randomUUID(),
      employeeId: input.employeeId,
      employeeName: input.employeeName ?? `${user.firstName} ${user.lastName}`.trim(),
      resignationDate: input.resignationDate ?? new Date().toISOString(),
      reason: input.reason,
      status: 'SUBMITTED',
      exitInterview: null,
      assetReturnStatus: 'PENDING',
      settlementAmount: 0,
      clearanceItems: [
        { id: crypto.randomUUID(), name: 'Asset return', status: 'PENDING' },
        { id: crypto.randomUUID(), name: 'Manager clearance', status: 'PENDING' },
        { id: crypto.randomUUID(), name: 'HR approval', status: 'PENDING' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return offboardingRepository.create(record);
  }

  async listOffboardingRecords() {
    return offboardingRepository.list();
  }

  async getOffboardingRecord(id: string) {
    const record = offboardingRepository.get(id);
    if (!record) throw new Error('Offboarding record not found');
    return record;
  }

  async updateExitInterview(id: string, interview: string) {
    const updated = offboardingRepository.updateExitInterview(id, interview);
    if (!updated) throw new Error('Offboarding record not found');
    return updated;
  }

  async updateAssetReturn(id: string, status: 'PENDING' | 'RETURNED') {
    const updated = offboardingRepository.updateAssetReturn(id, status);
    if (!updated) throw new Error('Offboarding record not found');
    return updated;
  }

  async updateClearance(id: string, clearanceItems: Array<{ id: string; name: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }>) {
    const updated = offboardingRepository.updateClearance(id, clearanceItems);
    if (!updated) throw new Error('Offboarding record not found');
    return updated;
  }

  async updateSettlement(id: string, settlementAmount: number, finalComments?: string | null) {
    const updated = offboardingRepository.updateSettlement(id, settlementAmount, finalComments ?? null);
    if (!updated) throw new Error('Offboarding record not found');
    return updated;
  }

  async updateStatus(id: string, status: 'SUBMITTED' | 'IN_PROGRESS' | 'PENDING_CLEARANCE' | 'APPROVED' | 'COMPLETED') {
    const updated = offboardingRepository.updateStatus(id, status);
    if (!updated) throw new Error('Offboarding record not found');
    return updated;
  }
}

export const onboardingService = new OnboardingService();

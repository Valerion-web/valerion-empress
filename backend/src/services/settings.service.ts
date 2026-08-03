import { prisma } from '../config/prisma.js';

const parseJsonValue = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const serializeValue = (value: unknown) => JSON.stringify(value);

export class SettingsService {
  async getCompanyProfile() {
    const profile = await prisma.settings.findUnique({ where: { key: 'company_profile' } });
    return parseJsonValue(profile?.value ?? null, {
      companyName: '',
      legalName: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      timezone: 'UTC',
      logoUrl: '',
    });
  }

  async updateCompanyProfile(data: Record<string, unknown>) {
    const payload = {
      companyName: String(data.companyName ?? '').trim(),
      legalName: String(data.legalName ?? '').trim(),
      industry: String(data.industry ?? '').trim(),
      website: String(data.website ?? '').trim(),
      email: String(data.email ?? '').trim(),
      phone: String(data.phone ?? '').trim(),
      address: String(data.address ?? '').trim(),
      city: String(data.city ?? '').trim(),
      country: String(data.country ?? '').trim(),
      timezone: String(data.timezone ?? 'UTC').trim(),
      logoUrl: String(data.logoUrl ?? '').trim(),
    };

    if (!payload.companyName || !payload.email) {
      throw new Error('Company name and email are required');
    }

    return prisma.settings.upsert({
      where: { key: 'company_profile' },
      update: { value: serializeValue(payload), category: 'company' },
      create: { key: 'company_profile', value: serializeValue(payload), category: 'company' },
    });
  }

  async listDepartments(filters: { q?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { code: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.department.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.department.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createDepartment(data: { name: string; code: string; description?: string; status?: string }) {
    const name = String(data.name ?? '').trim();
    const code = String(data.code ?? '').trim();
    if (!name || !code) throw new Error('Department name and code are required');

    return prisma.department.create({
      data: {
        name,
        code,
        description: data.description ? String(data.description) : null,
        status: (data.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      },
    });
  }

  async updateDepartment(id: string, data: Record<string, unknown>) {
    const record = await prisma.department.findUnique({ where: { id } });
    if (!record) throw new Error('Department not found');

    return prisma.department.update({
      where: { id },
      data: {
        ...(data.name ? { name: String(data.name) } : {}),
        ...(data.code ? { code: String(data.code) } : {}),
        ...(data.description !== undefined ? { description: String(data.description) || null } : {}),
        ...(data.status ? { status: data.status as 'ACTIVE' | 'INACTIVE' } : {}),
      },
    });
  }

  async deleteDepartment(id: string) {
    const record = await prisma.department.findUnique({ where: { id } });
    if (!record) throw new Error('Department not found');
    return prisma.department.delete({ where: { id } });
  }

  async listDesignations(filters: { q?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.designation.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.designation.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createDesignation(data: { name: string; level: number; description?: string }) {
    const name = String(data.name ?? '').trim();
    if (!name || Number.isNaN(Number(data.level))) throw new Error('Designation name and level are required');

    return prisma.designation.create({
      data: {
        name,
        level: Number(data.level),
        description: data.description ? String(data.description) : null,
      },
    });
  }

  async updateDesignation(id: string, data: Record<string, unknown>) {
    const record = await prisma.designation.findUnique({ where: { id } });
    if (!record) throw new Error('Designation not found');

    return prisma.designation.update({
      where: { id },
      data: {
        ...(data.name ? { name: String(data.name) } : {}),
        ...(data.level !== undefined ? { level: Number(data.level) } : {}),
        ...(data.description !== undefined ? { description: String(data.description) || null } : {}),
      },
    });
  }

  async deleteDesignation(id: string) {
    const record = await prisma.designation.findUnique({ where: { id } });
    if (!record) throw new Error('Designation not found');
    return prisma.designation.delete({ where: { id } });
  }

  async listOfficeLocations(filters: { q?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { code: { contains: filters.q, mode: 'insensitive' } },
        { address: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.branch.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.branch.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createOfficeLocation(data: { name: string; code: string; address?: string; phone?: string }) {
    const name = String(data.name ?? '').trim();
    const code = String(data.code ?? '').trim();
    if (!name || !code) throw new Error('Office location name and code are required');

    return prisma.branch.create({
      data: {
        name,
        code,
        address: data.address ? String(data.address) : null,
        phone: data.phone ? String(data.phone) : null,
      },
    });
  }

  async updateOfficeLocation(id: string, data: Record<string, unknown>) {
    const record = await prisma.branch.findUnique({ where: { id } });
    if (!record) throw new Error('Office location not found');

    return prisma.branch.update({
      where: { id },
      data: {
        ...(data.name ? { name: String(data.name) } : {}),
        ...(data.code ? { code: String(data.code) } : {}),
        ...(data.address !== undefined ? { address: String(data.address) || null } : {}),
        ...(data.phone !== undefined ? { phone: String(data.phone) || null } : {}),
      },
    });
  }

  async deleteOfficeLocation(id: string) {
    const record = await prisma.branch.findUnique({ where: { id } });
    if (!record) throw new Error('Office location not found');
    return prisma.branch.delete({ where: { id } });
  }

  async listShifts(filters: { q?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 20)));
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.shift.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.shift.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createShift(data: { name: string; startTime: string; endTime: string; description?: string }) {
    const name = String(data.name ?? '').trim();
    const startTime = String(data.startTime ?? '').trim();
    const endTime = String(data.endTime ?? '').trim();
    if (!name || !startTime || !endTime) throw new Error('Name, start time, and end time are required');

    return prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        description: data.description ? String(data.description) : null,
      },
    });
  }

  async updateShift(id: string, data: Record<string, unknown>) {
    const record = await prisma.shift.findUnique({ where: { id } });
    if (!record) throw new Error('Shift not found');

    return prisma.shift.update({
      where: { id },
      data: {
        ...(data.name ? { name: String(data.name) } : {}),
        ...(data.startTime ? { startTime: String(data.startTime) } : {}),
        ...(data.endTime ? { endTime: String(data.endTime) } : {}),
        ...(data.description !== undefined ? { description: String(data.description) || null } : {}),
      },
    });
  }

  async deleteShift(id: string) {
    const record = await prisma.shift.findUnique({ where: { id } });
    if (!record) throw new Error('Shift not found');
    return prisma.shift.delete({ where: { id } });
  }

  async getLeavePolicy() {
    const setting = await prisma.settings.findUnique({ where: { key: 'leave_policy' } });
    return parseJsonValue(setting?.value ?? null, {
      annualLeaveDays: 20,
      sickLeaveDays: 10,
      carryForwardDays: 5,
      approvalRequired: true,
      maxConsecutiveDays: 14,
    });
  }

  async updateLeavePolicy(data: Record<string, unknown>) {
    const payload = {
      annualLeaveDays: Number(data.annualLeaveDays ?? 20),
      sickLeaveDays: Number(data.sickLeaveDays ?? 10),
      carryForwardDays: Number(data.carryForwardDays ?? 5),
      approvalRequired: Boolean(data.approvalRequired ?? true),
      maxConsecutiveDays: Number(data.maxConsecutiveDays ?? 14),
    };

    return prisma.settings.upsert({
      where: { key: 'leave_policy' },
      update: { value: serializeValue(payload), category: 'leave' },
      create: { key: 'leave_policy', value: serializeValue(payload), category: 'leave' },
    });
  }

  async getPayrollSettings() {
    const setting = await prisma.settings.findUnique({ where: { key: 'payroll_settings' } });
    return parseJsonValue(setting?.value ?? null, {
      currency: 'USD',
      payFrequency: 'MONTHLY',
      overtimeRate: 1.5,
      taxRate: 0.1,
      lateFeeThreshold: 15,
    });
  }

  async updatePayrollSettings(data: Record<string, unknown>) {
    const payload = {
      currency: String(data.currency ?? 'USD'),
      payFrequency: String(data.payFrequency ?? 'MONTHLY'),
      overtimeRate: Number(data.overtimeRate ?? 1.5),
      taxRate: Number(data.taxRate ?? 0.1),
      lateFeeThreshold: Number(data.lateFeeThreshold ?? 15),
    };

    return prisma.settings.upsert({
      where: { key: 'payroll_settings' },
      update: { value: serializeValue(payload), category: 'payroll' },
      create: { key: 'payroll_settings', value: serializeValue(payload), category: 'payroll' },
    });
  }
}

export const settingsService = new SettingsService();

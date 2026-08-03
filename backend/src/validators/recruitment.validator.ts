import { z } from 'zod';

export const recruitmentIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const createRecruitmentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    departmentId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    status: z.enum(['OPEN', 'CLOSED', 'FILLED']).optional(),
    openPositions: z.number().int().positive(),
    budget: z.number().nonnegative().optional(),
  }),
});

export const updateRecruitmentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    departmentId: z.string().uuid().nullable().optional(),
    managerId: z.string().uuid().nullable().optional(),
    status: z.enum(['OPEN', 'CLOSED', 'FILLED']).optional(),
    openPositions: z.number().int().positive().optional(),
    budget: z.number().nonnegative().nullable().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one update field is required'),
});

export const paginationQuery = z.object({ query: z.object({ page: z.string().optional(), limit: z.string().optional(), search: z.string().optional(), status: z.string().optional(), departmentId: z.string().optional() }).optional() });

export const candidateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED']).optional(),
  }),
});

export const candidateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED']),
  }),
});

export const interviewSchema = z.object({
  body: z.object({
    scheduledAt: z.string().min(1),
    mode: z.string().optional(),
    round: z.number().int().positive().optional(),
    feedback: z.string().optional(),
  }),
});

export const offerSchema = z.object({
  body: z.object({
    candidateId: z.string().uuid(),
    offeredSalary: z.number().nonnegative(),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED']).optional(),
  }),
});

export const offerUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED']),
    offeredSalary: z.number().nonnegative().optional(),
  }),
});

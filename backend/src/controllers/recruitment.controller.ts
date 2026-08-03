import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { notificationService } from '../services/notification.service.js';
import { buildApiResponse } from '../utils/api-response.js';

function recruitmentData(body: Record<string, unknown>) {
  return {
    title: body.title as string,
    departmentId: body.departmentId as string | undefined,
    managerId: body.managerId as string | undefined,
    status: (body.status as 'OPEN' | 'CLOSED' | 'FILLED' | undefined) ?? 'OPEN',
    openPositions: body.openPositions as number,
    budget: body.budget as number | undefined,
  };
}

function candidateData(body: Record<string, unknown>) {
  return {
    firstName: body.firstName as string,
    lastName: body.lastName as string,
    email: body.email as string,
    phone: body.phone as string | undefined,
    source: body.source as string | undefined,
    status: (body.status as 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED' | undefined) ?? 'APPLIED',
  };
}

export const createRecruitment = async (req: Request, res: Response) => {
  try {
    const recruitment = await prisma.recruitment.create({ data: recruitmentData(req.body) });
    return res.status(201).json(buildApiResponse('Recruitment created successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getRecruitments = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;

    const where = {
      ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(status ? { status: status as 'OPEN' | 'CLOSED' | 'FILLED' } : {}),
      ...(departmentId ? { departmentId } : {}),
    };

    const [recruitments, total] = await prisma.$transaction([
      prisma.recruitment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { id: true, name: true } }, manager: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.recruitment.count({ where }),
    ]);
    return res.status(200).json(buildApiResponse('Recruitments retrieved successfully', { recruitments, total, page, limit }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recruitments';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getRecruitmentById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        jobs: { include: { candidates: { include: { interviews: true, offerLetters: true } } } },
      },
    });
    if (!recruitment) return res.status(404).json(buildApiResponse('Recruitment not found', null, ['Recruitment not found']));
    return res.status(200).json(buildApiResponse('Recruitment retrieved successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const updateRecruitment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.update({ where: { id }, data: recruitmentData(req.body) });
    return res.status(200).json(buildApiResponse('Recruitment updated successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const deleteRecruitment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.delete({ where: { id } });
    return res.status(200).json(buildApiResponse('Recruitment deleted successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const candidate = await prisma.candidate.create({ data: { ...candidateData(req.body), jobId } });
    return res.status(201).json(buildApiResponse('Candidate created successfully', candidate));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create candidate';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listCandidates = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;

    const where = {
      ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {}),
      ...(status ? { status: status as 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED' } : {}),
      ...(jobId ? { jobId } : {}),
    };

    const [candidates, total] = await prisma.$transaction([
      prisma.candidate.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { job: { select: { id: true, title: true } }, interviews: true, offerLetters: true } }),
      prisma.candidate.count({ where }),
    ]);

    return res.status(200).json(buildApiResponse('Candidates retrieved successfully', { candidates, total, page, limit }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch candidates';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const updateCandidateStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const candidate = await prisma.candidate.update({ where: { id }, data: { status: req.body.status } });
    return res.status(200).json(buildApiResponse('Candidate status updated successfully', candidate));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update candidate status';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createInterview = async (req: Request, res: Response) => {
  try {
    const candidateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const interview = await prisma.interview.create({ data: { candidateId, scheduledAt: new Date(req.body.scheduledAt), mode: req.body.mode, round: req.body.round ?? 1, feedback: req.body.feedback, status: 'SCHEDULED' } });
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId }, include: { user: true } });
    if (candidate?.user) {
      await notificationService.sendToEmployee(candidate.user.id, 'Interview scheduled', `Your interview has been scheduled for ${new Date(req.body.scheduledAt).toLocaleString()}.`, 'INFO', { interviewId: interview.id, candidateId });
    }
    return res.status(201).json(buildApiResponse('Interview created successfully', interview));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create interview';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listInterviews = async (req: Request, res: Response) => {
  try {
    const candidateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const interviews = await prisma.interview.findMany({ where: { candidateId }, orderBy: { scheduledAt: 'asc' } });
    return res.status(200).json(buildApiResponse('Interviews retrieved successfully', interviews));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch interviews';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await prisma.offerLetter.create({ data: { candidateId: req.body.candidateId, offeredSalary: req.body.offeredSalary, status: req.body.status ?? 'DRAFT', issuedAt: new Date() } });
    return res.status(201).json(buildApiResponse('Offer created successfully', offer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create offer';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await prisma.offerLetter.findMany({ orderBy: { createdAt: 'desc' }, include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } } });
    return res.status(200).json(buildApiResponse('Offers retrieved successfully', offers));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch offers';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const offer = await prisma.offerLetter.update({ where: { id }, data: { status: req.body.status, offeredSalary: req.body.offeredSalary } });
    return res.status(200).json(buildApiResponse('Offer updated successfully', offer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update offer';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [openJobs, totalCandidates, interviewsThisWeek, offersPending] = await Promise.all([
      prisma.recruitment.count({ where: { status: 'OPEN' } }),
      prisma.candidate.count(),
      prisma.interview.count({ where: { scheduledAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } }),
      prisma.offerLetter.count({ where: { status: 'DRAFT' } }),
    ]);

    return res.status(200).json(buildApiResponse('Recruitment dashboard retrieved successfully', { openJobs, totalCandidates, interviewsThisWeek, offersPending }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

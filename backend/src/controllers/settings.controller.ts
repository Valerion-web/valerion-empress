import type { Request, Response } from 'express';
import { settingsService } from '../services/settings.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const id = (req: Request) => (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

export const getCompanyProfile = async (_req: Request, res: Response) => {
  try {
    const data = await settingsService.getCompanyProfile();
    return res.status(200).json(buildApiResponse('Company profile retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve company profile', null, [String(error)]));
  }
};

export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateCompanyProfile(req.body ?? {});
    return res.status(200).json(buildApiResponse('Company profile updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update company profile', null, [String(error)]));
  }
};

export const listDepartments = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.listDepartments({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return res.status(200).json(buildApiResponse('Departments retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve departments', null, [String(error)]));
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.createDepartment(req.body ?? {});
    return res.status(201).json(buildApiResponse('Department created successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to create department', null, [String(error)]));
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateDepartment(id(req), req.body ?? {});
    return res.status(200).json(buildApiResponse('Department updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update department', null, [String(error)]));
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.deleteDepartment(id(req));
    return res.status(200).json(buildApiResponse('Department deleted successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to delete department', null, [String(error)]));
  }
};

export const listDesignations = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.listDesignations({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return res.status(200).json(buildApiResponse('Designations retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve designations', null, [String(error)]));
  }
};

export const createDesignation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.createDesignation(req.body ?? {});
    return res.status(201).json(buildApiResponse('Designation created successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to create designation', null, [String(error)]));
  }
};

export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateDesignation(id(req), req.body ?? {});
    return res.status(200).json(buildApiResponse('Designation updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update designation', null, [String(error)]));
  }
};

export const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.deleteDesignation(id(req));
    return res.status(200).json(buildApiResponse('Designation deleted successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to delete designation', null, [String(error)]));
  }
};

export const listOfficeLocations = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.listOfficeLocations({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return res.status(200).json(buildApiResponse('Office locations retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve office locations', null, [String(error)]));
  }
};

export const createOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.createOfficeLocation(req.body ?? {});
    return res.status(201).json(buildApiResponse('Office location created successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to create office location', null, [String(error)]));
  }
};

export const updateOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateOfficeLocation(id(req), req.body ?? {});
    return res.status(200).json(buildApiResponse('Office location updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update office location', null, [String(error)]));
  }
};

export const deleteOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.deleteOfficeLocation(id(req));
    return res.status(200).json(buildApiResponse('Office location deleted successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to delete office location', null, [String(error)]));
  }
};

export const listShifts = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.listShifts({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return res.status(200).json(buildApiResponse('Shifts retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve shifts', null, [String(error)]));
  }
};

export const createShift = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.createShift(req.body ?? {});
    return res.status(201).json(buildApiResponse('Shift created successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to create shift', null, [String(error)]));
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateShift(id(req), req.body ?? {});
    return res.status(200).json(buildApiResponse('Shift updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update shift', null, [String(error)]));
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.deleteShift(id(req));
    return res.status(200).json(buildApiResponse('Shift deleted successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to delete shift', null, [String(error)]));
  }
};

export const getLeavePolicy = async (_req: Request, res: Response) => {
  try {
    const data = await settingsService.getLeavePolicy();
    return res.status(200).json(buildApiResponse('Leave policy retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve leave policy', null, [String(error)]));
  }
};

export const updateLeavePolicy = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updateLeavePolicy(req.body ?? {});
    return res.status(200).json(buildApiResponse('Leave policy updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update leave policy', null, [String(error)]));
  }
};

export const getPayrollSettings = async (_req: Request, res: Response) => {
  try {
    const data = await settingsService.getPayrollSettings();
    return res.status(200).json(buildApiResponse('Payroll settings retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve payroll settings', null, [String(error)]));
  }
};

export const updatePayrollSettings = async (req: Request, res: Response) => {
  try {
    const data = await settingsService.updatePayrollSettings(req.body ?? {});
    return res.status(200).json(buildApiResponse('Payroll settings updated successfully', data));
  } catch (error) {
    return res.status(400).json(buildApiResponse('Failed to update payroll settings', null, [String(error)]));
  }
};

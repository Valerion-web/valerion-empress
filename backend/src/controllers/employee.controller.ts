import type { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const employeeService = new EmployeeService();

export const listEmployees = async (_req: Request, res: Response) => {
  const data = await employeeService.listEmployees();
  res.json(buildApiResponse('Employees fetched', data));
};

export const getEmployee = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await employeeService.getEmployee(id);
  res.json(buildApiResponse('Employee fetched', data));
};

export const updateEmployee = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await employeeService.updateEmployee(id, req.body);
  res.json(buildApiResponse('Employee updated', data));
};

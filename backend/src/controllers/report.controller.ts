import type { Request, Response } from 'express';
import { reportService } from '../services/report.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const parseIntOr = (v: any, def = 1) => (v ? parseInt(String(v), 10) : def);

async function sendCSV(res: Response, filename: string, rows: any[], headers: string[]) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  const out = [headers.join(',')];
  for (const r of rows) out.push(headers.map(h => (r[h] ?? '')?.toString().replace(/\n/g, ' ').replace(/,/g, ' ')).join(','));
  res.send(out.join('\n'));
}

export const employees = async (req: Request, res: Response) => {
  try { const data = await reportService.employees(req.query); return res.json(buildApiResponse('Employees report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const attendance = async (req: Request, res: Response) => {
  try { const data = await reportService.attendance(req.query); return res.json(buildApiResponse('Attendance report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const leaves = async (req: Request, res: Response) => {
  try { const data = await reportService.leaves(req.query); return res.json(buildApiResponse('Leave report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const payroll = async (req: Request, res: Response) => {
  try { const data = await reportService.payroll(req.query); return res.json(buildApiResponse('Payroll report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const trainings = async (req: Request, res: Response) => {
  try { const data = await reportService.trainings(req.query); return res.json(buildApiResponse('Training report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const recruitment = async (req: Request, res: Response) => {
  try { const data = await reportService.recruitment(req.query); return res.json(buildApiResponse('Recruitment report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const assets = async (req: Request, res: Response) => {
  try { const data = await reportService.assets(req.query); return res.json(buildApiResponse('Asset report', data)); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

// Exports
export const exportEmployeesCSV = async (req: Request, res: Response) => {
  try { const data = await reportService.employees(req.query); const rows = data.items.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, department: u.department?.name ?? '' })); await sendCSV(res, 'employees', rows, ['id', 'firstName', 'lastName', 'email', 'department']); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const exportEmployeesExcel = async (req: Request, res: Response) => {
  try {
    const excelModule: any = await import('exceljs');
    const data = await reportService.employees(req.query);
    let WorkbookCtor: any = excelModule.Workbook ?? (excelModule.default && excelModule.default.Workbook) ?? excelModule.default ?? excelModule.Workbook;
    if (typeof WorkbookCtor !== 'function') throw new Error('Workbook constructor not found');
    const wb = new WorkbookCtor();
    const ws = wb.addWorksheet('Employees');
    ws.addRow(['ID', 'First Name', 'Last Name', 'Email', 'Department']);
    data.items.forEach((u: any) => ws.addRow([u.id, u.firstName, u.lastName, u.email, u.department?.name ?? '']));
    const buffer = await wb.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.xlsx"');
    res.send(Buffer.from(buffer));
  } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const exportEmployeesPDF = async (req: Request, res: Response) => {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const data = await reportService.employees(req.query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.pdf"');
    const doc = new PDFDocument({ margin: 30 });
    doc.pipe(res);
    doc.fontSize(18).text('Employees Report', { align: 'center' });
    doc.moveDown();
    data.items.forEach((u: any) => { doc.fontSize(10).text(`${u.id} - ${u.firstName} ${u.lastName} <${u.email}> - ${u.department?.name ?? ''}`); });
    doc.end();
  } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

// Generic export patterns for other report types (CSV only for brevity)
export const exportGenericCSV = async (req: Request, res: Response, type: string) => {
  try {
    let data: any;
    switch (type) {
      case 'attendance': data = await reportService.attendance(req.query); break;
      case 'leaves': data = await reportService.leaves(req.query); break;
      case 'payroll': data = await reportService.payroll(req.query); break;
      case 'trainings': data = await reportService.trainings(req.query); break;
      case 'recruitment': data = await reportService.recruitment(req.query); break;
      case 'assets': data = await reportService.assets(req.query); break;
      default: return res.status(400).json(buildApiResponse('Unknown report type'));
    }
    const items = data.items || data;
    if (!Array.isArray(items)) return res.status(500).json(buildApiResponse('No items to export'));
    const headers = Object.keys(items[0] ?? {});
    await sendCSV(res, `${type}`, items.map((it: any) => ({ ...it })), headers);
  } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

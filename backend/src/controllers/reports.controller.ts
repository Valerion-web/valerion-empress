import type { Request, Response } from 'express';
import { reportsService, type ReportType } from '../services/reports.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const getReportType = (value: any): ReportType => {
  const type = String(value ?? 'attendance');
  return ['attendance', 'leave', 'payroll', 'employees', 'recruitment', 'performance'].includes(type)
    ? (type as ReportType)
    : 'attendance';
};

const handleReport = async (res: Response, type: ReportType, filters: any) => {
  const data = await reportsService[type](filters);
  return res.json(buildApiResponse(`${type} report retrieved successfully`, data));
};

const sendCsv = (res: Response, filename: string, rows: any[], headers: string[]) => {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      headers
        .map((header) => {
          const value = row[header] ?? '';
          return String(value).replace(/\n/g, ' ').replace(/,/g, ' ');
        })
        .join(','),
    );
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(lines.join('\n'));
};

const exportGenericCsv = async (req: Request, res: Response) => {
  try {
    const type = getReportType(req.params.type);
    const data = await reportsService[type](req.query);
    const rows = Array.isArray(data.items) ? data.items : [];
    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['date', 'status', 'total'];
    sendCsv(res, `${type}-report`, rows, headers);
  } catch (error) {
    res.status(500).json(buildApiResponse('Failed to export report', null, [String(error)]));
  }
};

const exportGenericExcel = async (req: Request, res: Response) => {
  try {
    const type = getReportType(req.params.type);
    const data = await reportsService[type](req.query);
    const rows = Array.isArray(data.items) ? data.items : [];
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Report');
    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['date', 'status', 'total'];
    sheet.addRow(headers);
    for (const row of rows) sheet.addRow(headers.map((header) => row[header] ?? ''));
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json(buildApiResponse('Failed to export report', null, [String(error)]));
  }
};

const exportGenericPdf = async (req: Request, res: Response) => {
  try {
    const type = getReportType(req.params.type);
    const data = await reportsService[type](req.query);
    const rows = Array.isArray(data.items) ? data.items : [];
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 28 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    doc.pipe(res);
    doc.fontSize(18).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
    doc.moveDown();

    if (rows.length === 0) {
      doc.text('No data available for the selected filters.');
      doc.end();
      return;
    }

    const headers = Object.keys(rows[0]);
    doc.fontSize(10);
    const tableRows = rows.map((row) => headers.map((header) => String(row[header] ?? '')));
    doc.table = ((doc as any).table ?? null);
    if (typeof (doc as any).table === 'function') {
      (doc as any).table({
        headers,
        rows: tableRows,
      });
    } else {
      rows.forEach((row) => {
        doc.text(headers.map((header) => `${header}: ${row[header] ?? ''}`).join(' | '));
      });
    }
    doc.end();
  } catch (error) {
    res.status(500).json(buildApiResponse('Failed to export report', null, [String(error)]));
  }
};

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const data = await reportsService.summary(req.query);
    return res.json(buildApiResponse('Dashboard summary retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve dashboard summary', null, [String(error)]));
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => handleReport(res, 'attendance', req.query);
export const getLeaveReport = async (req: Request, res: Response) => handleReport(res, 'leave', req.query);
export const getPayrollReport = async (req: Request, res: Response) => handleReport(res, 'payroll', req.query);
export const getEmployeeReport = async (req: Request, res: Response) => handleReport(res, 'employees', req.query);
export const getRecruitmentReport = async (req: Request, res: Response) => handleReport(res, 'recruitment', req.query);
export const getPerformanceReport = async (req: Request, res: Response) => handleReport(res, 'performance', req.query);

export const exportReportCsv = exportGenericCsv;
export const exportReportExcel = exportGenericExcel;
export const exportReportPdf = exportGenericPdf;

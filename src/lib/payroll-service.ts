import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api").replace(
  /\/$/,
  "",
);
const AUTH_STORAGE_KEY = "valerion-payroll-session";

export type PayrollRole = "hr" | "employee";

export interface PayrollSession {
  role: PayrollRole;
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
}

export interface PayrollUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  month: number;
  year: number;
  paymentStatus: string;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    department?: { name?: string } | null;
  } | null;
}

export interface PayrollListResponse {
  payrolls: PayrollRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface PayrollDashboardSummary {
  totalPayroll: number;
  pendingPayrolls: number;
  averageSalary: number;
  maxSalary: number;
  minSalary: number;
  monthlySummary: Array<{ month: string; total: number }>;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);

function getStoredSession(): PayrollSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PayrollSession) : null;
  } catch {
    return null;
  }
}

function persistSession(session: PayrollSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function getAuthHeaders() {
  const session = getStoredSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

export function clearPayrollSession() {
  persistSession(null);
}

export function getStoredPayrollSession() {
  return getStoredSession();
}

export async function signInPayroll(role: PayrollRole): Promise<PayrollUser> {
  const credentials =
    role === "hr"
      ? { email: "hradmin@valerion.local", password: "Admin@123" }
      : { email: "employee@valerion.local", password: "Admin@123" };

  const response = await api.post("/auth/login", credentials);
  const payload = response.data?.data;
  const user = payload?.user as PayrollUser;
  const session: PayrollSession = {
    role,
    token: payload?.accessToken,
    refreshToken: payload?.refreshToken,
    userId: user.id,
    userName: user.name,
  };

  persistSession(session);
  return user;
}

export async function getPayrollDashboard(
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
): Promise<PayrollDashboardSummary> {
  const response = await api.get("/payroll", {
    headers: getAuthHeaders(),
    params: { page: 1, limit: 100, month, year },
  });

  const payload = response.data?.data as PayrollListResponse | undefined;
  const payrolls = payload?.payrolls ?? [];

  const totals = payrolls.map((item) => item.netSalary);
  const totalPayroll = totals.reduce((sum, value) => sum + value, 0);
  const pendingPayrolls = payrolls.filter((item) => item.paymentStatus === "PENDING").length;
  const averageSalary = totals.length ? totalPayroll / totals.length : 0;
  const maxSalary = totals.length ? Math.max(...totals) : 0;
  const minSalary = totals.length ? Math.min(...totals) : 0;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlySummary = monthNames.slice(0, 6).map((name, index) => {
    const currentMonth = (new Date().getMonth() + 1 - (5 - index) + 12) % 12 || 12;
    const currentYear =
      new Date().getFullYear() - (index >= 12 - (new Date().getMonth() + 1) ? 1 : 0);
    const monthRecords = payrolls.filter(
      (item) => item.month === currentMonth && item.year === currentYear,
    );
    return {
      month: name,
      total: monthRecords.reduce((sum, item) => sum + item.netSalary, 0),
    };
  });

  return {
    totalPayroll,
    pendingPayrolls,
    averageSalary,
    maxSalary,
    minSalary,
    monthlySummary,
  };
}

export async function getPayrollList(options: {
  page?: number;
  limit?: number;
  search?: string;
  month?: string;
  year?: string;
  department?: string;
}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const search = options.search?.trim();
  const month = options.month?.trim();
  const year = options.year?.trim();

  const response = await api.get("/payroll", {
    headers: getAuthHeaders(),
    params: {
      page,
      limit,
      ...(search ? { q: search } : {}),
      ...(month ? { month: Number(month) } : {}),
      ...(year ? { year: Number(year) } : {}),
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  const payload = response.data?.data as PayrollListResponse | undefined;
  return payload ?? { payrolls: [], total: 0, page, limit };
}

export async function getMyPayroll(
  userId: string,
  page = 1,
  limit = 10,
): Promise<PayrollListResponse> {
  const response = await api.get(`/payroll/employee/${userId}`, {
    headers: getAuthHeaders(),
    params: { page, limit, sortBy: "createdAt", sortOrder: "desc" },
  });

  const payload = response.data?.data as PayrollListResponse | undefined;
  return payload ?? { payrolls: [], total: 0, page, limit };
}

export async function getPayrollById(id: string) {
  const response = await api.get(`/payroll/${id}`, { headers: getAuthHeaders() });
  return response.data?.data;
}

export async function createPayrollRecord(data: {
  userId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  month: number;
  year: number;
  paymentStatus: string;
  paymentDate?: string;
}) {
  const response = await api.post(
    "/payroll",
    {
      userId: data.userId,
      basicSalary: Number(data.basicSalary),
      allowances: Number(data.allowances),
      deductions: Number(data.deductions),
      bonus: Number(data.bonus),
      month: Number(data.month),
      year: Number(data.year),
      paymentStatus: data.paymentStatus.toUpperCase(),
      paymentDate: data.paymentDate ?? new Date().toISOString(),
    },
    { headers: getAuthHeaders() },
  );
  return response.data?.data;
}

export async function updatePayrollRecord(
  id: string,
  changes: {
    basicSalary?: number;
    allowances?: number;
    deductions?: number;
    bonus?: number;
    paymentStatus?: string;
  },
) {
  const response = await api.put(
    `/payroll/${id}`,
    {
      ...(changes.basicSalary !== undefined ? { basicSalary: Number(changes.basicSalary) } : {}),
      ...(changes.allowances !== undefined ? { allowances: Number(changes.allowances) } : {}),
      ...(changes.deductions !== undefined ? { deductions: Number(changes.deductions) } : {}),
      ...(changes.bonus !== undefined ? { bonus: Number(changes.bonus) } : {}),
      ...(changes.paymentStatus ? { paymentStatus: changes.paymentStatus.toUpperCase() } : {}),
    },
    { headers: getAuthHeaders() },
  );
  return response.data?.data;
}

export async function deletePayrollRecord(id: string) {
  const response = await api.delete(`/payroll/${id}`, { headers: getAuthHeaders() });
  return response.data?.data;
}

export async function processPayrollRecord(id: string) {
  return updatePayrollRecord(id, { paymentStatus: "PAID" });
}

export function exportPayrollCsv(records: PayrollRecord[]) {
  const header = [
    "Employee",
    "Month",
    "Year",
    "Basic Salary",
    "Allowances",
    "Deductions",
    "Bonus",
    "Net Salary",
    "Status",
  ];
  const rows = records.map((record) => [
    `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim(),
    record.month,
    record.year,
    record.basicSalary,
    record.allowances,
    record.deductions,
    record.bonus,
    record.netSalary,
    record.paymentStatus,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "payroll-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportPayrollExcel(records: PayrollRecord[]) {
  const { default: XLSX } = await import("xlsx");
  const workbook = new XLSX.WorkBook();
  const worksheet = workbook.addWorksheet("Payroll");
  worksheet.addRow([
    "Employee",
    "Month",
    "Year",
    "Basic Salary",
    "Allowances",
    "Deductions",
    "Bonus",
    "Net Salary",
    "Status",
  ]);
  records.forEach((record) => {
    worksheet.addRow([
      `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim(),
      record.month,
      record.year,
      record.basicSalary,
      record.allowances,
      record.deductions,
      record.bonus,
      record.netSalary,
      record.paymentStatus,
    ]);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "payroll-report.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPayrollPdf(records: PayrollRecord[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Payroll export", 14, 16);
  autoTable(doc, {
    head: [["Employee", "Month", "Year", "Net Salary", "Status"]],
    body: records.map((record) => [
      `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim(),
      record.month,
      record.year,
      record.netSalary,
      record.paymentStatus,
    ]),
    startY: 24,
  });
  doc.save("payroll-report.pdf");
}

import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
const AUTH_STORAGE_KEY = "valerion-attendance-session";

export type AttendanceRole = "hr" | "employee";

export interface AuthSession {
  role: AttendanceRole;
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
}

export interface AttendanceUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: { name?: string } | null;
    department?: { name?: string } | null;
  } | null;
}

export interface AttendanceListResponse {
  attendances: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  month: number;
  year: number;
  monthly: Array<{ month: string; present: number; absent: number; late: number; total: number }>;
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
  }
);

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
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

export function clearAttendanceSession() {
  persistSession(null);
}

export async function signInAttendance(role: AttendanceRole): Promise<AttendanceUser> {
  const credentials =
    role === "hr"
      ? { email: "hradmin@valerion.local", password: "Admin@123" }
      : { email: "employee@valerion.local", password: "Admin@123" };

  const response = await api.post("/auth/login", credentials);
  const payload = response.data?.data;
  const user = payload?.user as AttendanceUser;
  const session: AuthSession = {
    role,
    token: payload?.accessToken,
    refreshToken: payload?.refreshToken,
    userId: user.id,
    userName: user.name,
  };

  persistSession(session);
  return user;
}

export async function getAttendanceDashboard(month = new Date().getMonth() + 1, year = new Date().getFullYear()): Promise<DashboardSummary> {
  const response = await api.get("/attendance/report", {
    headers: getAuthHeaders(),
    params: { month, year },
  });

  const report = response.data?.data ?? {};
  const attendances: AttendanceRecord[] = Array.isArray(report.attendances) ? report.attendances : [];
  const present = attendances.filter((item) => item.status === "PRESENT").length;
  const absent = attendances.filter((item) => item.status === "ABSENT").length;
  const late = attendances.filter((item) => item.status === "LATE").length;

  const monthly = attendances.reduce<Array<{ month: string; present: number; absent: number; late: number; total: number }>>((acc, item) => {
    const date = new Date(item.date);
    const label = date.toLocaleString("en", { month: "short" });
    const existing = acc.find((entry) => entry.month === label);
    if (existing) {
      existing.present += item.status === "PRESENT" ? 1 : 0;
      existing.absent += item.status === "ABSENT" ? 1 : 0;
      existing.late += item.status === "LATE" ? 1 : 0;
      existing.total += 1;
      return acc;
    }
    acc.push({ month: label, present: item.status === "PRESENT" ? 1 : 0, absent: item.status === "ABSENT" ? 1 : 0, late: item.status === "LATE" ? 1 : 0, total: 1 });
    return acc;
  }, []);

  return {
    present,
    absent,
    late,
    total: attendances.length,
    month,
    year,
    monthly: monthly.length ? monthly : [{ month: "Current", present, absent, late, total: attendances.length }],
  };
}

export async function getAttendanceList(options: { page?: number; limit?: number; search?: string; date?: string; status?: string }) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const search = options.search?.trim();
  const date = options.date?.trim();
  const status = options.status?.trim();

  const response = search
    ? await api.get("/attendance/search", {
        headers: getAuthHeaders(),
        params: { q: search, page, limit },
      })
    : await api.get("/attendance/filter", {
        headers: getAuthHeaders(),
        params: {
          page,
          limit,
          sortBy: "date",
          sortOrder: "desc",
          ...(date ? { date } : {}),
          ...(status && status !== "all" ? { status: status.toUpperCase() } : {}),
        },
      });

  const payload = response.data?.data as AttendanceListResponse | undefined;
  return payload ?? { attendances: [], total: 0, page, limit };
}

export async function getMyAttendance(userId: string, page = 1, limit = 10): Promise<AttendanceListResponse> {
  const response = await api.get(`/attendance/employee/${userId}`, {
    headers: getAuthHeaders(),
    params: { page, limit, sortBy: "date", sortOrder: "desc" },
  });

  const payload = response.data?.data as AttendanceListResponse | undefined;
  return payload ?? { attendances: [], total: 0, page, limit };
}

export async function checkInAttendance(location?: string) {
  const response = await api.post(
    "/attendance/check-in",
    { location: location ?? "Office" },
    { headers: getAuthHeaders() }
  );
  return response.data?.data;
}

export async function checkOutAttendance(id: string, location?: string) {
  const response = await api.post(
    `/attendance/check-out/${id}`,
    { location: location ?? "Office" },
    { headers: getAuthHeaders() }
  );
  return response.data?.data;
}

export async function updateAttendanceRecord(id: string, changes: { status?: string; location?: string }) {
  const response = await api.put(`/attendance/${id}`, changes, { headers: getAuthHeaders() });
  return response.data?.data;
}

export async function deleteAttendanceRecord(id: string) {
  const response = await api.delete(`/attendance/${id}`, { headers: getAuthHeaders() });
  return response.data?.data;
}

export function exportAttendanceCsv(records: AttendanceRecord[]) {
  const header = ["Employee", "Department", "Date", "Status", "Check In", "Check Out", "Location"];
  const rows = records.map((record) => {
    const employee = `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim();
    const department = record.user?.department?.name ?? "Unassigned";
    return [employee, department, record.date, record.status, record.checkIn ?? "—", record.checkOut ?? "—", record.location ?? "—"];
  });
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "attendance-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportAttendanceExcel(records: AttendanceRecord[]) {
  const { default: XLSX } = await import("xlsx");
  const workbook = new XLSX.WorkBook();
  const worksheet = workbook.addWorksheet("Attendance");
  worksheet.addRow(["Employee", "Department", "Date", "Status", "Check In", "Check Out", "Location"]);
  records.forEach((record) => {
    worksheet.addRow([
      `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim(),
      record.user?.department?.name ?? "Unassigned",
      record.date,
      record.status,
      record.checkIn ?? "—",
      record.checkOut ?? "—",
      record.location ?? "—",
    ]);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "attendance-report.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAttendancePdf(records: AttendanceRecord[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Attendance export", 14, 16);
  autoTable(doc, {
    head: [["Employee", "Department", "Date", "Status", "Check In", "Check Out", "Location"]],
    body: records.map((record) => [
      `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim(),
      record.user?.department?.name ?? "Unassigned",
      record.date,
      record.status,
      record.checkIn ?? "—",
      record.checkOut ?? "—",
      record.location ?? "—",
    ]),
    startY: 24,
  });
  doc.save("attendance-report.pdf");
}

export function getStoredAttendanceSession() {
  return getStoredSession();
}

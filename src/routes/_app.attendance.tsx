import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Clock3, Download, Edit3, Fingerprint, LogIn, LogOut, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LuxeCard, StatCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { useApp } from "@/lib/app-context";
import {
  checkInAttendance,
  checkOutAttendance,
  clearAttendanceSession,
  deleteAttendanceRecord,
  exportAttendanceCsv,
  exportAttendanceExcel,
  exportAttendancePdf,
  getAttendanceDashboard,
  getAttendanceList,
  getMyAttendance,
  getStoredAttendanceSession,
  signInAttendance,
  updateAttendanceRecord,
  type AttendanceRecord,
} from "@/lib/attendance-service";

export const Route = createFileRoute("/_app/attendance")({ component: Attendance });

function Attendance() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState("PRESENT");
  const [editLocation, setEditLocation] = useState("");
  const [authReady, setAuthReady] = useState(Boolean(getStoredAttendanceSession()));

  const effectiveRole = useMemo(() => {
    if (user?.role === "hr" || user?.role === "admin") return "hr";
    return "employee";
  }, [user]);

  const signInMutation = useMutation({
    mutationFn: () => signInAttendance(effectiveRole),
    onSuccess: () => {
      setAuthReady(true);
      toast.success(`Signed in as ${effectiveRole === "hr" ? "HR" : "Employee"}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!authReady && !signInMutation.isPending) {
      signInMutation.mutate();
    }
  }, [authReady, signInMutation]);

  useEffect(() => {
    return () => {
      clearAttendanceSession();
    };
  }, []);

  const dashboardQuery = useQuery({
    queryKey: ["attendance-dashboard", effectiveRole],
    queryFn: () => getAttendanceDashboard(),
    enabled: authReady,
  });

  const listQuery = useQuery({
    queryKey: ["attendance-list", page, search, dateFilter, statusFilter],
    queryFn: () => getAttendanceList({ page, limit: 8, search, date: dateFilter, status: statusFilter }),
    enabled: authReady && effectiveRole === "hr",
  });

  const myAttendanceQuery = useQuery({
    queryKey: ["my-attendance", page],
    queryFn: () => getMyAttendance(getStoredAttendanceSession()?.userId ?? "", page, 8),
    enabled: authReady && effectiveRole === "employee",
  });

  const checkInMutation = useMutation({
    mutationFn: (location: string) => checkInAttendance(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
      toast.success("Checked in successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ id, location }: { id: string; location: string }) => checkOutAttendance(id, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
      toast.success("Checked out successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, status, location }: { id: string; status: string; location: string }) => updateAttendanceRecord(id, { status, location }),
    onSuccess: () => {
      setEditingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
      toast.success("Attendance updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAttendanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
      toast.success("Attendance record deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dashboard = dashboardQuery.data;
  const records = effectiveRole === "hr" ? listQuery.data?.attendances ?? [] : myAttendanceQuery.data?.attendances ?? [];
  const totalRecords = effectiveRole === "hr" ? listQuery.data?.total ?? 0 : myAttendanceQuery.data?.total ?? 0;
  const isLoading = signInMutation.isPending || (!authReady && !dashboardQuery.data) || (effectiveRole === "hr" ? listQuery.isLoading : myAttendanceQuery.isLoading);

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesDepartment = departmentFilter === "all" || (record.user?.department?.name ?? "Unassigned") === departmentFilter;
      const matchesStatus = statusFilter === "all" || record.status.toLowerCase() === statusFilter;
      const matchesDate = !dateFilter || record.date.startsWith(dateFilter);
      const matchesSearch = !search || `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase());
      return matchesDepartment && matchesStatus && matchesDate && matchesSearch;
    });
  }, [records, departmentFilter, statusFilter, dateFilter, search]);

  const startEditing = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditLocation(record.location ?? "");
  };

  const submitEdit = () => {
    if (!editingRecord) return;
    editMutation.mutate({ id: editingRecord.id, status: editStatus, location: editLocation });
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Delete this attendance record?")) {
      deleteMutation.mutate(id);
    }
  };

  const summary = [
    { label: "Total present", value: dashboard?.present ?? 0, accent: "success" as const, icon: <LogIn className="size-5" /> },
    { label: "Total absent", value: dashboard?.absent ?? 0, accent: "warning" as const, icon: <LogOut className="size-5" /> },
    { label: "Late arrivals", value: dashboard?.late ?? 0, accent: "gold" as const, icon: <Clock3 className="size-5" /> },
    { label: "Monthly stats", value: `${dashboard?.month ?? new Date().getMonth() + 1}/${dashboard?.year ?? new Date().getFullYear()}`, accent: "info" as const, icon: <CalendarDays className="size-5" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Time & attendance"
        title="Attendance Management"
        subtitle="Track daily presence, manage attendance records, and export staff reports from the connected HR backend."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportAttendanceCsv(visibleRecords)}
              className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted inline-flex items-center gap-2"
            >
              <Download className="size-4" /> CSV
            </button>
            <button
              onClick={() => exportAttendanceExcel(visibleRecords)}
              className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted inline-flex items-center gap-2"
            >
              <Download className="size-4" /> Excel
            </button>
            <button
              onClick={() => exportAttendancePdf(visibleRecords)}
              className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted inline-flex items-center gap-2"
            >
              <Download className="size-4" /> PDF
            </button>
          </div>
        }
      />

      {dashboardQuery.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{dashboardQuery.error?.message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item, index) => (
          <StatCard key={item.label} index={index} label={item.label} value={item.value} icon={item.icon} accent={item.accent} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <LuxeCard>
          <SectionTitle title="Monthly attendance trend" description="Present, absent, and late arrivals across the month" />
          <div className="h-72">
            {dashboard?.monthly?.length ? (
              <ResponsiveContainer>
                <BarChart data={dashboard.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="present" fill="var(--success)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="late" fill="var(--warning)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No monthly trend data yet.</div>
            )}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title={effectiveRole === "hr" ? "HR actions" : "My attendance"} description={effectiveRole === "hr" ? "Review and manage the team’s attendance records" : "Check in, check out, and track your own history"} />
          {effectiveRole === "hr" ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border p-3">Use the filters and table below to review all attendance records, update statuses, or remove outdated entries.</div>
              <div className="rounded-xl border p-3">Export reports as CSV, Excel, or PDF for payroll and compliance workflows.</div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                disabled={checkInMutation.isPending}
                onClick={() => checkInMutation.mutate("Office")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"
              >
                <FingerPrint className="size-4" /> {checkInMutation.isPending ? "Checking in..." : "Check in"}
              </button>
              <button
                disabled={checkOutMutation.isPending || !records[0]?.id}
                onClick={() => checkOutMutation.mutate({ id: records[0]?.id ?? "", location: "Office" })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
              >
                <LogOut className="size-4" /> {checkOutMutation.isPending ? "Checking out..." : "Check out"}
              </button>
              <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                {records[0] ? `Last record: ${records[0].status} • ${records[0].date}` : "No attendance recorded yet for today."}
              </div>
            </div>
          )}
        </LuxeCard>
      </div>

      <LuxeCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle title={effectiveRole === "hr" ? "Attendance list" : "My attendance history"} description={effectiveRole === "hr" ? "Search employees, filter by day or status, and manage records" : "Recent attendance records for your account"} />
          {effectiveRole === "hr" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-10 rounded-xl border bg-background pl-9 pr-3 text-sm" placeholder="Search employee" />
              </label>
              <input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1); }} className="h-10 rounded-xl border bg-background px-3 text-sm" />
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-10 rounded-xl border bg-background px-3 text-sm">
                <option value="all">All statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <select value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setPage(1); }} className="h-10 rounded-xl border bg-background px-3 text-sm">
                <option value="all">All departments</option>
                <option value="Haute Couture">Haute Couture</option>
                <option value="Leather Atelier">Leather Atelier</option>
                <option value="Retail & Boutique">Retail & Boutique</option>
                <option value="Marketing & Brand">Marketing & Brand</option>
                <option value="People & Culture">People & Culture</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading attendance data…</div>
        ) : visibleRecords.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Check-in</th>
                  <th className="px-3 py-3">Check-out</th>
                  <th className="px-3 py-3">Location</th>
                  {effectiveRole === "hr" ? <th className="px-3 py-3">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{record.user ? `${record.user.firstName} ${record.user.lastName}` : "Employee"}</div>
                          <div className="text-xs text-muted-foreground">{record.user?.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3"><Chip tone={record.status === "ABSENT" ? "destructive" : record.status === "LATE" ? "warning" : "success"}>{record.status}</Chip></td>
                    <td className="px-3 py-3">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "—"}</td>
                    <td className="px-3 py-3">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "—"}</td>
                    <td className="px-3 py-3">{record.location ?? "—"}</td>
                    {effectiveRole === "hr" ? (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditing(record)} className="rounded-lg border p-2 hover:bg-muted"><Edit3 className="size-4" /></button>
                          <button onClick={() => deleteRecord(record.id)} className="rounded-lg border p-2 hover:bg-muted"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Showing {visibleRecords.length} of {totalRecords} records</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm">Page {page}</span>
            <button disabled={visibleRecords.length < 8} onClick={() => setPage((value) => value + 1)} className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </LuxeCard>

      {editingRecord ? (
        <LuxeCard>
          <SectionTitle title="Edit attendance record" description="Update the status or location for this attendance entry" />
          <div className="grid gap-3 md:grid-cols-3">
            <select value={editStatus} onChange={(event) => setEditStatus(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm">
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half day</option>
              <option value="LEAVE">Leave</option>
            </select>
            <input value={editLocation} onChange={(event) => setEditLocation(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm" placeholder="Location" />
            <div className="flex gap-2">
              <button onClick={submitEdit} disabled={editMutation.isPending} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Save</button>
              <button onClick={() => setEditingRecord(null)} className="h-10 rounded-xl border px-4 text-sm">Cancel</button>
            </div>
          </div>
        </LuxeCard>
      ) : null}
    </div>
  );
}